import { useState } from 'react';
import { RotateCcw } from 'lucide-react';

export default function FlashCard({ card, onFlip, flipped }) {
  return (
    <div
      className={`flashcard w-full max-w-2xl mx-auto cursor-pointer ${flipped ? 'flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="flashcard-inner relative w-full h-80">
        {/* Front */}
        <div className="flashcard-front absolute inset-0 glass-card rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-indigo-500/30 hover:border-indigo-500/50 transition-colors">
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm font-medium">
            {card.category}
          </div>
          <div className="absolute top-4 right-4 text-slate-500">
            <RotateCcw className="w-5 h-5" />
          </div>
          <p className="text-xl md:text-2xl text-center text-white font-medium leading-relaxed">
            {card.front}
          </p>
          <p className="text-slate-500 text-sm mt-6">Click to reveal answer</p>
        </div>

        {/* Back */}
        <div className="flashcard-back absolute inset-0 glass-card rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-emerald-500/30">
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
            Answer
          </div>
          <p className="text-lg md:text-xl text-center text-slate-200 leading-relaxed">
            {card.back}
          </p>
        </div>
      </div>
    </div>
  );
}
