import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Shuffle, Filter, Zap, Target, Clock, Brain } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getDueCards, getCardsByDifficulty, estimateStudyTime } from '../../utils/sm2';
import { createInterleavedSession, getPracticeRecommendation } from '../../utils/interleaving';
import StudySession from '../flashcards/StudySession';

export default function PracticeSession() {
  const navigate = useNavigate();
  const { state } = useApp();
  const [activeSession, setActiveSession] = useState(null);
  const [sessionConfig, setSessionConfig] = useState({
    mode: 'interleaved',
    category: 'all',
    maxCards: 20,
  });

  const stats = useMemo(() => {
    const dueCards = getDueCards(state.flashcards);
    const cardsByDifficulty = getCardsByDifficulty(state.flashcards);
    const recommendation = getPracticeRecommendation(state.flashcards, state.userStats);
    const categories = [...new Set(state.flashcards.map(c => c.category))];

    return {
      dueCards,
      cardsByDifficulty,
      recommendation,
      categories,
      estimatedTime: estimateStudyTime(dueCards),
    };
  }, [state.flashcards, state.userStats]);

  const handleStartSession = (mode) => {
    let cards = [];

    switch (mode) {
      case 'due':
        cards = stats.dueCards;
        break;
      case 'new':
        cards = stats.cardsByDifficulty.new;
        break;
      case 'learning':
        cards = stats.cardsByDifficulty.learning;
        break;
      case 'interleaved':
      default:
        const filteredCards = sessionConfig.category === 'all'
          ? state.flashcards
          : state.flashcards.filter(c => c.category === sessionConfig.category);
        cards = createInterleavedSession(filteredCards, {
          maxCards: sessionConfig.maxCards,
          prioritizeDue: true,
        });
        break;
    }

    if (cards.length === 0) {
      alert('No cards available for this session type!');
      return;
    }

    setActiveSession({
      cards: cards.slice(0, sessionConfig.maxCards),
      mode,
      startTime: Date.now(),
    });
  };

  const handleSessionComplete = (results) => {
    setActiveSession(null);
    // Could show a summary modal here
  };

  if (activeSession) {
    return (
      <StudySession
        cards={activeSession.cards}
        onComplete={handleSessionComplete}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Practice Session</h1>
        <p className="text-slate-400">Choose a practice mode to optimize your learning</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{stats.dueCards.length}</div>
          <div className="text-sm text-slate-400">Due Today</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.cardsByDifficulty.new.length}</div>
          <div className="text-sm text-slate-400">New Cards</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.cardsByDifficulty.learning.length}</div>
          <div className="text-sm text-slate-400">Learning</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.estimatedTime} min</div>
          <div className="text-sm text-slate-400">Est. Time</div>
        </div>
      </div>

      {/* AI Recommendation */}
      {stats.recommendation && (
        <div className="glass-card rounded-xl p-6 mb-8 border border-indigo-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-indigo-500/20">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Recommended Practice</h3>
              <p className="text-slate-400 mb-3">
                Based on your learning patterns, we suggest{' '}
                <span className="text-indigo-400 font-medium">
                  {stats.recommendation.practiceType} practice
                </span>{' '}
                with {stats.recommendation.suggestedSessionSize} cards.
              </p>
              <ul className="space-y-1">
                {stats.recommendation.reasoning.map((reason, i) => (
                  <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                    {reason}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleStartSession(stats.recommendation.practiceType)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Recommended
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modes */}
      <h2 className="text-xl font-semibold text-white mb-4">Practice Modes</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {/* Interleaved Practice */}
        <div className="glass-card rounded-xl p-6 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Shuffle className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Interleaved Practice</h3>
              <p className="text-sm text-slate-400">Mixed topics for better retention</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Cards from different categories are mixed together. Research shows this leads to
            better long-term learning and transfer of knowledge.
          </p>
          <button
            onClick={() => handleStartSession('interleaved')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Interleaved
          </button>
        </div>

        {/* Due Cards */}
        <div className="glass-card rounded-xl p-6 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Due for Review</h3>
              <p className="text-sm text-slate-400">{stats.dueCards.length} cards due today</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Review cards that are scheduled for today based on the spaced repetition algorithm.
            Stay on schedule for optimal retention.
          </p>
          <button
            onClick={() => handleStartSession('due')}
            disabled={stats.dueCards.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Review Due ({stats.dueCards.length})
          </button>
        </div>

        {/* New Cards */}
        <div className="glass-card rounded-xl p-6 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">New Cards</h3>
              <p className="text-sm text-slate-400">{stats.cardsByDifficulty.new.length} new cards</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-4">
            Learn cards you haven't studied yet. New cards start with the shortest review interval.
          </p>
          <button
            onClick={() => handleStartSession('new')}
            disabled={stats.cardsByDifficulty.new.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Learn New ({stats.cardsByDifficulty.new.length})
          </button>
        </div>

        {/* Focused Practice */}
        <div className="glass-card rounded-xl p-6 hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Focused Practice</h3>
              <p className="text-sm text-slate-400">Study a specific category</p>
            </div>
          </div>
          <div className="mb-4">
            <select
              value={sessionConfig.category}
              onChange={(e) => setSessionConfig({ ...sessionConfig, category: e.target.value })}
              className="w-full px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {stats.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleStartSession('interleaved')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Focused
          </button>
        </div>
      </div>

      {/* Session Settings */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Settings</h3>
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Cards per session</label>
            <div className="flex items-center gap-2">
              {[10, 20, 30, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setSessionConfig({ ...sessionConfig, maxCards: num })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    sessionConfig.maxCards === num
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
