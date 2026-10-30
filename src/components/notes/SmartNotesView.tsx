import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartNote } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Pin,
  Sparkles,
  Bell,
  Trash2,
  Tag,
  Check,
  Calendar,
  Layers
} from 'lucide-react';

export const SmartNotesView: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, addFlashcards, lang, t, isRtl, addXp } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Algebra');
  const [newColor, setNewColor] = useState('#e0e7ff');
  const [selectedStickers, setSelectedStickers] = useState<string[]>(['💡']);
  const [isPinned, setIsPinned] = useState(false);

  // Flashcard conversion state
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const availableStickers = ['π', '√', '∑', '∞', '📐', '⭐', '🏆', '💡', '🎯', '⚖️', '🔥', '🧠'];
  const noteColors = ['#e0e7ff', '#dcfce7', '#fef3c7', '#fce7f3', '#f3e8ff', '#e0f2fe'];

  const toggleSticker = (s: string) => {
    setSelectedStickers((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleCreateNote = () => {
    if (!newTitle.trim()) return;

    addNote({
      title: newTitle,
      content: newContent,
      subject: newSubject,
      color: newColor,
      isPinned,
      stickers: selectedStickers,
      tags: [newSubject.toLowerCase()]
    });

    setNewTitle('');
    setNewContent('');
    setSelectedStickers(['💡']);
    setShowCreateModal(false);
  };

  // Convert Note into Flashcards
  const handleConvertToFlashcards = async (note: SmartNote) => {
    setConvertingId(note.id);
    try {
      // Create flashcards from note lines/concepts
      const lines = note.content.split('\n').filter((l) => l.trim().length > 0);
      const generatedCards = lines.slice(0, 3).map((line, idx) => ({
        front: `${isRtl ? 'سؤال استذكار من الملاحظة' : 'Recall from note'}: ${note.title} #${idx + 1}`,
        back: line,
        topic: note.subject,
        mastered: false
      }));

      addFlashcards(generatedCards);
      addXp(20);
      alert(isRtl ? 'تم تحويل الملاحظة بنجاح إلى بطاقات استذكار في المساعد الدراسي!' : 'Successfully converted note into smart flashcards in Study Assistant!');
    } catch (err) {
      console.error(err);
    } finally {
      setConvertingId(null);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t.notes.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.notes.subtitle}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.notes.newNote}</span>
        </button>
      </div>

      {/* 2. Search & Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.notes.searchNotes}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['All', 'Algebra', 'Geometry', 'Fractions', 'Calculus'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {sub === 'All' ? t.notes.allSubjects : sub}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.notes.pinnedNotes}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isRtl={isRtl}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => updateNote(note.id, { isPinned: !note.isPinned })}
                onConvertToFlashcards={() => handleConvertToFlashcards(note)}
                converting={convertingId === note.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. All Other Notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t.notes.otherNotes}
          </h2>
        )}

        {otherNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isRtl={isRtl}
                onDelete={() => deleteNote(note.id)}
                onTogglePin={() => updateNote(note.id, { isPinned: !note.isPinned })}
                onConvertToFlashcards={() => handleConvertToFlashcards(note)}
                converting={convertingId === note.id}
              />
            ))}
          </div>
        ) : (
          pinnedNotes.length === 0 && (
            <div className="text-center py-12 space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
              <span className="text-4xl">📝</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {t.notes.emptyNotes}
              </p>
            </div>
          )
        )}
      </div>

      {/* MODAL: Create New Note */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.notes.newNote}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.notes.noteTitlePlaceholder}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold dark:text-white"
              />

              <textarea
                rows={5}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={t.notes.noteContentPlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs dark:text-white leading-relaxed resize-none"
              />

              {/* Subject & Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold dark:text-white border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Algebra">Algebra</option>
                    <option value="Geometry">Geometry</option>
                    <option value="Fractions">Fractions</option>
                    <option value="Calculus">Calculus</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Color Tag</label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {noteColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full border border-slate-300 transition-transform ${
                          newColor === c ? 'scale-125 ring-2 ring-indigo-500' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Math Stickers */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  {t.notes.addSticker}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableStickers.map((stk) => {
                    const isSelected = selectedStickers.includes(stk);
                    return (
                      <button
                        key={stk}
                        type="button"
                        onClick={() => toggleSticker(stk)}
                        className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs scale-110'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {stk}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pin toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isRtl ? 'تثبيت هذه الملاحظة في أعلى الصفحة' : 'Pin this note to the top'}
                </span>
              </label>
            </div>

            <button
              onClick={handleCreateNote}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {isRtl ? 'حفظ الملاحظة' : 'Save Note'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual Note Card
const NoteCard: React.FC<{
  note: SmartNote;
  isRtl: boolean;
  onDelete: () => void;
  onTogglePin: () => void;
  onConvertToFlashcards: () => void;
  converting: boolean;
}> = ({ note, isRtl, onDelete, onTogglePin, onConvertToFlashcards, converting }) => {
  return (
    <div
      className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-1"
      style={{ backgroundColor: note.color }}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {note.stickers?.map((stk, i) => (
              <span key={i} className="text-sm">
                {stk}
              </span>
            ))}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/10 text-slate-800">
              {note.subject}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              className={`p-1 rounded-md text-slate-600 hover:bg-black/10 transition ${
                note.isPinned ? 'text-indigo-700 fill-indigo-700' : ''
              }`}
              title="Pin Note"
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-black/10 transition"
              title="Delete Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h3 className="font-extrabold text-sm text-slate-900 mt-2">
          {note.title}
        </h3>

        <p className="text-xs text-slate-800 leading-relaxed mt-1.5 whitespace-pre-line font-normal">
          {note.content}
        </p>
      </div>

      <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
        <span className="text-slate-600">{note.createdAt}</span>

        <button
          onClick={onConvertToFlashcards}
          disabled={converting}
          className="flex items-center gap-1 font-bold text-indigo-800 hover:underline cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
          <span>{converting ? '...' : (isRtl ? 'تحويل لبطاقات' : 'Make Flashcards')}</span>
        </button>
      </div>
    </div>
  );
};
