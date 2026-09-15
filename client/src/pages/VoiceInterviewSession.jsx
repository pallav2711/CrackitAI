/**
 * Voice Interview Session — ChatGPT-style voice conversation
 *
 * Pipeline per turn:
 *   1. User speaks → MediaRecorder captures audio
 *   2. Silence detected → POST /voice/turn (Whisper STT + GPT) → text back in ~3-5s
 *   3. GET /voice/tts streams MP3 audio → plays immediately
 *   4. When AI finishes → mic opens automatically
 *   5. Repeat until time cap or AI closes the interview
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, PhoneOff, Loader2, AlertCircle,
  Volume2, VolumeX, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '../services/api';

/* ─── Config ──────────────────────────────────────────────────────────────── */
const SILENCE_THRESHOLD = 0.012;
const SILENCE_DELAY_MS  = 1600;
const MIN_RECORD_MS     = 700;

const PHASE = {
  INIT:       'init',
  IDLE:       'idle',
  RECORDING:  'recording',
  PROCESSING: 'processing',
  AI:         'ai_speaking',
  ENDING:     'ending',
  ERROR:      'error',
};

/* ─── Animated Orb ────────────────────────────────────────────────────────── */
function Orb({ phase }) {
  const isAI   = phase === PHASE.AI;
  const isUser = phase === PHASE.RECORDING;
  const isBusy = phase === PHASE.PROCESSING;

  return (
    <div className="relative w-44 h-44 flex items-center justify-center select-none">
      <div className={`absolute inset-0 border-4 transition-all duration-300 ${
        isAI   ? 'border-nb-yellow scale-110' :
        isUser ? 'border-white/60 scale-105'  : 'border-white/10'
      }`} />
      <div className={`absolute inset-6 border-2 transition-all duration-500 ${
        isAI ? 'border-nb-yellow/30' : 'border-white/5'
      }`} />
      <div className={`w-24 h-24 border-4 border-nb-black flex items-center justify-center transition-all duration-200 ${
        isAI   ? 'bg-nb-yellow scale-110' :
        isUser ? 'bg-white scale-105'     :
        isBusy ? 'bg-white/15'            : 'bg-white/8'
      }`}>
        {isBusy
          ? <Loader2 className="w-8 h-8 text-nb-yellow animate-spin" />
          : (
            <div className="flex items-end gap-[3px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i}
                  className={`w-[5px] ${
                    isAI   ? 'bg-nb-black'     :
                    isUser ? 'bg-nb-black/70'  : 'bg-white/20'
                  }`}
                  style={{ height: (isAI || isUser) ? `${5 + Math.abs(Math.sin(i * 1.3 + Date.now() / 130)) * 20}px` : '5px' }}
                />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

/* ─── Timer ───────────────────────────────────────────────────────────────── */
function Timer({ elapsed, cap }) {
  const rem    = Math.max(cap - elapsed, 0);
  const pct    = cap > 0 ? (elapsed / cap) * 100 : 0;
  const danger = pct > 80;
  const mm     = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss     = String(rem % 60).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-3xl font-black font-mono tabular-nums ${danger ? 'text-nb-red' : 'text-nb-yellow'}`}>
        {mm}:{ss}
      </span>
      <div className="w-36 h-2 border-2 border-white/15 bg-white/5">
        <div className={`h-full transition-all duration-1000 ${danger ? 'bg-nb-red' : 'bg-nb-yellow'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">remaining</span>
    </div>
  );
}

/* ─── Transcript Panel ────────────────────────────────────────────────────── */
function TranscriptPanel({ lines, expanded, onToggle }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);
  if (!lines.length) return null;
  return (
    <div className="w-full max-w-sm">
      <button onClick={onToggle}
        className="flex items-center gap-1 text-[9px] font-mono text-white/25 uppercase tracking-widest mb-1.5 hover:text-white/50 transition-colors">
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Transcript ({lines.length})
      </button>
      {expanded && (
        <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
          {lines.map((l, i) => (
            <div key={i} className={`text-[11px] font-mono leading-relaxed px-2.5 py-1.5 border-l-2 ${
              l.role === 'assistant'
                ? 'border-nb-yellow text-nb-yellow/70 bg-nb-yellow/5'
                : 'border-white/20 text-white/50 bg-white/5'
            }`}>
              <span className="text-[8px] uppercase tracking-widest opacity-40 block mb-0.5">
                {l.role === 'assistant' ? 'Interviewer' : 'You'}
              </span>
              {l.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function VoiceInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const setup    = location.state || {};

  const [phase, setPhase]     = useState(PHASE.INIT);
  const [status, setStatus]   = useState('Setting up…');
  const [elapsed, setElapsed] = useState(0);
  const [cap, setCap]         = useState(420);
  const [muted, setMuted]     = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [error, setError]     = useState(null);
  const [transcript, setTx]   = useState([]);
  const [txOpen, setTxOpen]   = useState(false);
  const [aiText, setAiText]   = useState('');

  const phaseRef    = useRef(PHASE.INIT);
  const interviewId = useRef(null);
  const capRef      = useRef(420);
  const elapsedRef  = useRef(0);
  const startTs     = useRef(null);
  const timerRef    = useRef(null);

  const streamRef   = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const recRef      = useRef(null);
  const chunksRef   = useRef([]);
  const recStartTs  = useRef(0);
  const silRafRef   = useRef(null);

  const playingRef  = useRef(null);   // current Audio element
  const blobUrlRef  = useRef(null);   // current blob URL

  const mutedRef    = useRef(false);  // mirror of muted for callbacks
  const audioOnRef  = useRef(true);

  const setP = (p) => { phaseRef.current = p; setPhase(p); };

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { audioOnRef.current = audioOn; }, [audioOn]);

  /* ── Guard & mount ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!setup.role) { navigate('/interview/setup'); return; }
    init();
    return teardown;
  }, []); // eslint-disable-line

  /* ── Timer ────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const active = [PHASE.IDLE, PHASE.RECORDING, PHASE.PROCESSING, PHASE.AI].includes(phase);
    if (!active) return;
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(e => {
        if (e + 1 >= capRef.current) { clearInterval(timerRef.current); endSession(true); }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line

  /* ── Init ─────────────────────────────────────────────────────────────────── */
  const init = async () => {
    try {
      setStatus('Starting session…');
      const { data } = await api.post('/interview/voice/start', {
        role: setup.role, companyType: setup.companyType,
        interviewType: setup.interviewType, difficulty: setup.difficulty,
        durationMinutes: setup.durationMinutes,
      });
      if (!data.success) throw new Error(data.message || 'Failed to start');

      interviewId.current = data.interviewId;
      capRef.current = data.sessionCapSeconds || 420;
      setCap(data.sessionCapSeconds || 420);
      startTs.current = Date.now();

      setStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
        video: false,
      });
      streamRef.current = stream;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an  = ctx.createAnalyser(); an.fftSize = 256;
      src.connect(an);
      analyserRef.current = an;

      setP(PHASE.IDLE);
      setStatus('Starting interview…');
      setTimeout(() => sendTurn(null), 300); // trigger opener
    } catch (err) {
      console.error('[voice] init:', err);
      setError(err.message);
      setP(PHASE.ERROR);
    }
  };

  /* ── Send turn (Whisper + GPT) ───────────────────────────────────────────── */
  const sendTurn = async (audioBlob, mimeType = 'audio/webm') => {
    setP(PHASE.PROCESSING);
    setStatus('Thinking…');
    try {
      const fd = new FormData();
      fd.append('interviewId', interviewId.current);
      if (audioBlob && audioBlob.size > 500) {
        const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';
        fd.append('audio', audioBlob, `rec.${ext}`);
      } else {
        fd.append('audio', silentWav(), 'open.wav');
      }

      const { data } = await api.post('/interview/voice/turn', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      if (!data.success) throw new Error(data.message || 'Turn failed');

      if (data.skipped) {
        setP(PHASE.IDLE); setStatus('Tap mic to speak'); return;
      }

      if (data.transcript) setTx(t => [...t, { role: 'user', content: data.transcript }]);

      if (data.response) {
        setAiText(data.response);
        setTx(t => [...t, { role: 'assistant', content: data.response }]);
        setStatus('Interviewer speaking…');
        setP(PHASE.AI);
        await streamTTSAudio(data.response);
      }

      if (data.interviewEnded) { endSession(false); return; }

      setAiText('');
      setP(PHASE.IDLE);
      setStatus('Your turn');
      setTimeout(() => {
        if (phaseRef.current === PHASE.IDLE && !mutedRef.current) startRecording();
      }, 400);

    } catch (err) {
      console.error('[voice] sendTurn:', err);
      const msg = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        ? 'Request timed out. Please try again.'
        : (err.response?.data?.message || err.message);
      setError(msg);
      setP(PHASE.ERROR);
    }
  };

  /* ── Stream TTS audio ────────────────────────────────────────────────────── */
  const streamTTSAudio = (text) => new Promise((resolve) => {
    stopAudio();

    if (!audioOnRef.current) {
      // Audio disabled — estimate speaking time
      setTimeout(resolve, Math.max(1500, (text.split(/\s+/).length / 140) * 60000));
      return;
    }

    // Build TTS URL — VITE_API_URL includes /api already (e.g. https://host/api)
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
    // Get token from Zustand persisted store
    let token = '';
    try {
      const raw = localStorage.getItem('auth-storage') || localStorage.getItem('crackit-auth') || '';
      token = raw ? (JSON.parse(raw)?.state?.token || '') : '';
    } catch { token = ''; }
    // Fallback: read from axios interceptor default header
    if (!token) {
      const authHeader = api.defaults.headers?.common?.Authorization || '';
      token = authHeader.replace('Bearer ', '');
    }

    const url = `${apiBase}/interview/voice/tts?text=${encodeURIComponent(text)}&interviewId=${encodeURIComponent(interviewId.current)}`;

    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(async (res) => {
        if (!res.ok) { resolve(); return; }
        const blob    = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;

        const audio = new Audio(blobUrl);
        playingRef.current = audio;
        audio.onended = () => { revokeBlob(); resolve(); };
        audio.onerror = () => { revokeBlob(); resolve(); };

        if (audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => {});
        }
        audio.play().catch(() => resolve());
      })
      .catch(() => resolve());
  });

  const stopAudio = () => {
    if (playingRef.current) {
      playingRef.current.pause();
      playingRef.current.onended = null;
      playingRef.current.onerror = null;
      playingRef.current = null;
    }
    revokeBlob();
  };

  const revokeBlob = () => {
    if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
  };

  /* ── Recording ────────────────────────────────────────────────────────────── */
  const startRecording = useCallback(() => {
    if (phaseRef.current !== PHASE.IDLE || !streamRef.current || mutedRef.current) return;
    chunksRef.current = [];
    recStartTs.current = Date.now();

    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus'
               : MediaRecorder.isTypeSupported('audio/webm')             ? 'audio/webm'
               : 'audio/mp4';

    const mr = new MediaRecorder(streamRef.current, { mimeType: mime });
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      if (blob.size > 500 && Date.now() - recStartTs.current >= MIN_RECORD_MS) {
        sendTurn(blob, mime);
      } else {
        setP(PHASE.IDLE); setStatus('Your turn');
      }
    };
    recRef.current = mr;
    mr.start(100);
    setP(PHASE.RECORDING);
    setStatus('Listening…');
    startSilenceWatch();
  }, []); // eslint-disable-line

  const stopRecording = useCallback(() => {
    if (phaseRef.current !== PHASE.RECORDING) return;
    cancelSilenceWatch();
    recRef.current?.stop();
  }, []);

  const startSilenceWatch = () => {
    if (!analyserRef.current) return;
    const an  = analyserRef.current;
    const buf = new Uint8Array(an.frequencyBinCount);
    let silStart = null;
    const tick = () => {
      if (phaseRef.current !== PHASE.RECORDING) return;
      an.getByteTimeDomainData(buf);
      let sum = 0;
      for (const v of buf) { const n = (v / 128) - 1; sum += n * n; }
      const rms = Math.sqrt(sum / buf.length);
      if (rms < SILENCE_THRESHOLD) {
        if (!silStart) silStart = Date.now();
        else if (Date.now() - silStart > SILENCE_DELAY_MS && Date.now() - recStartTs.current >= MIN_RECORD_MS) {
          stopRecording(); return;
        }
      } else { silStart = null; }
      silRafRef.current = requestAnimationFrame(tick);
    };
    silRafRef.current = requestAnimationFrame(tick);
  };

  const cancelSilenceWatch = () => {
    if (silRafRef.current) cancelAnimationFrame(silRafRef.current);
  };

  /* ── End session ──────────────────────────────────────────────────────────── */
  const endSession = useCallback(async (auto = false) => {
    if (phaseRef.current === PHASE.ENDING) return;
    setP(PHASE.ENDING);
    setStatus(auto ? 'Time up — saving results…' : 'Saving results…');
    clearInterval(timerRef.current);
    cancelSilenceWatch();
    stopAudio();
    try { recRef.current?.stop(); } catch (_) {}

    try {
      const dur = startTs.current ? Math.floor((Date.now() - startTs.current) / 1000) : elapsedRef.current;
      const { data } = await api.post('/interview/voice/end', {
        interviewId: interviewId.current,
        durationSeconds: dur,
      });
      if (data.success) {
        navigate(`/interview-results/${interviewId.current}`, {
          state: { fromVoice: true, pointsAwarded: data.pointsAwarded },
        });
      } else throw new Error(data.message);
    } catch (err) {
      console.error('[voice] end:', err);
      setError(err.message); setP(PHASE.ERROR);
    }
  }, []); // eslint-disable-line

  const teardown = () => {
    clearInterval(timerRef.current);
    cancelSilenceWatch();
    stopAudio();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close().catch(() => {});
  };

  const toggleMute = () => {
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !next; });
    setMuted(next);
    if (phaseRef.current === PHASE.RECORDING) stopRecording();
  };

  const toggleAudio = () => {
    if (audioOn) stopAudio();
    setAudioOn(a => !a);
  };

  const handleMic = () => {
    if (phase === PHASE.IDLE) startRecording();
    else if (phase === PHASE.RECORDING) stopRecording();
  };

  const isActive = [PHASE.IDLE, PHASE.RECORDING, PHASE.PROCESSING, PHASE.AI].includes(phase);

  const statusLabel = {
    [PHASE.INIT]:       'Setting up…',
    [PHASE.IDLE]:       'Your turn',
    [PHASE.RECORDING]:  '● Recording',
    [PHASE.PROCESSING]: 'Thinking…',
    [PHASE.AI]:         'Interviewer speaking',
    [PHASE.ENDING]:     'Saving…',
    [PHASE.ERROR]:      'Error',
  }[phase] || phase;

  return (
    <div className="min-h-screen bg-nb-black flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Top-left */}
      <div className="absolute top-4 left-4 border border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-mono text-white/35 uppercase tracking-widest">
          {setup.role} · {setup.difficulty}
        </span>
      </div>

      {/* Top-right: phase pill */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 border border-white/15 px-3 py-1.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          phase === PHASE.RECORDING   ? 'bg-nb-red animate-pulse'    :
          phase === PHASE.AI          ? 'bg-nb-yellow animate-pulse'  :
          phase === PHASE.PROCESSING  ? 'bg-white/40 animate-pulse'  :
          isActive                    ? 'bg-nb-green'                 :
                                        'bg-white/15'
        }`} />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{statusLabel}</span>
      </div>

      <div className="flex flex-col items-center gap-7 w-full max-w-xs">

        {/* Orb */}
        {phase === PHASE.INIT || phase === PHASE.ENDING
          ? <div className="w-44 h-44 border-4 border-nb-yellow/20 flex items-center justify-center"><Loader2 className="w-10 h-10 text-nb-yellow animate-spin" /></div>
          : phase === PHASE.ERROR
          ? <div className="w-44 h-44 border-4 border-nb-red flex items-center justify-center"><AlertCircle className="w-10 h-10 text-nb-red" /></div>
          : <Orb phase={phase} />
        }

        {/* AI text bubble */}
        {aiText && phase === PHASE.AI && (
          <div className="w-full border-l-2 border-nb-yellow px-3 py-2 bg-nb-yellow/5">
            <p className="text-[11px] font-mono text-nb-yellow/80 leading-relaxed">{aiText}</p>
          </div>
        )}

        {/* Status text */}
        <div className="text-center">
          <p className={`text-sm font-black font-mono uppercase tracking-wide ${
            phase === PHASE.RECORDING ? 'text-nb-red' :
            phase === PHASE.AI        ? 'text-nb-yellow' : 'text-white/70'
          }`}>{status}</p>
          {phase === PHASE.IDLE && !muted && (
            <p className="text-[9px] font-mono text-white/20 mt-1 uppercase tracking-widest">Auto-stops on silence</p>
          )}
        </div>

        {isActive && <Timer elapsed={elapsed} cap={cap} />}

        {/* Controls */}
        {isActive && (
          <div className="flex items-center gap-4">
            <button onClick={toggleMute}
              className={`w-11 h-11 border-2 border-nb-black flex items-center justify-center transition-colors ${muted ? 'bg-nb-red text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
              aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button onClick={handleMic}
              disabled={phase === PHASE.PROCESSING || phase === PHASE.AI || muted}
              className={`w-20 h-20 border-4 border-nb-black flex items-center justify-center transition-all duration-150 ${
                phase === PHASE.RECORDING
                  ? 'bg-nb-red scale-110 shadow-[0_0_0_6px_rgba(239,68,68,0.25)]'
                  : phase === PHASE.IDLE && !muted
                  ? 'bg-nb-yellow hover:scale-105 active:scale-95'
                  : 'bg-white/5 opacity-30 cursor-not-allowed'
              }`}
              aria-label={phase === PHASE.RECORDING ? 'Stop' : 'Record'}>
              <Mic className={`w-8 h-8 ${
                phase === PHASE.RECORDING ? 'text-white' :
                phase === PHASE.IDLE && !muted ? 'text-nb-black' : 'text-white/30'
              }`} />
            </button>

            <button onClick={toggleAudio}
              className="w-11 h-11 border-2 border-nb-black bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label={audioOn ? 'Mute AI' : 'Unmute AI'}>
              {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        )}

        {isActive && (
          <button onClick={() => endSession(false)}
            className="flex items-center gap-2 px-4 py-2 bg-nb-red border-2 border-nb-black text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111' }}>
            <PhoneOff className="w-3.5 h-3.5" /> End Interview
          </button>
        )}

        {isActive && <TranscriptPanel lines={transcript} expanded={txOpen} onToggle={() => setTxOpen(o => !o)} />}

        {phase === PHASE.ERROR && (
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-sm font-mono text-nb-red/90 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setError(null); setTx([]); setAiText(''); setP(PHASE.INIT); setStatus('Setting up…'); init(); }}
                className="btn btn-primary btn-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
              <button onClick={() => navigate('/interview/setup')}
                className="btn btn-sm bg-transparent text-white/50 border-white/20 hover:bg-white/10">
                Back to setup
              </button>
            </div>
          </div>
        )}

        {phase === PHASE.ENDING && (
          <p className="text-[10px] font-mono text-nb-yellow/50 uppercase tracking-widest animate-pulse">Scoring your interview…</p>
        )}
      </div>

      {phase === PHASE.IDLE && (
        <p className="absolute bottom-5 text-[9px] font-mono text-white/12 uppercase tracking-widest">
          Interview auto-ends when time runs out
        </p>
      )}
    </div>
  );
}

/* ─── Minimal silent WAV blob (opener signal) ─────────────────────────────── */
function silentWav(ms = 100) {
  const sr = 16000, n = Math.floor(sr * ms / 1000);
  const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true);
  w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, n * 2, true);
  return new Blob([buf], { type: 'audio/wav' });
}
