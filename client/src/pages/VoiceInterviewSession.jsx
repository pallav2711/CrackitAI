/**
 * VoiceInterviewSession — Clean, production-ready voice interview client
 *
 * Flow:
 *   1. POST /voice/start  → get interviewId + sessionCapSeconds
 *   2. Request mic → build AudioContext for silence detection
 *   3. POST /voice/turn (opener, no audio) → AI greets candidate, text returned
 *   4. GET  /voice/tts?text=...  → stream mp3 → play via Audio API
 *   5. Auto-start recording after AI finishes speaking
 *   6. Silence detected → stop recording → POST /voice/turn with audio blob
 *   7. Repeat steps 4–6 until interviewEnded flag or time cap
 *   8. POST /voice/end → navigate to results
 *
 * Token for TTS fetch: read directly from Zustand store (always in sync).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, PhoneOff, Loader2, AlertCircle,
  Volume2, VolumeX, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';
import api, { getApiUrl, getAuthToken } from '../services/api';

// ─── Tuning constants ─────────────────────────────────────────────────────────
const SILENCE_RMS_THRESHOLD = 0.013; // below this = silence
const SILENCE_HOLD_MS       = 1800;  // silence must last this long to stop recording
const MIN_RECORDING_MS      = 800;   // don't cut off very fast answers
const AUTO_RECORD_DELAY_MS  = 500;   // pause after AI finishes before auto-recording

// ─── Phase enum ───────────────────────────────────────────────────────────────
const P = {
  BOOT:       'boot',       // fetching session from server
  IDLE:       'idle',       // waiting for user to speak
  RECORDING:  'recording',  // mic is hot
  THINKING:   'thinking',   // Whisper + GPT in flight
  SPEAKING:   'speaking',   // TTS audio playing
  ENDING:     'ending',     // posting /voice/end
  ERROR:      'error',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Orb({ phase }) {
  const ai   = phase === P.SPEAKING;
  const user = phase === P.RECORDING;
  const busy = phase === P.THINKING;
  return (
    <div className="relative w-44 h-44 flex items-center justify-center select-none">
      <div className={`absolute inset-0 border-4 transition-all duration-300 ${
        ai ? 'border-nb-yellow scale-110' : user ? 'border-white/60 scale-105' : 'border-white/10'
      }`} />
      <div className={`absolute inset-6 border-2 transition-all duration-500 ${
        ai ? 'border-nb-yellow/30' : 'border-white/5'
      }`} />
      <div className={`w-24 h-24 border-4 border-nb-black flex items-center justify-center transition-all duration-200 ${
        ai ? 'bg-nb-yellow scale-110' : user ? 'bg-white scale-105' : busy ? 'bg-white/15' : 'bg-white/8'
      }`}>
        {busy
          ? <Loader2 className="w-8 h-8 text-nb-yellow animate-spin" />
          : (
            <div className="flex items-end gap-[3px]">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`w-[5px] ${ai ? 'bg-nb-black' : user ? 'bg-nb-black/70' : 'bg-white/20'}`}
                  style={{ height: (ai || user) ? `${5 + Math.abs(Math.sin(i * 1.4 + Date.now() / 120)) * 22}px` : '5px' }}
                />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function Timer({ elapsed, cap }) {
  const rem    = Math.max(cap - elapsed, 0);
  const pct    = cap > 0 ? Math.min((elapsed / cap) * 100, 100) : 0;
  const danger = pct > 80;
  const mm     = String(Math.floor(rem / 60)).padStart(2, '0');
  const ss     = String(rem % 60).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`text-3xl font-black font-mono tabular-nums ${danger ? 'text-nb-red' : 'text-nb-yellow'}`}>
        {mm}:{ss}
      </span>
      <div className="w-36 h-2 border-2 border-white/15 bg-white/5">
        <div
          className={`h-full transition-all duration-1000 ${danger ? 'bg-nb-red' : 'bg-nb-yellow'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">remaining</span>
    </div>
  );
}

function Transcript({ lines }) {
  const [open, setOpen] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines, open]);
  if (!lines.length) return null;
  return (
    <div className="w-full max-w-xs">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[9px] font-mono text-white/25 uppercase tracking-widest mb-1 hover:text-white/50 transition-colors"
      >
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        Transcript ({lines.length})
      </button>
      {open && (
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoiceInterviewSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const setup    = location.state || {};

  // UI state
  const [phase,      setPhase]      = useState(P.BOOT);
  const [status,     setStatus]     = useState('Setting up your interview…');
  const [elapsed,    setElapsed]    = useState(0);
  const [cap,        setCap]        = useState(420);
  const [muted,      setMuted]      = useState(false);
  const [audioOn,    setAudioOn]    = useState(true);
  const [error,      setError]      = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [aiText,     setAiText]     = useState('');

  // Stable refs (never stale in callbacks)
  const phaseRef      = useRef(P.BOOT);
  const interviewId   = useRef(null);
  const capRef        = useRef(420);
  const elapsedRef    = useRef(0);
  const startTs       = useRef(null);
  const mutedRef      = useRef(false);
  const audioOnRef    = useRef(true);

  // Audio/recording refs
  const streamRef     = useRef(null);   // MediaStream from getUserMedia
  const analyserRef   = useRef(null);   // AnalyserNode for silence detection
  const audioCtxRef   = useRef(null);   // AudioContext
  const recRef        = useRef(null);   // MediaRecorder
  const chunksRef     = useRef([]);
  const recStartTs    = useRef(0);
  const silenceRaf    = useRef(null);

  // Playback refs
  const audioEl       = useRef(null);   // current Audio element
  const blobUrl       = useRef(null);   // current object URL

  // Timer ref
  const timerRef      = useRef(null);

  // Keep refs in sync with state
  const go = useCallback((p) => { phaseRef.current = p; setPhase(p); }, []);
  useEffect(() => { mutedRef.current  = muted;   }, [muted]);
  useEffect(() => { audioOnRef.current = audioOn; }, [audioOn]);

  // ── Guard: must have setup.role ─────────────────────────────────────────────
  useEffect(() => {
    if (!setup.role) { navigate('/interview/setup'); return; }
    startSession();
    return () => cleanup();
  }, []); // eslint-disable-line

  // ── Countdown timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const active = [P.IDLE, P.RECORDING, P.THINKING, P.SPEAKING].includes(phase);
    if (!active) return;
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(e => {
        if (e + 1 >= capRef.current) {
          clearInterval(timerRef.current);
          endInterview(true);
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 1: Start session
  // ────────────────────────────────────────────────────────────────────────────
  const startSession = async () => {
    try {
      setStatus('Starting session…');

      const { data } = await api.post('/interview/voice/start', {
        role:           setup.role,
        companyType:    setup.companyType,
        interviewType:  setup.interviewType,
        difficulty:     setup.difficulty,
        durationMinutes: setup.durationMinutes,
      });

      if (!data.success) throw new Error(data.message || 'Failed to start session.');

      interviewId.current  = data.interviewId;
      capRef.current       = data.sessionCapSeconds || 420;
      setCap(capRef.current);
      startTs.current      = Date.now();

      // Request microphone
      setStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation:  true,
          noiseSuppression:  true,
          autoGainControl:   true,
          sampleRate:        16000,
          channelCount:      1,
        },
      });
      streamRef.current = stream;

      // AudioContext for silence detection
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an  = ctx.createAnalyser();
      an.fftSize     = 512;
      an.smoothingTimeConstant = 0.3;
      src.connect(an);
      analyserRef.current = an;

      go(P.IDLE);
      setStatus('Starting interview…');

      // Trigger AI opener (no audio — AI speaks first)
      setTimeout(() => sendTurn(null), 300);

    } catch (err) {
      console.error('[voice] startSession:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow mic access and retry.'
          : (err.response?.data?.message || err.message)
      );
      go(P.ERROR);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 2: Send a turn (Whisper + GPT)
  // ────────────────────────────────────────────────────────────────────────────
  const sendTurn = async (audioBlob, mimeType = 'audio/webm') => {
    go(P.THINKING);
    setStatus('Thinking…');

    try {
      const fd = new FormData();
      fd.append('interviewId', interviewId.current);

      if (audioBlob && audioBlob.size > 500) {
        const ext = mimeType.includes('mp4') ? 'mp4'
                  : mimeType.includes('wav') ? 'wav'
                  : mimeType.includes('ogg') ? 'ogg'
                  : 'webm';
        fd.append('audio', audioBlob, `rec.${ext}`);
      } else {
        // Opener: send silent WAV so server knows to skip STT
        fd.append('audio', makeSilentWav(), 'opener.wav');
      }

      const { data } = await api.post('/interview/voice/turn', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000, // Whisper can be slow on Render free tier
      });

      if (!data.success) throw new Error(data.message || 'Turn failed.');

      if (data.skipped) {
        // Server got silence / noise — prompt user to try again
        go(P.IDLE);
        setStatus("Didn't catch that — tap the mic and speak clearly");
        return;
      }

      // Add user line to transcript display
      if (data.transcript) {
        setTranscript(t => [...t, { role: 'user', content: data.transcript }]);
      }

      // Show AI response text + play audio
      if (data.response) {
        setAiText(data.response);
        setTranscript(t => [...t, { role: 'assistant', content: data.response }]);
        setStatus('Interviewer speaking…');
        go(P.SPEAKING);
        await playTTS(data.response);
      }

      if (data.interviewEnded) {
        endInterview(false);
        return;
      }

      // Ready for next answer
      setAiText('');
      go(P.IDLE);
      setStatus('Your turn — speak your answer');

      // Auto-start recording after short pause
      setTimeout(() => {
        if (phaseRef.current === P.IDLE && !mutedRef.current) startRecording();
      }, AUTO_RECORD_DELAY_MS);

    } catch (err) {
      console.error('[voice] sendTurn:', err);
      const msg = err.code === 'ECONNABORTED' || err.message?.includes('timeout')
        ? 'Request timed out. Check your connection and retry.'
        : (err.response?.data?.message || err.message);
      setError(msg);
      go(P.ERROR);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 3: Play TTS audio
  // ────────────────────────────────────────────────────────────────────────────
  const playTTS = (text) =>
    new Promise((resolve) => {
      stopCurrentAudio();

      if (!audioOnRef.current) {
        // Audio muted — just wait estimated reading time
        setTimeout(resolve, Math.max(1500, (text.split(/\s+/).length / 130) * 60000));
        return;
      }

      const apiBase = getApiUrl().replace(/\/$/, '');
      const token   = getAuthToken();
      const url     = `${apiBase}/interview/voice/tts?text=${encodeURIComponent(text)}`;

      fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
        .then(async (res) => {
          if (!res.ok) {
            console.warn('[voice] TTS HTTP', res.status);
            resolve();
            return;
          }
          const blob    = await res.blob();
          const objUrl  = URL.createObjectURL(blob);
          blobUrl.current = objUrl;

          const audio = new Audio(objUrl);
          audioEl.current = audio;

          // Resume AudioContext if browser suspended it (autoplay policy)
          if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume().catch(() => {});
          }

          audio.onended = () => { revokeBlob(); resolve(); };
          audio.onerror = (e) => {
            console.warn('[voice] audio play error', e);
            revokeBlob();
            resolve();
          };

          audio.play().catch((e) => {
            console.warn('[voice] audio.play() rejected:', e.message);
            revokeBlob();
            resolve();
          });
        })
        .catch((e) => {
          console.warn('[voice] TTS fetch error:', e.message);
          resolve();
        });
    });

  const stopCurrentAudio = () => {
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.onended = null;
      audioEl.current.onerror = null;
      audioEl.current = null;
    }
    revokeBlob();
  };

  const revokeBlob = () => {
    if (blobUrl.current) {
      URL.revokeObjectURL(blobUrl.current);
      blobUrl.current = null;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 4: Recording
  // ────────────────────────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (phaseRef.current !== P.IDLE) return;
    if (!streamRef.current)          return;
    if (mutedRef.current)            return;

    chunksRef.current = [];
    recStartTs.current = Date.now();

    // Pick best supported mime type
    const mime =
      MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
      MediaRecorder.isTypeSupported('audio/webm')              ? 'audio/webm'              :
      MediaRecorder.isTypeSupported('audio/mp4')               ? 'audio/mp4'               :
      'audio/webm';

    const mr = new MediaRecorder(streamRef.current, { mimeType: mime });
    mr.ondataavailable = (e) => { if (e.data?.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      const elapsed = Date.now() - recStartTs.current;
      if (blob.size > 500 && elapsed >= MIN_RECORDING_MS) {
        sendTurn(blob, mime);
      } else {
        go(P.IDLE);
        setStatus('Your turn — speak your answer');
      }
    };
    recRef.current = mr;
    mr.start(100); // collect chunks every 100ms

    go(P.RECORDING);
    setStatus('Listening…');
    watchSilence();
  }, []); // eslint-disable-line

  const stopRecording = useCallback(() => {
    if (phaseRef.current !== P.RECORDING) return;
    cancelSilenceWatch();
    if (recRef.current?.state === 'recording') recRef.current.stop();
  }, []);

  const watchSilence = () => {
    if (!analyserRef.current) return;
    const an     = analyserRef.current;
    const buf    = new Uint8Array(an.frequencyBinCount);
    let silStart = null;

    const tick = () => {
      if (phaseRef.current !== P.RECORDING) return;
      an.getByteTimeDomainData(buf);

      // RMS amplitude
      let sum = 0;
      for (const v of buf) { const n = (v / 128) - 1; sum += n * n; }
      const rms = Math.sqrt(sum / buf.length);

      if (rms < SILENCE_RMS_THRESHOLD) {
        if (!silStart) silStart = Date.now();
        else if (Date.now() - silStart > SILENCE_HOLD_MS) {
          if (Date.now() - recStartTs.current >= MIN_RECORDING_MS) {
            stopRecording();
            return;
          }
        }
      } else {
        silStart = null;
      }
      silenceRaf.current = requestAnimationFrame(tick);
    };
    silenceRaf.current = requestAnimationFrame(tick);
  };

  const cancelSilenceWatch = () => {
    if (silenceRaf.current) {
      cancelAnimationFrame(silenceRaf.current);
      silenceRaf.current = null;
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 5: End interview
  // ────────────────────────────────────────────────────────────────────────────
  const endInterview = useCallback(async (auto = false) => {
    if (phaseRef.current === P.ENDING) return;
    go(P.ENDING);
    clearInterval(timerRef.current);
    cancelSilenceWatch();
    stopCurrentAudio();
    setStatus(auto ? 'Time up — saving your results…' : 'Saving your results…');

    // Stop recording if active
    if (recRef.current?.state === 'recording') {
      try { recRef.current.stop(); } catch (_) {}
    }

    try {
      const dur = startTs.current
        ? Math.floor((Date.now() - startTs.current) / 1000)
        : elapsedRef.current;

      const { data } = await api.post('/interview/voice/end', {
        interviewId:     interviewId.current,
        durationSeconds: dur,
      });

      if (!data.success) throw new Error(data.message || 'Failed to save results.');

      navigate(`/interview-results/${interviewId.current}`, {
        state: { fromVoice: true, pointsAwarded: data.pointsAwarded },
      });
    } catch (err) {
      console.error('[voice] endInterview:', err);
      setError(err.response?.data?.message || err.message);
      go(P.ERROR);
    }
  }, []); // eslint-disable-line

  // ────────────────────────────────────────────────────────────────────────────
  // Cleanup on unmount
  // ────────────────────────────────────────────────────────────────────────────
  const cleanup = () => {
    clearInterval(timerRef.current);
    cancelSilenceWatch();
    stopCurrentAudio();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close().catch(() => {});
  };

  // ── Controls ─────────────────────────────────────────────────────────────────
  const handleMicClick = () => {
    if (phase === P.IDLE)      startRecording();
    else if (phase === P.RECORDING) stopRecording();
  };

  const toggleMute = () => {
    const next = !muted;
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
    setMuted(next);
    if (phase === P.RECORDING) stopRecording();
  };

  const toggleAudio = () => {
    if (audioOn) stopCurrentAudio();
    setAudioOn((a) => !a);
  };

  const retrySession = () => {
    setError(null);
    setTranscript([]);
    setAiText('');
    setElapsed(0);
    elapsedRef.current = 0;
    startSession();
  };

  // ── Derived values ────────────────────────────────────────────────────────────
  const isActive = [P.IDLE, P.RECORDING, P.THINKING, P.SPEAKING].includes(phase);
  const canRecord = phase === P.IDLE && !muted;

  const statusLabel = {
    [P.BOOT]:      'Setting up…',
    [P.IDLE]:      'Your turn',
    [P.RECORDING]: '● Recording',
    [P.THINKING]:  'Thinking…',
    [P.SPEAKING]:  'Interviewer speaking',
    [P.ENDING]:    'Saving…',
    [P.ERROR]:     'Error',
  }[phase] || phase;

  const dotColor = {
    [P.RECORDING]: 'bg-nb-red animate-pulse',
    [P.SPEAKING]:  'bg-nb-yellow animate-pulse',
    [P.THINKING]:  'bg-white/40 animate-pulse',
  }[phase] || (isActive ? 'bg-nb-green' : 'bg-white/15');

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-nb-black flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Top-left: role + difficulty */}
      <div className="absolute top-4 left-4 border border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-mono text-white/35 uppercase tracking-widest">
          {setup.role} · {setup.difficulty}
        </span>
      </div>

      {/* Top-right: live status pill */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 border border-white/15 px-3 py-1.5">
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
          {statusLabel}
        </span>
      </div>

      <div className="flex flex-col items-center gap-7 w-full max-w-xs">

        {/* ── Orb / loader / error ── */}
        {phase === P.BOOT || phase === P.ENDING
          ? (
            <div className="w-44 h-44 border-4 border-nb-yellow/20 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-nb-yellow animate-spin" />
            </div>
          )
          : phase === P.ERROR
          ? (
            <div className="w-44 h-44 border-4 border-nb-red flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-nb-red" />
            </div>
          )
          : <Orb phase={phase} />
        }

        {/* ── AI speech bubble ── */}
        {aiText && phase === P.SPEAKING && (
          <div className="w-full border-l-2 border-nb-yellow px-3 py-2 bg-nb-yellow/5">
            <p className="text-[11px] font-mono text-nb-yellow/80 leading-relaxed">{aiText}</p>
          </div>
        )}

        {/* ── Status text ── */}
        <div className="text-center space-y-1">
          <p className={`text-sm font-black font-mono uppercase tracking-wide ${
            phase === P.RECORDING ? 'text-nb-red'
            : phase === P.SPEAKING ? 'text-nb-yellow'
            : 'text-white/70'
          }`}>
            {status}
          </p>
          {phase === P.IDLE && !muted && (
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
              Auto-stops on silence
            </p>
          )}
          {phase === P.RECORDING && (
            <p className="text-[9px] font-mono text-nb-red/60 uppercase tracking-widest animate-pulse">
              Tap mic to stop early
            </p>
          )}
        </div>

        {/* ── Timer ── */}
        {isActive && <Timer elapsed={elapsed} cap={cap} />}

        {/* ── Controls ── */}
        {isActive && (
          <div className="flex items-center gap-4">

            {/* Mute mic */}
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
              className={`w-11 h-11 border-2 border-nb-black flex items-center justify-center transition-colors ${
                muted ? 'bg-nb-red text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Main mic button */}
            <button
              onClick={handleMicClick}
              disabled={phase !== P.IDLE && phase !== P.RECORDING || muted}
              aria-label={phase === P.RECORDING ? 'Stop recording' : 'Start recording'}
              className={`w-20 h-20 border-4 border-nb-black flex items-center justify-center transition-all duration-150 ${
                phase === P.RECORDING
                  ? 'bg-nb-red scale-110 shadow-[0_0_0_6px_rgba(239,68,68,0.2)]'
                  : canRecord
                  ? 'bg-nb-yellow hover:scale-105 active:scale-95'
                  : 'bg-white/5 opacity-30 cursor-not-allowed'
              }`}
            >
              <Mic className={`w-8 h-8 ${
                phase === P.RECORDING ? 'text-white'
                : canRecord ? 'text-nb-black'
                : 'text-white/30'
              }`} />
            </button>

            {/* Toggle AI audio */}
            <button
              onClick={toggleAudio}
              aria-label={audioOn ? 'Mute AI voice' : 'Unmute AI voice'}
              className="w-11 h-11 border-2 border-nb-black bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

          </div>
        )}

        {/* ── End interview button ── */}
        {isActive && (
          <button
            onClick={() => endInterview(false)}
            className="flex items-center gap-2 px-4 py-2 bg-nb-red border-2 border-nb-black text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            style={{ borderRadius: '4px', boxShadow: '2px 2px 0 #111' }}
          >
            <PhoneOff className="w-3.5 h-3.5" />
            End Interview
          </button>
        )}

        {/* ── Transcript ── */}
        {isActive && <Transcript lines={transcript} />}

        {/* ── Error state ── */}
        {phase === P.ERROR && (
          <div className="text-center space-y-4 w-full max-w-xs">
            <p className="text-sm font-mono text-nb-red/90 leading-relaxed">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={retrySession} className="btn btn-primary btn-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
              <button
                onClick={() => navigate('/interview/setup')}
                className="btn btn-sm bg-transparent text-white/50 border-white/20 hover:bg-white/10"
              >
                Back to setup
              </button>
            </div>
          </div>
        )}

        {/* ── Saving state ── */}
        {phase === P.ENDING && (
          <p className="text-[10px] font-mono text-nb-yellow/50 uppercase tracking-widest animate-pulse">
            Analysing your interview…
          </p>
        )}

      </div>

      {/* Bottom hint */}
      {phase === P.IDLE && (
        <p className="absolute bottom-5 text-[9px] font-mono text-white/12 uppercase tracking-widest">
          Interview ends automatically when time runs out
        </p>
      )}

    </div>
  );
}

// ─── Helper: create a minimal silent WAV blob ─────────────────────────────────
// Used as the opener signal (tells server: skip STT, just generate AI greeting)
function makeSilentWav(durationMs = 100) {
  const sr  = 16000;
  const n   = Math.floor((sr * durationMs) / 1000);
  const buf = new ArrayBuffer(44 + n * 2);
  const v   = new DataView(buf);
  const ws  = (off, s) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  ws(0, 'RIFF');  v.setUint32(4, 36 + n * 2, true);
  ws(8, 'WAVE');  ws(12, 'fmt ');  v.setUint32(16, 16, true);
  v.setUint16(20, 1,  true);  // PCM
  v.setUint16(22, 1,  true);  // mono
  v.setUint32(24, sr, true);  v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2,  true);  v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, n * 2, true);
  // all sample bytes = 0 (silence)
  return new Blob([buf], { type: 'audio/wav' });
}
