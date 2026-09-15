/**
 * ResumeScanner — Upload resume + optional JD → ATS analysis
 *
 * Fixes:
 * - API contract: backend returns gaps/suggestedFixes, mapped correctly here
 * - Score text was bg-nb-black (invisible) — fixed
 * - Score bars all bg-nb-black — fixed with proper color coding
 * - Download Report button was dead stub — now generates a text report
 * - Added JD input for role-specific ATS scoring
 * - Wired scan history
 */
import { useState, useEffect, useRef } from 'react';
import {
  Upload, CheckCircle, AlertCircle, FileText, TrendingUp,
  XCircle, Download, History, ChevronDown, ChevronUp,
  Trash2, Clock, Target, Loader2, Briefcase,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { resumeScannerService } from '../services/resumeScannerService';

/* ── Score color helpers ─────────────────────────────────────────────────── */
const scoreTextColor = (s) =>
  s >= 80 ? 'text-nb-green' : s >= 60 ? 'text-amber-700' : 'text-nb-red';

const scoreBgColor = (s) =>
  s >= 80 ? 'bg-green-100 border-green-300' : s >= 60 ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300';

const scoreBarColor = (s) =>
  s >= 80 ? 'bg-nb-green' : s >= 60 ? 'bg-amber-400' : 'bg-nb-red';

const scoreLabel = (s) =>
  s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs Work' : 'Poor';

/* ── Download report as text file ────────────────────────────────────────── */
const downloadTextReport = (results) => {
  const lines = [
    'CrackIt AI — Resume Scan Report',
    '================================',
    '',
    `File: ${results.fileName || 'Resume'}`,
    `Overall ATS Score: ${results.atsScore}/100 (${scoreLabel(results.atsScore)})`,
    `Word Count: ${results.wordCount}`,
    `Analysis Method: ${results.analysisMethod || 'AI'}`,
    '',
    '── SCORE BREAKDOWN ──────────────',
    ...(results.scores ? Object.entries(results.scores).map(
      ([k, v]) => `  ${k.replace(/([A-Z])/g, ' $1').trim()}: ${v}/100`
    ) : []),
    '',
    '── DETECTED SECTIONS ────────────',
    ...(results.detectedSections ? Object.entries(results.detectedSections).map(
      ([k, v]) => `  ${k.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()}: ${v ? '✓' : '✗'}`
    ) : []),
    '',
    '── STRENGTHS ────────────────────',
    ...(results.strengths || []).map(s => `  • ${s}`),
    '',
    '── AREAS TO IMPROVE ─────────────',
    ...(results.gaps || results.weaknesses || []).map(g => `  • ${g}`),
    '',
    '── RECOMMENDATIONS ──────────────',
    ...(results.suggestedFixes || results.suggestions || []).map((s, i) => `  ${i + 1}. ${s}`),
    '',
    '── MISSING KEYWORDS ─────────────',
    ...(results.missingKeywords || []).map(k => `  • ${k}`),
    '',
    `Generated: ${new Date().toLocaleString()}`,
    'CrackIt AI — crackiitai.vercel.app',
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `resume-scan-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ── History item ────────────────────────────────────────────────────────── */
function HistoryItem({ item, onView, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b-2 border-nb-black/10 last:border-0">
      <div className="w-8 h-8 bg-[#F5F1E8] border-2 border-nb-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '4px' }}>
        <FileText className="w-4 h-4 text-nb-black/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{item.fileName}</p>
        <p className="text-[10px] text-nb-black/40 font-mono">
          {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className={`text-xs font-black px-2 py-0.5 border-2 font-mono ${scoreBgColor(item.atsScore)} ${scoreTextColor(item.atsScore)}`} style={{ borderRadius: '3px' }}>
        {item.atsScore}%
      </div>
      <button onClick={() => onView(item._id)} className="text-nb-black/40 hover:text-nb-black p-1 transition-colors" title="View">
        <Target className="w-4 h-4" />
      </button>
      <button onClick={() => onDelete(item._id)} className="text-nb-black/30 hover:text-nb-red p-1 transition-colors" title="Delete">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
const ResumeScanner = () => {
  const [file,          setFile]          = useState(null);
  const [jdText,        setJdText]        = useState('');
  const [showJD,        setShowJD]        = useState(false);
  const [scanning,      setScanning]      = useState(false);
  const [results,       setResults]       = useState(null);
  const [error,         setError]         = useState(null);
  const [history,       setHistory]       = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory,   setShowHistory]   = useState(false);
  const fileInputRef = useRef(null);

  // Load history when tab opens
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await resumeScannerService.getScanHistory();
      setHistory(data?.data || data || []);
    } catch {
      // history is non-critical — ignore errors
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); }
  };

  const handleScan = async () => {
    if (!file) { toast.error('Please select a file first.'); return; }
    setScanning(true);
    setError(null);
    try {
      const res = await resumeScannerService.scanResume(file, jdText.trim() || null);
      setResults(res);
      toast.success('Resume analysed!');
      loadHistory(); // refresh history
    } catch (err) {
      setError(err.message || 'Failed to scan resume');
      toast.error(err.message || 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const handleViewHistory = async (id) => {
    try {
      const res = await resumeScannerService.getAnalysis(id);
      const item = res?.data || res;
      // Map DB schema fields to display fields
      setResults({
        ...item,
        gaps:          item.weaknesses || [],
        suggestedFixes: item.suggestions || [],
      });
      setShowHistory(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Failed to load analysis');
    }
  };

  const handleDeleteHistory = async (id) => {
    try {
      await resumeScannerService.deleteAnalysis(id);
      setHistory(h => h.filter(i => i._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const reset = () => {
    setFile(null);
    setResults(null);
    setError(null);
    setJdText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Normalise keys — backend sends gaps/suggestedFixes, DB stores weaknesses/suggestions
  const weaknesses   = results?.gaps          || results?.weaknesses   || [];
  const suggestions  = results?.suggestedFixes || results?.suggestions  || [];
  const strengths    = results?.strengths || [];
  const missing      = results?.missingKeywords || [];

  return (
    <div className="space-y-6">

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-nb-red" style={{ borderRadius: '6px' }}>
          <AlertCircle className="w-5 h-5 text-nb-red flex-shrink-0" />
          <p className="text-sm font-bold text-nb-red">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-nb-red/60 hover:text-nb-red">×</button>
        </div>
      )}

      {!results ? (
        <>
          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed border-nb-black/30 hover:border-nb-black p-10 text-center transition-all cursor-pointer ${file ? 'bg-nb-yellow/10 border-nb-black' : 'bg-white hover:bg-[#F5F1E8]'}`}
            style={{ borderRadius: '8px' }}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
              disabled={scanning}
            />
            {file ? (
              <div className="space-y-3">
                <div className="w-14 h-14 bg-nb-yellow border-2 border-nb-black flex items-center justify-center mx-auto" style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111' }}>
                  <FileText className="w-7 h-7" />
                </div>
                <p className="font-black text-sm">{file.name}</p>
                <p className="text-xs text-nb-black/40">{(file.size / 1024).toFixed(0)} KB</p>
                <button
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="text-xs text-nb-black/40 hover:text-nb-red underline"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-nb-black/30 mx-auto mb-3" />
                <p className="font-black text-sm uppercase tracking-wide">Drop resume here or click to upload</p>
                <p className="text-xs text-nb-black/40 mt-1">PDF, DOC, DOCX — max 5 MB</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  {['PDF', 'DOC', 'DOCX'].map(f => (
                    <span key={f} className="text-[10px] font-black px-2 py-0.5 bg-[#F5F1E8] border-2 border-nb-black/20" style={{ borderRadius: '3px' }}>{f}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Optional JD input */}
          <div className="bg-white border-2 border-nb-black" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
            <button
              onClick={() => setShowJD(j => !j)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-nb-yellow/10 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-nb-black/60 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-wide">Add Job Description (Optional)</p>
                <p className="text-xs text-nb-black/40 mt-0.5">Get role-specific ATS scoring and keyword matching</p>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-nb-yellow border-2 border-nb-black" style={{ borderRadius: '2px' }}>
                RECOMMENDED
              </span>
              {showJD ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
            </button>
            {showJD && (
              <div className="px-4 pb-4 border-t-2 border-nb-black/10 pt-3">
                <textarea
                  className="nb-input min-h-[120px] resize-y text-sm"
                  placeholder="Paste the job description here for role-specific ATS scoring, keyword gap analysis, and targeted recommendations…"
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                />
                <p className="text-[10px] text-nb-black/35 mt-1">{jdText.length} characters</p>
              </div>
            )}
          </div>

          {/* Scan button */}
          <button
            onClick={handleScan}
            disabled={!file || scanning}
            className="btn btn-primary w-full btn-lg"
          >
            {scanning ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analysing…</>
            ) : (
              <><Target className="w-5 h-5" /> Analyse Resume</>
            )}
          </button>

          {/* Feature callouts */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: CheckCircle, title: 'What we check', color: 'bg-green-50 border-green-200',
                items: ['ATS compatibility score', 'Keyword optimisation', 'Format & structure', 'Content quality', 'Section completeness'],
              },
              {
                icon: TrendingUp, title: "You'll get", color: 'bg-nb-yellow/20 border-nb-black/20',
                items: ['Overall ATS score (0–100)', 'Detailed section scores', 'Improvement suggestions', 'Missing keywords', 'Actionable recommendations'],
              },
            ].map(({ icon: Icon, title, color, items }) => (
              <div key={title} className={`border-2 p-5 ${color}`} style={{ borderRadius: '8px' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-5 h-5" />
                  <p className="font-black text-sm uppercase tracking-wide">{title}</p>
                </div>
                <ul className="space-y-1.5">
                  {items.map(i => (
                    <li key={i} className="flex items-center gap-2 text-xs font-medium text-nb-black/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-nb-black/40 flex-shrink-0" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Scan history */}
          <div className="bg-white border-2 border-nb-black" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
            <button
              onClick={() => setShowHistory(h => !h)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#F5F1E8] transition-colors"
            >
              <History className="w-4 h-4 text-nb-black/60" />
              <p className="flex-1 text-sm font-black uppercase tracking-wide">Scan History ({history.length})</p>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showHistory && (
              <div className="px-4 pb-4 border-t-2 border-nb-black/10">
                {loadingHistory ? (
                  <div className="py-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-nb-black/40 py-4 text-center">No scans yet.</p>
                ) : (
                  history.map(item => (
                    <HistoryItem
                      key={item._id}
                      item={item}
                      onView={handleViewHistory}
                      onDelete={handleDeleteHistory}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Results view ──────────────────────────────────────────────────── */
        <div className="space-y-5">

          {/* Score hero */}
          <div className="bg-white border-2 border-nb-black p-8 text-center" style={{ borderRadius: '8px', boxShadow: '6px 6px 0 #111' }}>
            <div
              className={`inline-flex flex-col items-center justify-center w-28 h-28 border-4 border-nb-black mb-4 ${scoreBgColor(results.atsScore)}`}
              style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111' }}
            >
              <span className={`text-4xl font-black font-mono leading-none ${scoreTextColor(results.atsScore)}`}>
                {results.atsScore}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/50 mt-0.5">ATS Score</span>
            </div>
            <h2 className="font-black text-xl" style={{ fontFamily: 'var(--font-display)' }}>
              {results.atsScore >= 80 ? '🎉 Excellent Resume!'
               : results.atsScore >= 60 ? '👍 Good Progress'
               : '💪 Needs Improvement'}
            </h2>
            <p className="text-sm text-nb-black/50 mt-1">
              {results.fileName && <span className="font-mono">{results.fileName} · </span>}
              {results.wordCount} words analysed
              {results.analysisMethod === 'regex-fallback' && (
                <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5" style={{ borderRadius: '3px' }}>
                  Regex fallback
                </span>
              )}
            </p>
          </div>

          {/* Score breakdown */}
          {results.scores && Object.keys(results.scores).length > 0 && (
            <div className="bg-white border-2 border-nb-black p-6" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-4">Score Breakdown</p>
              <div className="space-y-3.5">
                {Object.entries(results.scores).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="uppercase tracking-wide text-nb-black/60">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`font-mono ${scoreTextColor(value)}`}>{value}%</span>
                    </div>
                    <div className="h-2.5 border-2 border-nb-black bg-[#F5F1E8]">
                      <div
                        className={`h-full transition-all duration-700 border-r-2 border-nb-black ${scoreBarColor(value)}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detected sections */}
          {results.detectedSections && (
            <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-3">Resume Sections</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(results.detectedSections).map(([key, val]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 p-2.5 border-2 text-xs font-bold ${
                      val ? 'bg-green-50 border-green-200 text-green-800' : 'bg-[#F5F1E8] border-nb-black/15 text-nb-black/40'
                    }`}
                    style={{ borderRadius: '5px' }}
                  >
                    {val ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
                    <span className="capitalize leading-tight">
                      {key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {strengths.length > 0 && (
            <div className="bg-green-50 border-2 border-green-300 p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #166534' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-700" />
                <p className="font-black text-sm uppercase tracking-wide text-green-800">Strengths</p>
              </div>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Areas to improve */}
          {weaknesses.length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #991b1b' }}>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-red-700" />
                <p className="font-black text-sm uppercase tracking-wide text-red-800">Areas to Improve</p>
              </div>
              <ul className="space-y-2">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {suggestions.length > 0 && (
            <div className="bg-nb-yellow border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <p className="font-black text-sm uppercase tracking-wide">Recommendations</p>
              </div>
              <ol className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 bg-nb-black text-nb-yellow text-[11px] font-black flex items-center justify-center flex-shrink-0" style={{ borderRadius: '3px' }}>
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Missing keywords */}
          {missing.length > 0 && (
            <div className="bg-white border-2 border-nb-black p-5" style={{ borderRadius: '8px', boxShadow: '3px 3px 0 #111' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-nb-black/45 mb-3">Missing Keywords</p>
              <div className="flex flex-wrap gap-2">
                {missing.map(k => (
                  <span key={k} className="text-xs font-bold px-2.5 py-1 bg-red-50 text-red-700 border border-red-200" style={{ borderRadius: '4px' }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ATS issues */}
          {results.atsIssues?.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 p-4" style={{ borderRadius: '6px' }}>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800 mb-2">ATS Issues</p>
              <ul className="space-y-1">
                {results.atsIssues.map((issue, i) => (
                  <li key={i} className="text-xs text-amber-800 flex gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={reset} className="btn btn-ghost flex-1">
              <Upload className="w-4 h-4" /> Scan Another
            </button>
            <button
              onClick={() => downloadTextReport(results)}
              className="btn btn-primary flex-1"
            >
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeScanner;
