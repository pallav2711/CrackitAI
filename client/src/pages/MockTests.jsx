import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList, Clock, Award, TrendingUp, Play,
  Search, BarChart3, Target, Zap, CheckCircle, ArrowRight,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { testService } from '../services/testService';

/* ─── Categories ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'all',       label: 'All',        icon: ClipboardList },
  { value: 'aptitude',  label: 'Aptitude',   icon: Target        },
  { value: 'technical', label: 'Technical',  icon: Zap           },
  { value: 'logical',   label: 'Logical',    icon: BarChart3     },
  { value: 'verbal',    label: 'Verbal',     icon: Award         },
  { value: 'coding',    label: 'Coding',     icon: TrendingUp    },
];

/* ─── Difficulty badge ────────────────────────────────────────────────────── */
const DiffBadge = ({ difficulty }) => {
  const map = {
    easy:   { bg: 'bg-nb-green',  text: 'text-white' },
    medium: { bg: 'bg-nb-yellow', text: 'text-nb-black' },
    hard:   { bg: 'bg-nb-red',    text: 'text-white' },
  };
  const s = map[difficulty] || { bg: 'bg-[#F5F1E8]', text: 'text-nb-black' };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-nb-black ${s.bg} ${s.text}`}
      style={{ borderRadius: '2px' }}
    >
      {difficulty}
    </span>
  );
};

/* ─── Loading skeleton ────────────────────────────────────────────────────── */
const Skeleton = () => (
  <div
    className="border-2 border-nb-black/15 bg-nb-black/5 animate-pulse p-6 space-y-3"
    style={{ borderRadius: '8px' }}
  >
    <div className="h-10 w-10 bg-nb-black/10" style={{ borderRadius: '5px' }} />
    <div className="h-4 bg-nb-black/10 w-3/4" style={{ borderRadius: '3px' }} />
    <div className="h-3 bg-nb-black/8 w-full" style={{ borderRadius: '3px' }} />
    <div className="h-3 bg-nb-black/8 w-2/3" style={{ borderRadius: '3px' }} />
    <div className="h-9 bg-nb-black/10 w-full mt-4" style={{ borderRadius: '4px' }} />
  </div>
);

/* ─── Page ────────────────────────────────────────────────────────────────── */
const MockTests = () => {
  const navigate                               = useNavigate();
  const [tests, setTests]                      = useState([]);
  const [stats, setStats]                      = useState(null);
  const [loading, setLoading]                  = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery]          = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (selectedCategory !== 'all') filters.category = selectedCategory;
        if (selectedDifficulty !== 'all') filters.difficulty = selectedDifficulty;
        const [testsData] = await Promise.all([
          testService.getAllTests(filters),
        ]);
        setTests(testsData);
        try {
          const statsData = await testService.getStats();
          setStats(statsData);
        } catch { setStats(null); }
      } catch (err) {
        console.error('Failed to load tests:', err);
        if (err.message?.includes('401')) navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCategory, selectedDifficulty, navigate]);

  const filtered = tests.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="border-b-3 border-nb-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-nb-black/45 mb-1">Practice</p>
            <h1
              className="font-bold tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.03em' }}
            >
              Mock Tests
            </h1>
            <p className="text-sm font-medium text-nb-black/55 mt-2">
              Aptitude, coding, verbal, and logical — fresh AI-generated questions each session.
            </p>
          </div>
          {stats && (
            <button
              onClick={() => navigate('/test-history')}
              className="btn btn-secondary btn-sm self-start"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              View history
            </button>
          )}
        </div>

        {/* ── Stats (if any) ───────────────────────────────────────────────── */}
        {stats && stats.totalTests > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Tests taken',   value: stats.totalTests,    icon: ClipboardList },
              { label: 'Average score', value: `${stats.averageScore}%`,  icon: TrendingUp    },
              { label: 'Highest score', value: `${stats.highestScore}%`,  icon: Award         },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="border-2 border-nb-black bg-white p-4 flex flex-col gap-2"
                style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-nb-black/45">{label}</span>
                  <Icon className="w-4 h-4 text-nb-black/35" aria-hidden="true" />
                </div>
                <span
                  className="font-black leading-none"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nb-black/40 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search tests…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nb-nb-input pl-10"
              aria-label="Search tests"
            />
          </div>
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={e => setSelectedDifficulty(e.target.value)}
            className="nb-select sm:w-44"
            aria-label="Filter by difficulty"
          >
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* ── Category tabs ─────────────────────────────────────────────────── */}
        <div
          className="flex border-2 border-nb-black bg-white overflow-x-auto"
          style={{ borderRadius: '6px', boxShadow: '3px 3px 0 #111111' }}
          role="tablist"
        >
          {CATEGORIES.map(({ value, label, icon: Icon }, i) => {
            const active = selectedCategory === value;
            return (
              <button
                key={value}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(value)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-wide whitespace-nowrap flex-shrink-0 border-r-2 last:border-r-0 border-nb-black transition-colors ${
                  active ? 'bg-nb-yellow text-nb-black' : 'text-nb-black/55 hover:bg-nb-yellow/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tests grid ────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="border-2 border-nb-black bg-white p-16 text-center space-y-4"
            style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
          >
            <div
              className="w-14 h-14 border-2 border-nb-black bg-[#F5F1E8] flex items-center justify-center mx-auto"
              style={{ borderRadius: '7px' }}
              aria-hidden="true"
            >
              <ClipboardList className="w-7 h-7 text-nb-black/30" />
            </div>
            <p className="font-bold text-nb-black/45 uppercase tracking-wide">No tests found</p>
            <p className="text-sm text-nb-black/35">Try adjusting your filters or search</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((test) => {
              const catInfo    = CATEGORIES.find(c => c.value === test.category);
              const CatIcon    = catInfo?.icon || ClipboardList;
              const completed  = (test.highestScore ?? 0) >= (test.passingScore ?? 60);
              const hasScore   = (test.highestScore ?? 0) > 0;

              return (
                <article
                  key={test._id}
                  className="border-2 border-nb-black bg-white flex flex-col group cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-100"
                  style={{ borderRadius: '8px', boxShadow: '4px 4px 0 #111111' }}
                  onClick={() => navigate(`/test/${test._id}`)}
                >
                  {/* Card body */}
                  <div className="p-5 flex-1 space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-10 h-10 bg-nb-black border-2 border-nb-black flex items-center justify-center flex-shrink-0"
                        style={{ borderRadius: '5px' }}
                        aria-hidden="true"
                      >
                        <CatIcon className="w-5 h-5 text-nb-yellow" />
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <DiffBadge difficulty={test.difficulty} />
                        {completed && (
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-nb-green bg-nb-green text-white"
                            style={{ borderRadius: '2px' }}
                          >
                            ✓ Done
                          </span>
                        )}
                        {test.isDynamic && (
                          <span
                            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-nb-black bg-nb-yellow text-nb-black"
                            style={{ borderRadius: '2px' }}
                          >
                            Dynamic
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title + desc */}
                    <div>
                      <h3
                        className="font-bold text-sm leading-tight mb-1.5"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {test.title}
                      </h3>
                      <p className="text-xs text-nb-black/55 leading-relaxed line-clamp-2">
                        {test.description}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs font-bold text-nb-black/50">
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
                        {test.questions?.length ?? '—'} Q
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {test.duration} min
                      </span>
                    </div>

                    {/* Best score bar */}
                    {hasScore && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="text-nb-black/50 uppercase tracking-wide">Best score</span>
                          <span
                            className="font-mono font-black text-nb-black"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            {test.highestScore}%
                          </span>
                        </div>
                        <div className="h-2 border-2 border-nb-black bg-[#F5F1E8]">
                          <div
                            className="h-full bg-nb-yellow border-r-2 border-nb-black transition-all duration-500"
                            style={{ width: `${test.highestScore}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA footer */}
                  <div className="border-t-2 border-nb-black px-5 py-3 flex items-center justify-between bg-[#F5F1E8]" style={{ borderRadius: '0 0 6px 6px' }}>
                    <span className="text-xs font-bold uppercase tracking-wide text-nb-black/50">
                      {completed ? 'Retake' : 'Start test'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5 text-nb-black/60" aria-hidden="true" />
                      <ArrowRight
                        className="w-4 h-4 text-nb-black/30 group-hover:text-nb-black group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MockTests;
