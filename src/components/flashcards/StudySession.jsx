import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2, XCircle, Zap, Clock, Brain, ChevronRight } from 'lucide-react';
import FlashCard from './FlashCard';
import { useApp } from '../../contexts/AppContext';
import { calculateCognitiveLoad, getCognitiveLoadStatus, getBrainBreakSuggestion } from '../../utils/cognitiveLoad';

const QUALITY_RATINGS = [
  { value: 0, label: 'Blackout', color: 'bg-red-500', description: 'Complete blank' },
  { value: 1, label: 'Wrong', color: 'bg-red-400', description: 'Incorrect, recognized answer' },
  { value: 2, label: 'Hard', color: 'bg-orange-500', description: 'Incorrect, seemed easy after' },
  { value: 3, label: 'Difficult', color: 'bg-yellow-500', description: 'Correct with difficulty' },
  { value: 4, label: 'Good', color: 'bg-emerald-400', description: 'Correct with hesitation' },
  { value: 5, label: 'Perfect', color: 'bg-emerald-500', description: 'Instant recall' },
];

export default function StudySession({ cards: initialCards, onComplete }) {
  const navigate = useNavigate();
  const { actions } = useApp();
  const [cards, setCards] = useState(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    xpEarned: 0,
    responseTimes: [],
    startTime: Date.now(),
  });
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [cognitiveLoad, setCognitiveLoad] = useState(0);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const [breakSuggestion, setBreakSuggestion] = useState(null);

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  // Update cognitive load periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const recentTimes = sessionStats.responseTimes.slice(-5);
      const avgTime = recentTimes.length > 0
        ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length
        : 5000;

      const total = sessionStats.correct + sessionStats.incorrect;
      const accuracy = total > 0 ? sessionStats.correct / total : 0.8;

      const load = calculateCognitiveLoad({
        avgResponseTime: avgTime,
        recentAccuracy: accuracy,
        sessionDuration: Date.now() - sessionStats.startTime,
        avgCardDifficulty: 0.5,
      });

      setCognitiveLoad(load);

      // Suggest break if load is high
      if (load > 70 && !showBreakSuggestion) {
        const suggestion = getBrainBreakSuggestion(load, Date.now() - sessionStats.startTime);
        setBreakSuggestion(suggestion);
        setShowBreakSuggestion(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionStats, showBreakSuggestion]);

  const handleFlip = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
      setShowRating(true);
    }
  }, [flipped]);

  const handleRating = useCallback((quality) => {
    const responseTime = Date.now() - cardStartTime;
    const result = actions.reviewCard(currentCard.id, quality);

    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (result.isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (result.isCorrect ? 0 : 1),
      xpEarned: prev.xpEarned + result.xpGained,
      responseTimes: [...prev.responseTimes, responseTime],
    }));

    // Move to next card or complete session
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
      setShowRating(false);
      setCardStartTime(Date.now());
    } else {
      // Session complete
      if (onComplete) {
        onComplete({
          ...sessionStats,
          correct: sessionStats.correct + (result.isCorrect ? 1 : 0),
          incorrect: sessionStats.incorrect + (result.isCorrect ? 0 : 1),
          xpEarned: sessionStats.xpEarned + result.xpGained,
          totalCards: cards.length,
          duration: Date.now() - sessionStats.startTime,
        });
      }
    }
  }, [currentCard, currentIndex, cards.length, actions, cardStartTime, sessionStats, onComplete]);

  const handleKeyPress = useCallback((e) => {
    if (!flipped && e.code === 'Space') {
      e.preventDefault();
      handleFlip();
    } else if (flipped && showRating) {
      const key = parseInt(e.key);
      if (key >= 0 && key <= 5) {
        handleRating(key);
      }
    }
  }, [flipped, showRating, handleFlip, handleRating]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const loadStatus = getCognitiveLoadStatus(cognitiveLoad);

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No cards to study!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">Study Session</h2>
            <p className="text-sm text-slate-400">
              Card {currentIndex + 1} of {cards.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Session Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">{sessionStats.correct}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400">{sessionStats.incorrect}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400">{sessionStats.xpEarned} XP</span>
            </div>
          </div>

          {/* Cognitive Load Indicator */}
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4" style={{ color: loadStatus.color }} />
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${cognitiveLoad}%`, backgroundColor: loadStatus.color }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && breakSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md mx-4 animate-slide-up">
            <div className="text-center">
              <div className="text-4xl mb-4">{breakSuggestion.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">Time for a Break!</h3>
              <p className="text-slate-400 mb-4">{loadStatus.message}</p>
              <div className="p-4 rounded-xl bg-slate-800/50 mb-6">
                <h4 className="font-medium text-white mb-1">{breakSuggestion.activity}</h4>
                <p className="text-sm text-slate-400">{breakSuggestion.description}</p>
                <p className="text-xs text-indigo-400 mt-2">{breakSuggestion.duration}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBreakSuggestion(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Continue Studying
                </button>
                <button
                  onClick={() => {
                    setShowBreakSuggestion(false);
                    navigate('/pomodoro');
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  Take Break
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flashcard */}
      <FlashCard card={currentCard} flipped={flipped} onFlip={handleFlip} />

      {/* Rating Buttons */}
      {showRating && (
        <div className="mt-8 animate-slide-up">
          <p className="text-center text-slate-400 mb-4">How well did you know this?</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {QUALITY_RATINGS.map((rating) => (
              <button
                key={rating.value}
                onClick={() => handleRating(rating.value)}
                className={`p-3 rounded-xl transition-all hover:scale-105 ${rating.color} text-white`}
              >
                <div className="text-lg font-bold">{rating.value}</div>
                <div className="text-xs opacity-90">{rating.label}</div>
              </button>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm mt-4">
            Press 0-5 on keyboard or click a button
          </p>
        </div>
      )}

      {/* Keyboard Hint */}
      {!flipped && (
        <p className="text-center text-slate-500 text-sm mt-8">
          Press <span className="px-2 py-1 rounded bg-slate-800 text-slate-300">Space</span> to flip
        </p>
      )}
    </div>
  );
}
