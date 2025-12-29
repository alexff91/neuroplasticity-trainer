import { useState } from 'react';
import { Plus, Trash2, Edit3, Search, Filter, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { createCard } from '../../utils/sm2';

export default function CardManager() {
  const { state, actions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
  });

  const categories = [...new Set(state.flashcards.map(c => c.category))];

  const filteredCards = state.flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || card.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.front.trim() || !formData.back.trim()) return;

    if (editingCard) {
      // Update existing card
      const updatedCards = state.flashcards.map(card =>
        card.id === editingCard.id
          ? { ...card, front: formData.front, back: formData.back, category: formData.category || 'General' }
          : card
      );
      // This would need a dispatch for UPDATE_FLASHCARDS
    } else {
      // Create new card
      const newCard = createCard(
        formData.front,
        formData.back,
        formData.category || 'General'
      );
      actions.addFlashcard(newCard);
    }

    setFormData({ front: '', back: '', category: '' });
    setShowForm(false);
    setEditingCard(null);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      front: card.front,
      back: card.back,
      category: card.category,
    });
    setShowForm(true);
  };

  const handleDelete = (cardId) => {
    if (confirm('Are you sure you want to delete this card?')) {
      actions.deleteFlashcard(cardId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => {
            setEditingCard(null);
            setFormData({ front: '', back: '', category: '' });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Card
        </button>
      </div>

      {/* Card Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingCard ? 'Edit Card' : 'Create New Card'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingCard(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Front (Question)
                </label>
                <textarea
                  value={formData.front}
                  onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                  placeholder="Enter the question or prompt..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Back (Answer)
                </label>
                <textarea
                  value={formData.back}
                  onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                  placeholder="Enter the answer..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., JavaScript, React, CSS..."
                  list="categories"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCard(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  {editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCards.map(card => (
          <div
            key={card.id}
            className="glass-card rounded-xl p-4 hover:border-indigo-500/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="px-2 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                {card.category}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(card)}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h4 className="text-white font-medium mb-2 line-clamp-2">{card.front}</h4>
            <p className="text-slate-400 text-sm line-clamp-2">{card.back}</p>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
              <span>Interval: {card.interval || 0}d</span>
              <span>Reviews: {card.timesStudied || 0}</span>
              <span>EF: {(card.easeFactor || 2.5).toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">
            {searchTerm || filterCategory !== 'all'
              ? 'No cards match your search criteria.'
              : 'No flashcards yet. Create your first one!'}
          </p>
        </div>
      )}
    </div>
  );
}
