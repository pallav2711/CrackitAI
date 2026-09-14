/**
 * Voice Interview Session — Whisper STT + GPT-4o + TTS
 *
 * Flow per turn:
 *   1. User holds / auto-records → audio blob captured
 *   2. POST /interview/voice/turn with audio → server returns { transcript, response, audioBase64 }
 *   3. Play AI audio response
 *   4. Repeat until time runs out or AI ends interview
 *   5. POST /interview/voice/end → navigate to results
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Loader2, AlertCircle, Volume2, VolumeX, RefreshCw, ChevronDown } from 'lucide-react';
import api from '../services/api';

/* ─── Animated Orb ────────────────────────────────────────────────────────── */
function Orb({ state }) {
  const isAI      = state === 'ai_speaking';
  const isUser    = state === 'recording';
  const isProcess = state === 'processing';

  return (
    <div className="relative w-44 h-44 flex items-center justify-center select-none">
      {/* Outer pulse ring */}
      <div className={`absolute inset-0 border-4 transition-all duration-300 ${
        isAI   ? 'border-nb-yellow scale-110' :
        isUser ? 'border-white/50 scale-105' :
                 'border-white/10'
      }`} />
      <div className={`absolute inset-5 border-2 transition-all duration-500 ${
        isAI ? 'border-nb-yellow/40' : 'border-white/5'
      }`} />

      {/* Core */}
      <div className={`w-24 h-24 border-4 border-nb-black flex items-center justify-center transition-all duration-200 ${
        isAI      ? 'bg-nb-yellow scale-110' :
        isUser    ? 'bg-white scale-105' :
        isProcess ? 'bg-white/20' :
                    'bg-white/10'
      }`}>
        {isProcess ? (
          <Loader2 className="w-8 h-8 text-nb-yellow animate-spin" />
        ) : (
          /* Animated bars */
          <div className="flex items-center gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-none transition-all duration-75 ${
                  isAI   ? 'bg-nb-black' :
                  isUser ? 'bg-nb-black/70' :
                           'bg-white/20'
                }`}
                style={{
                  height: (isAI || isUser)
                    ? `${6 + Math.abs(Math.sin(i * 1.2 + Date.now() / 150)) * 18}px`
                    : '6px',
                  transition: 'height 0.08s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Countdown Timer ─────────────────────────────────────────────────────── */
function Timer({ elapsed, cap }) {
  const rem    = Math.max(cap - elapsed, 0);
  const m      = String(Math.floor(rem / 60)).padStart(2, '0');
  const s      = String(rem % 60).padStart(2, '0');
  const pct    = cap > 0 ? (elapsed / cap) * 100 : 0;
  const danger = pct > 80;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-3xl font-black font-mono tabular-nums ${danger ? 'text-nb-red' : 'text-nb-yellow'}`}>
        {m}:{s}
      </span>
      <div className="w-36 h-2.5 border-2 border-white/20 bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ${danger ? 'bg-nb-red' : 'bg-nb-yellow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">remaining</span>
    </div>
  );
}

