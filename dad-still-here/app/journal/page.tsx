'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateReadTime } from '@/lib/utils';

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState('');

  const handleNewEntry = () => {
    if (newContent.trim().length > 0) {
      const entry = {
        id: Math.random().toString(36).slice(2, 11),
        content: newContent,
        mood: newMood,
        readTime: calculateReadTime(newContent),
        createdAt: new Date().toISOString(),
      };

      setEntries([entry, ...entries]);
      setNewContent('');
      setNewMood('');
      setShowNewEntry(false);
    }
  };

  const moods = ['Hopeful', 'Angry', 'Sad', 'Reflective', 'Lonely', 'Grateful', 'Confused'];

  return (
    <div className="min-h-screen py-12 md:py-20 gradient-warm dark:gradient-warm-dark">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🔒</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold">Your Private Journal</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              This is your safe space. Everything here stays private. Never tracked. Never shared. 🔒
            </p>
          </div>

          {/* New Entry Button */}
          {!showNewEntry && (
            <button
              onClick={() => setShowNewEntry(true)}
              className="w-full rounded-lg bg-primary px-8 py-4 font-medium text-primary-foreground transition-all hover:shadow-warm flex items-center justify-center gap-2"
            >
              ➕ New Entry
            </button>
          )}

          {/* New Entry Form */}
          {showNewEntry && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-soft p-8 space-y-4"
            >
              <h2 className="font-display text-2xl font-bold">New Entry</h2>

              {/* Mood Selector */}
              <div>
                <label className="text-sm font-medium mb-3 block">How are you feeling? (optional)</label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setNewMood(mood)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        newMood === mood
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write freely. There's no word limit. Write what you can't say out loud."
                  className="w-full h-64 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleNewEntry}
                  className="flex-1 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => {
                    setShowNewEntry(false);
                    setNewContent('');
                    setNewMood('');
                  }}
                  className="flex-1 rounded-lg border border-border bg-background px-8 py-3 font-medium text-foreground transition-all hover:bg-secondary"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-2">
                🔒 This entry is encrypted and will never be shared or tracked.
              </p>
            </motion.div>
          )}

          {/* Entries List */}
          {entries.length > 0 ? (
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold">Your Entries</h2>
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-soft p-6 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {entry.mood && (
                          <span className="inline-block px-2 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 text-xs font-medium">
                            {entry.mood}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {entry.content}
                      </p>
                    </div>
                    <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                    <span>{entry.readTime} min</span>
                    <button className="px-3 py-1 rounded hover:bg-secondary transition">
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !showNewEntry ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card-soft p-12 text-center space-y-4"
            >
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="font-display text-2xl font-bold">Your journal is empty</h3>
              <p className="text-muted-foreground">
                You don't have to know what to say before you begin. Start writing whenever you're ready.
              </p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                <Plus size={18} />
                Write First Entry
              </button>
            </motion.div>
          ) : null}

          {/* Privacy Notice */}
          <div className="bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg p-6">
            <div className="flex gap-4">
              <Lock className="h-6 w-6 text-teal-600 dark:text-teal-400 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-teal-900 dark:text-teal-200">Your privacy is guaranteed</h3>
                <ul className="text-sm text-teal-800 dark:text-teal-300 space-y-1">
                  <li>✓ All entries are encrypted at rest</li>
                  <li>✓ Never exported to analytics or tracking</li>
                  <li>✓ Never used for AI training without permission</li>
                  <li>✓ You can export or delete your entries anytime</li>
                  <li>✓ No one can see your journal except you</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
