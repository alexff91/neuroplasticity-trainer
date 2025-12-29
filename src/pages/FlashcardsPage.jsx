import { useState } from 'react';
import { BookOpen, Play, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardManager from '../components/flashcards/CardManager';
import { useApp } from '../contexts/AppContext';
import { getDueCards } from '../utils/sm2';

export default function FlashcardsPage() {
  const { state } = useApp();
  const dueCards = getDueCards(state.flashcards);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Flashcards</h1>
          <p className="text-slate-400">
            {state.flashcards.length} total cards • {dueCards.length} due today
          </p>
        </div>
        <Link
          to="/practice"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          <Play className="w-5 h-5" />
          Start Practice
        </Link>
      </div>

      {/* Card Manager */}
      <CardManager />
    </div>
  );
}