/* ─── Transcript Feed ─────────────────────────────────────────────────────── */
function TranscriptFeed({ transcript, expanded, onToggle }) {
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

  if (transcript.length === 0) return null;

  return (
    <div className="w-full max-w-sm">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[10px] font-mono text-white/30 uppercase tracking-widest mb-2 hover:text-white/60 transition-colors"
      >
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        Transcript ({transcript.length})
      </button>
      {expanded && (
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {transcript.map((item, i) => (
            <div key={i} className={`text-xs font-mono leading-relaxed px-3 py-2 border-l-2 ${
              item.role === 'assistant'
                ? 'border-nb-yellow text-nb-yellow/80 bg-nb-yellow/5'
                : 'border-white/30 text-white/60 bg-white/5'
            }`}>
              <span className="text-[9px] uppercase tracking-widest opacity-50 block mb-0.5">
                {item.role === 'assistant' ? 'Interviewer' : 'You'}
              </span>
              {item.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
const PHASE = {
  INIT:        'init',         // setting up session
  IDLE:        'idle',         // waiting for user to speak
  RECORDING:   'recording',   // mic is active, recording
  PROCESSING:  'processing',  // sending to server
  AI_SPEAKING: 'ai_speaking', // playing AI audio
  ENDING:      'ending',      // posting to /end
  ERROR:        'error',
};

// Silence detection config
const SILENCE_THRESHOLD  = 0.01;  // RMS below this = silence
const SILENCE_DURATION_MS = 1800; // stop recording after 1.8s of silence
const MIN_RECORD_MS       = 800;  // don't cut off before 0.8s

export default function VoiceInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const setup    = location.state || {};

  const [phase, setPhase]         = useState(PHASE.INIT);
  const [status, setStatus]       = useState('Setting up your interview…');
  const [elapsed, setElapsed]     = useState(0);
  const [cap, setCap]             = useState(420);
  const [error, setError]         = useState(null);
  const [muted, setMuted]         = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [transcript, setTranscript]     = useState([]);
  const [txExpanded, setTxExpanded]     = useState(false);
  const [interviewId, setInterviewId]   = useState(null);
  const [currentText, setCurrentText]   = useState(''); // last AI line displayed

  const timerRef      = useRef(null);
  const startRef      = useRef(null);
  const interviewRef  = useRef(null);  // mirror of interviewId for closures
  const elapsedRef    = useRef(0);
  const capRef        = useRef(420);
  const phaseRef      = useRef(PHASE.INIT);
  const mediaRecRef   = useRef(null);
  const streamRef     = useRef(null);
  const chunksRef     = useRef([]);
  const silenceTimer  = useRef(null);
  const analyserRef   = useRef(null);
  const silenceRafRef = useRef(null);
  const recordStartTs = useRef(0);
  const audioCtxRef   = useRef(null);
  const currentAudio  = useRef(null);

  // Sync refs
  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p); };

  // Guard
  useEffect(() => {
    if (!setup.role) { navigate('/interview/setup'); return; }
    initSession();
    return () => teardown();
  }, []); // eslint-disable-line

  // Timer
  useEffect(() => {
    if ([PHASE.IDLE, PHASE.RECORDING, PHASE.AI_SPEAKING, PHASE.PROCESSING].includes(phase)) {
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(e => {
          if (e + 1 >= capRef.current) {
            clearInterval(timerRef.current);
            endSession(true);
          }
          return e + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line

  /* ── Init: create server session ────────────────────────────────────────── */
  const initSession = async () => {
    try {
      setStatus('Starting session…');
      const { data } = await api.post('/interview/voice/start', {
        role: setup.role,
        companyType: setup.companyType,
        interviewType: setup.interviewType,
        difficulty: setup.difficulty,
        durationMinutes: setup.durationMinutes,
      });
      if (!data.success) throw new Error(data.message || 'Failed to start session');

      interviewRef.current = data.interviewId;
      capRef.current = data.sessionCapSeconds || 420;
      setInterviewId(data.interviewId);
      setCap(data.sessionCapSeconds || 420);
      startRef.current = Date.now();

      // Get mic access
      setStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // Set up AudioContext + Analyser for silence detection
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioCtx;
      const source  = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setStatus('Ready — click the mic to start speaking');
      setPhaseSync(PHASE.IDLE);

      // Auto-trigger first AI turn (interviewer intro)
      setTimeout(() => triggerAIOpener(), 500);

    } catch (err) {
      console.error('[voice] initSession error:', err);
      setError(err.message);
      setPhaseSync(PHASE.ERROR);
    }
  };

  /* ── Trigger the AI to speak first (interviewer intro, no audio needed) ── */
  const triggerAIOpener = async () => {
    if (phaseRef.current === PHASE.ERROR) return;
    setPhaseSync(PHASE.PROCESSING);
    setStatus('Connecting to interviewer…');
    try {
      // Send a silent "hello" to get the first AI message
      const formData = new FormData();
      formData.append('interviewId', interviewRef.current);

      // Create a tiny silent wav blob (44 bytes header + minimal data) as a starter signal
      const silentWav = createSilentWav();
      formData.append('audio', silentWav, 'start.wav');

      const { data } = await api.post('/interview/voice/turn', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success && data.response) {
        await playAIResponse(data.response, data.audioBase64, data.audioMimeType);
        if (data.interviewEnded) { endSession(false); return; }
      }
      setPhaseSync(PHASE.IDLE);
      setStatus('Tap the mic and speak your answer');
    } catch (err) {
      console.error('[voice] opener error:', err);
      setPhaseSync(PHASE.IDLE);
      setStatus('Tap the mic and speak your answer');
    }
  };

  /* ── Start recording ─────────────────────────────────────────────────────── */
  const startRecording = useCallback(() => {
    if (phaseRef.current !== PHASE.IDLE || !streamRef.current) return;
    if (muted) return;

    chunksRef.current = [];
    recordStartTs.current = Date.now();

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/mp4';

    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => processAudioChunk(mimeType);
    mediaRecRef.current = mr;
    mr.start(100); // collect in 100ms chunks

    setPhaseSync(PHASE.RECORDING);
    setStatus('Listening… speak clearly');
    startSilenceDetection();
  }, [muted]); // eslint-disable-line

  /* ── Stop recording ──────────────────────────────────────────────────────── */
  const stopRecording = useCallback(() => {
    if (phaseRef.current !== PHASE.RECORDING) return;
    clearSilenceDetection();
    const elapsed = Date.now() - recordStartTs.current;
    if (elapsed < MIN_RECORD_MS) {
      // Too short — cancel
      mediaRecRef.current?.stop();
      chunksRef.current = [];
      setPhaseSync(PHASE.IDLE);
      setStatus('Tap the mic and speak your answer');
      return;
    }
    mediaRecRef.current?.stop();
  }, []);

  /* ── Silence detection via analyser ─────────────────────────────────────── */
  const startSilenceDetection = () => {
    if (!analyserRef.current) return;
    const analyser = analyserRef.current;
    const buf = new Uint8Array(analyser.frequencyBinCount);
    let silenceSince = null;

    const tick = () => {
      if (phaseRef.current !== PHASE.RECORDING) return;
      analyser.getByteTimeDomainData(buf);
      // RMS
      let sum = 0;
      for (const v of buf) { const n = (v / 128) - 1; sum += n * n; }
      const rms = Math.sqrt(sum / buf.length);

      if (rms < SILENCE_THRESHOLD) {
        if (!silenceSince) silenceSince = Date.now();
        else if (Date.now() - silenceSince > SILENCE_DURATION_MS) {
          // Enough silence — auto stop
          const elapsed = Date.now() - recordStartTs.current;
          if (elapsed > MIN_RECORD_MS) { stopRecording(); return; }
        }
      } else {
        silenceSince = null;
      }
      silenceRafRef.current = requestAnimationFrame(tick);
    };
    silenceRafRef.current = requestAnimationFrame(tick);
  };

  const clearSilenceDetection = () => {
    if (silenceRafRef.current) cancelAnimationFrame(silenceRafRef.current);
    clearTimeout(silenceTimer.current);
  };

  /* ── Process recorded audio chunk → send to server ──────────────────────── */
  const processAudioChunk = async (mimeType) => {
    if (chunksRef.current.length === 0) {
      setPhaseSync(PHASE.IDLE);
      setStatus('Tap the mic and speak your answer');
      return;
    }

    setPhaseSync(PHASE.PROCESSING);
    setStatus('Processing…');

    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];

    const formData = new FormData();
    formData.append('interviewId', interviewRef.current);
    const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('webm') ? 'webm' : 'wav';
    formData.append('audio', blob, `recording.${ext}`);

    try {
      const { data } = await api.post('/interview/voice/turn', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      if (!data.success) throw new Error(data.message || 'Turn failed');

      if (data.skipped) {
        // Nothing heard — prompt again
        setPhaseSync(PHASE.IDLE);
        setStatus('Didn\'t catch that — tap mic and try again');
        return;
      }

      // Add user line to transcript display
      if (data.transcript) {
        setTranscript(tx => [...tx, { role: 'user', content: data.transcript }]);
      }

      // Play AI response
      if (data.response) {
        setTranscript(tx => [...tx, { role: 'assistant', content: data.response }]);
        await playAIResponse(data.response, data.audioBase64, data.audioMimeType);
      }

      if (data.interviewEnded) { endSession(false); return; }

      setPhaseSync(PHASE.IDLE);
      setStatus('Your turn — tap mic to answer');
    } catch (err) {
      console.error('[voice] turn error:', err);
      setError(err.response?.data?.message || err.message);
      setPhaseSync(PHASE.ERROR);
    }
  };

  /* ── Play AI audio response ──────────────────────────────────────────────── */
  const playAIResponse = (text, audioBase64, mimeType) => {
    setCurrentText(text);
    setPhaseSync(PHASE.AI_SPEAKING);
    setStatus('Interviewer speaking…');

    return new Promise((resolve) => {
      // Stop any existing audio
      if (currentAudio.current) {
        currentAudio.current.pause();
        currentAudio.current = null;
      }

      if (!audioBase64 || !audioEnabled) {
        // No audio / muted — just show text for 2s per 15 words
        const words = text.split(/\s+/).length;
        const readTime = Math.max(2000, (words / 150) * 60000);
        setTimeout(resolve, readTime);
        return;
      }

      try {
        const byteStr = atob(audioBase64);
        const arr = new Uint8Array(byteStr.length);
        for (let i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
        const blob = new Blob([arr], { type: mimeType || 'audio/mp3' });
        const url  = URL.createObjectURL(blob);
        const audio = new Audio(url);
        currentAudio.current = audio;
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        audio.play().catch(() => resolve());
      } catch (_) {
        resolve();
      }
    });
  };

  /* ── End session ─────────────────────────────────────────────────────────── */
  const endSession = useCallback(async (auto = false) => {
    if (phaseRef.current === PHASE.ENDING) return;
    setPhaseSync(PHASE.ENDING);
    setStatus(auto ? 'Time up — saving results…' : 'Saving your results…');
    clearInterval(timerRef.current);
    clearSilenceDetection();
    currentAudio.current?.pause();

    try {
      const dur = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : elapsedRef.current;
      const { data } = await api.post('/interview/voice/end', {
        interviewId: interviewRef.current,
        durationSeconds: dur,
      });
      if (data.success) {
        navigate(`/interview-results/${interviewRef.current}`, {
          state: { fromVoice: true, pointsAwarded: data.pointsAwarded },
        });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('[voice] endSession error:', err);
      setError(err.message);
      setPhaseSync(PHASE.ERROR);
    }
  }, []); // eslint-disable-line

  /* ── Teardown on unmount ─────────────────────────────────────────────────── */
  const teardown = () => {
    clearInterval(timerRef.current);
    clearSilenceDetection();
    currentAudio.current?.pause();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
  };

  /* ── Toggle mute ─────────────────────────────────────────────────────────── */
  const toggleMute = () => {
    if (streamRef.current) {
      const enabled = !muted;
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = enabled; });
    }
    setMuted(m => !m);
    if (phaseRef.current === PHASE.RECORDING) stopRecording();
  };

  /* ── Mic button handler ──────────────────────────────────────────────────── */
  const handleMicPress = () => {
    if (phase === PHASE.IDLE)      startRecording();
    else if (phase === PHASE.RECORDING) stopRecording();
  };

  /* ── Status label by phase ───────────────────────────────────────────────── */
  const phaseLabel = {
    [PHASE.INIT]:        'Setting up…',
    [PHASE.IDLE]:        'Tap mic to speak',
    [PHASE.RECORDING]:   'Listening…',
    [PHASE.PROCESSING]:  'Processing…',
    [PHASE.AI_SPEAKING]: 'Interviewer speaking',
    [PHASE.ENDING]:      'Saving results…',
    [PHASE.ERROR]:       'Error',
  };

  const isActive = [PHASE.IDLE, PHASE.RECORDING, PHASE.AI_SPEAKING, PHASE.PROCESSING].includes(phase);
  const canMic   = phase === PHASE.IDLE || phase === PHASE.RECORDING;

  return (
    <div className="min-h-screen bg-nb-black flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Top-left: role + difficulty */}
      <div className="absolute top-5 left-5 border-2 border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          {setup.role} · {setup.difficulty}
        </span>
      </div>

      {/* Top-right: phase pill */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 border-2 border-white/20 px-3 py-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${
          phase === PHASE.RECORDING   ? 'bg-nb-red animate-pulse' :
          phase === PHASE.AI_SPEAKING ? 'bg-nb-yellow animate-pulse' :
          isActive                    ? 'bg-nb-green' :
                                        'bg-white/20'
        }`} />
        <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
          {phaseLabel[phase] || phase}
        </span>
      </div>

      {/* Main layout */}
      <div className="flex flex-col items-center gap-8 w-full max-w-xs">

        {/* Orb */}
        {phase === PHASE.INIT || phase === PHASE.ENDING ? (
          <div className="w-44 h-44 border-4 border-nb-yellow/30 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-nb-yellow animate-spin" />
          </div>
        ) : phase === PHASE.ERROR ? (
          <div className="w-44 h-44 border-4 border-nb-red flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-nb-red" />
          </div>
        ) : (
          <Orb state={
            phase === PHASE.RECORDING   ? 'recording' :
            phase === PHASE.AI_SPEAKING ? 'ai_speaking' :
            phase === PHASE.PROCESSING  ? 'processing' :
                                          'idle'
          } />
        )}

        {/* Current AI text */}
        {currentText && phase === PHASE.AI_SPEAKING && (
          <div className="w-full max-w-xs border-l-2 border-nb-yellow px-3 py-2 bg-nb-yellow/5">
            <p className="text-xs font-mono text-nb-yellow/80 leading-relaxed">{currentText}</p>
          </div>
        )}

        {/* Status */}
        <div className="text-center space-y-1">
          <p className="text-base font-black font-mono text-white uppercase tracking-tight">{status}</p>
          {phase === PHASE.RECORDING && (
            <p className="text-xs font-mono text-nb-red/70 animate-pulse uppercase tracking-widest">● Recording</p>
          )}
          {phase === PHASE.IDLE && !muted && (
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-widest">Auto-stops on silence</p>
          )}
        </div>

        {/* Timer */}
        {isActive && <Timer elapsed={elapsed} cap={cap} />}

        {/* Controls */}
        {isActive && (
          <div className="flex items-center gap-5">
            {/* Mute */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 border-2 border-nb-black flex items-center justify-center transition-all ${
                muted ? 'bg-nb-red text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              aria-label={muted ? 'Unmute' : 'Mute'}
              title={muted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Mic / record button — primary */}
            <button
              onClick={handleMicPress}
              disabled={!canMic || muted}
              className={`w-20 h-20 border-4 border-nb-black flex items-center justify-center transition-all duration-150 ${
                phase === PHASE.RECORDING
                  ? 'bg-nb-red scale-110 shadow-[0_0_0_4px_rgba(255,50,50,0.3)]'
                  : canMic && !muted
                  ? 'bg-nb-yellow hover:scale-105 hover:bg-[#FFC300]'
                  : 'bg-white/5 opacity-40 cursor-not-allowed'
              }`}
              aria-label={phase === PHASE.RECORDING ? 'Stop recording' : 'Start recording'}
            >
              <Mic className={`w-8 h-8 ${phase === PHASE.RECORDING ? 'text-white' : 'text-nb-black'}`} />
            </button>

            {/* Audio toggle */}
            <button
              onClick={() => {
                if (currentAudio.current && audioEnabled) currentAudio.current.pause();
                setAudioEnabled(a => !a);
              }}
              className="w-12 h-12 border-2 border-nb-black bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-all"
              aria-label={audioEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
              title={audioEnabled ? 'Mute AI voice' : 'Unmute AI voice'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* End button */}
        {isActive && (
          <button
            onClick={() => endSession(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-nb-red border-2 border-nb-black text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
            style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111' }}
          >
            <PhoneOff className="w-4 h-4" />
            End Interview
          </button>
        )}

        {/* Transcript */}
        {isActive && (
          <TranscriptFeed
            transcript={transcript}
            expanded={txExpanded}
            onToggle={() => setTxExpanded(x => !x)}
          />
        )}

        {/* Error state */}
        {phase === PHASE.ERROR && (
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-sm font-mono text-nb-red leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setPhaseSync(PHASE.INIT); setError(null); setTranscript([]); initSession(); }}
                className="btn btn-primary btn-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                onClick={() => navigate('/interview/setup')}
                className="btn btn-sm text-white border-white/30 bg-transparent hover:bg-white/10"
              >
                Back to setup
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.ENDING && (
          <p className="text-xs font-mono text-nb-yellow/60 uppercase tracking-widest animate-pulse">
            Scoring your interview…
          </p>
        )}
      </div>

      {/* Bottom hint */}
      {isActive && phase !== PHASE.RECORDING && (
        <p className="absolute bottom-5 text-[10px] font-mono text-white/15 uppercase tracking-widest">
          Interview auto-ends when time runs out
        </p>
      )}
    </div>
  );
}

/* ── Helper: create a minimal silent WAV blob (for the opener trigger) ─────── */
function createSilentWav(durationMs = 100) {
  const sampleRate  = 16000;
  const numSamples  = Math.floor(sampleRate * durationMs / 1000);
  const buffer      = new ArrayBuffer(44 + numSamples * 2);
  const view        = new DataView(buffer);
  const writeStr    = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4,  36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1,  true);  // PCM
  view.setUint16(22, 1,  true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2,  true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);
  // samples all zero = silence
  return new Blob([buffer], { type: 'audio/wav' });
}
