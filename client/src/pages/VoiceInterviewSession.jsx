/**
 * Voice Interview Session — Neo Brutalist dark screen
 * Dark bg: nb-black. Accent: nb-yellow. Typography: Space Mono for status.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mic, MicOff, PhoneOff, Loader2, AlertCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import api from '../services/api';

/* ─── Waveform Orb ────────────────────────────────────────────────────────── */
function Orb({ speaking, listening }) {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer square ring — nb style, no blur */}
      <div className={`absolute inset-0 border-4 transition-all duration-300 ${speaking ? 'border-nb-yellow scale-110' : listening ? 'border-white/40 scale-105' : 'border-white/10'}`} />
      <div className={`absolute inset-4 border-3 transition-all duration-300 ${speaking ? 'border-nb-yellow/60' : 'border-white/5'}`} />

      {/* Core square */}
      <div className={`w-28 h-28 border-4 border-nb-black flex items-center justify-center transition-all duration-200  ${
        speaking  ? 'bg-nb-yellow scale-110'
        : listening ? 'bg-white scale-105'
        : 'bg-white/10'
      }`}>
        {/* Waveform bars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i}
              className={`w-1.5 transition-all duration-100 ${speaking || listening ? (speaking ? 'bg-nb-black' : 'bg-nb-black/70') : 'bg-white/30'}`}
              style={{ height: speaking || listening ? `${8 + Math.abs(Math.sin(i * 0.8 + Date.now() / 200)) * 20}px` : '8px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Timer ───────────────────────────────────────────────────────────────── */
function Timer({ elapsed, cap }) {
  const rem = Math.max(cap - elapsed, 0);
  const m = String(Math.floor(rem / 60)).padStart(2, '0');
  const s = String(rem % 60).padStart(2, '0');
  const pct = cap > 0 ? (elapsed / cap) * 100 : 0;
  const danger = pct > 80;
  return (
    <div className="flex flex-col items-center gap-2">
      <span className={`text-3xl font-black font-mono tabular-nums ${danger ? 'text-nb-red' : 'text-nb-yellow'}`}>
        {m}:{s}
      </span>
      <div className="w-40 h-3 border-2 border-white/20 bg-white/5">
        <div className={`h-full border-r-2 transition-all duration-1000 ${danger ? 'bg-nb-red border-nb-red' : 'bg-nb-yellow border-nb-yellow'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">remaining</span>
    </div>
  );
}

const STATES = { CONNECTING: 'connecting', ACTIVE: 'active', AI: 'ai', USER: 'user', ENDING: 'ending', ERROR: 'error' };

export default function VoiceInterviewSession() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const setup     = location.state || {};

  const [state, setState]       = useState(STATES.CONNECTING);
  const [elapsed, setElapsed]   = useState(0);
  const [cap, setCap]           = useState(420);
  const [muted, setMuted]       = useState(false);
  const [error, setError]       = useState(null);
  const [status, setStatus]     = useState('Connecting…');
  const [interviewId, setId]    = useState(null);
  const [connected, setConnected] = useState(false);

  const pcRef    = useRef(null);
  const audioRef = useRef(null);
  const streamRef= useRef(null);
  const timerRef = useRef(null);
  const txRef    = useRef([]);
  const startRef = useRef(null);

  useEffect(() => {
    if (!setup.role) { navigate('/interview/setup'); return; }
    init();
    return cleanup;
  }, []); // eslint-disable-line

  useEffect(() => {
    if ([STATES.ACTIVE, STATES.AI, STATES.USER].includes(state)) {
      timerRef.current = setInterval(() => {
        setElapsed(e => { if (e + 1 >= cap) { clearInterval(timerRef.current); end(true); } return e + 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [state, cap]); // eslint-disable-line

  const init = async () => {
    try {
      setStatus('Starting session…');
      const { data } = await api.post('/interview/voice/start', {
        role: setup.role, companyType: setup.companyType,
        interviewType: setup.interviewType, difficulty: setup.difficulty,
        durationMinutes: setup.durationMinutes,
      });
      if (!data.success) throw new Error(data.message || 'Failed to start');
      setId(data.interviewId); setCap(data.sessionCapSeconds || 420);
      startRef.current = Date.now();
      setStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setStatus('Connecting to AI interviewer…');
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      pc.ontrack = ev => { if (audioRef.current) audioRef.current.srcObject = ev.streams[0]; };
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      const dc = pc.createDataChannel('oai-events');
      dc.onopen  = () => { setConnected(true); setState(STATES.ACTIVE); setStatus('Interview in progress'); };
      dc.onmessage = e => handleMsg(JSON.parse(e.data));
      dc.onclose = () => setConnected(false);
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      const sdpRes = await fetch('https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview', {
        method: 'POST', body: offer.sdp,
        headers: { Authorization: `Bearer ${data.realtimeToken}`, 'Content-Type': 'application/sdp' },
      });
      if (!sdpRes.ok) throw new Error(`Realtime: ${sdpRes.statusText}`);
      await pc.setRemoteDescription({ type: 'answer', sdp: await sdpRes.text() });
    } catch (err) {
      setError(err.message); setState(STATES.ERROR); setStatus('Connection failed');
    }
  };

  const handleMsg = useCallback(msg => {
    if (msg.type === 'input_audio_buffer.speech_started') { setState(STATES.USER); setStatus('Listening…'); }
    if (msg.type === 'input_audio_buffer.speech_stopped') { setState(STATES.ACTIVE); setStatus('Processing…'); }
    if (msg.type === 'response.audio.started') { setState(STATES.AI); setStatus('AI interviewer speaking…'); }
    if (msg.type === 'response.audio.done') { setState(STATES.ACTIVE); setStatus('Your turn…'); }
    if (msg.type === 'conversation.item.created') {
      const item = msg.item;
      if (item?.role && item?.content) {
        const text = item.content.map(c => c.text || c.transcript || '').join(' ').trim();
        if (text) txRef.current.push({ role: item.role, content: text });
      }
    }
  }, []);

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = muted; });
    setMuted(m => !m);
  };

  const end = useCallback(async (auto = false) => {
    if (state === STATES.ENDING) return;
    setState(STATES.ENDING);
    setStatus(auto ? 'Time up — saving results…' : 'Ending session…');
    clearInterval(timerRef.current);
    cleanup(false);
    try {
      const dur = startRef.current ? Math.floor((Date.now() - startRef.current) / 1000) : elapsed;
      const { data } = await api.post('/interview/voice/end', { interviewId, transcript: txRef.current, durationSeconds: dur });
      if (data.success) navigate(`/interview-results/${interviewId}`, { state: { fromVoice: true, pointsAwarded: data.pointsAwarded } });
      else throw new Error(data.message);
    } catch (err) { setError(err.message); setState(STATES.ERROR); }
  }, [state, interviewId, elapsed, navigate]); // eslint-disable-line

  const cleanup = (full = true) => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    if (full) { streamRef.current = null; pcRef.current = null; }
  };

  const isAI = state === STATES.AI, isUser = state === STATES.USER;
  const isConn = state === STATES.CONNECTING, isEnd = state === STATES.ENDING, isErr = state === STATES.ERROR;

  return (
    <div className="min-h-screen bg-nb-black flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {/* Status pills */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 border-2 border-white/20 px-3 py-1.5">
        {connected ? <Wifi className="w-3 h-3 text-nb-green" /> : <WifiOff className="w-3 h-3 text-white/30" />}
        <span className="text-[10px] font-mono text-white/50 uppercase">{connected ? 'Connected' : 'Connecting'}</span>
      </div>
      <div className="absolute top-5 left-5 border-2 border-white/10 px-3 py-1.5">
        <span className="text-[10px] font-mono text-white/40 uppercase">{setup.role} · {setup.difficulty}</span>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center gap-10 w-full max-w-xs">

        {/* Orb or state indicator */}
        {isConn || isEnd ? (
          <div className="w-48 h-48 border-4 border-nb-yellow/30 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-nb-yellow animate-spin" />
          </div>
        ) : isErr ? (
          <div className="w-48 h-48 border-4 border-nb-red flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-nb-red" />
          </div>
        ) : (
          <Orb speaking={isAI} listening={isUser} />
        )}

        {/* Status */}
        <div className="text-center space-y-1">
          <p className="text-lg font-black font-mono text-nb-white uppercase tracking-tight">{status}</p>
          {isAI  && <p className="text-xs font-mono text-nb-yellow/60 uppercase tracking-widest">AI speaking</p>}
          {isUser && <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Listening…</p>}
          {!isConn && !isErr && !isEnd && !isAI && !isUser && (
            <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Speak clearly</p>
          )}
        </div>

        {/* Timer */}
        {!isConn && !isEnd && !isErr && <Timer elapsed={elapsed} cap={cap} />}

        {/* Controls */}
        {!isConn && !isEnd && !isErr && (
          <div className="flex items-center gap-6">
            <button onClick={toggleMute}
              className={`w-14 h-14 border-3 border-nb-black flex items-center justify-center transition-all ${muted ? 'bg-nb-red text-white shadow-nb-red' : 'bg-white/10 text-white hover:bg-white/20'}`}
              aria-label={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button onClick={() => end(false)}
              className="w-16 h-16 bg-nb-red border-3 border-nb-black flex items-center justify-center shadow-nb-red hover:scale-105 transition-transform"
              aria-label="End interview">
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        )}

        {/* Error state */}
        {isErr && (
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-sm font-mono text-nb-red">{error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={init} className="btn btn-primary btn-sm"><RefreshCw className="w-3.5 h-3.5" />Retry</button>
              <button onClick={() => navigate('/mock-interview', { state: { prefill: setup } })} className="btn btn-sm text-white border-white/30 bg-transparent hover:bg-white/10">Text mode</button>
            </div>
          </div>
        )}

        {isConn && (
          <div className="text-center">
            <p className="text-xs font-mono text-white/30 uppercase tracking-widest">Setting up…</p>
            <button onClick={() => navigate('/mock-interview', { state: { prefill: setup } })}
              className="text-[10px] font-mono text-white/20 underline mt-2">Slow? Switch to text</button>
          </div>
        )}

        {isEnd && <p className="text-xs font-mono text-nb-yellow/60 uppercase tracking-widest animate-pulse">Scoring your interview…</p>}
      </div>

      {!isConn && !isErr && !isEnd && (
        <p className="absolute bottom-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
          Interview auto-ends when time runs out
        </p>
      )}
    </div>
  );
}
