'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { detectSensitiveInfo, sanitizeInput, calculateReadTime } from '@/lib/utils';

const letterTemplates = [
  { id: 'DEAR_SON', label: 'Dear Son' },
  { id: 'DEAR_DAUGHTER', label: 'Dear Daughter' },
  { id: 'DEAR_CHILD', label: 'Dear Child' },
  { id: 'I_MISS_YOU', label: 'I Miss You' },
  { id: 'HAPPY_BIRTHDAY', label: 'Happy Birthday' },
  { id: 'WHAT_I_NEVER_SAID', label: 'What I Never Said' },
  { id: 'IM_SORRY', label: 'I\'m Sorry' },
  { id: 'IM_PROUD', label: 'I\'m Proud of You' },
  { id: 'IF_YOU_EVER_FIND', label: 'If You Ever Find This' },
  { id: 'IF_WE_TALK_AGAIN', label: 'If We Ever Talk Again' },
];

export default function WritePage() {
  const [step, setStep] = useState<'choose' | 'write' | 'review' | 'submit'>('choose');
  const [letterType, setLetterType] = useState<'PRIVATE' | 'PUBLIC' | 'SHARED'>('PRIVATE');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('DEAR_CHILD');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('A Parent, Somewhere');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sensitiveIssues, setSensitiveIssues] = useState<any[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  const handleContentChange = (text: string) => {
    setContent(text);
    // Check for sensitive info
    const issues = detectSensitiveInfo(text);
    setSensitiveIssues(issues);
    setShowWarning(issues.length > 0);
  };

  const readTime = calculateReadTime(content);

  return (
    <div className="min-h-screen py-12 md:py-20 gradient-warm dark:gradient-warm-dark">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Write Your Letter
            </h1>
            <p className="text-lg text-muted-foreground">
              Some words are too important to leave unsaid. Take your time.
            </p>
          </div>

          {step === 'choose' && (
            <div className="card-soft p-8 md:p-12 space-y-8">
              {/* Letter Type Selection */}
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">What kind of letter?</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      type: 'PRIVATE' as const,
                      title: 'Private Letter',
                      description: 'Only you can see this. Perfect for getting words out.',
                      icon: '🔒',
                    },
                    {
                      type: 'PUBLIC' as const,
                      title: 'Share Publicly',
                      description: 'Share anonymously with our community.',
                      icon: '🌍',
                    },
                    {
                      type: 'SHARED' as const,
                      title: 'Share With Someone',
                      description: 'Send via private link to someone specific.',
                      icon: '💌',
                    },
                  ].map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setLetterType(option.type)}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        letterType === option.type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-4xl mb-3">{option.icon}</div>
                      <h3 className="font-bold text-lg mb-2">{option.title}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h2 className="font-display text-2xl font-bold mb-6">Choose a template (optional)</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {letterTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('write')}
                className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                Continue to Writing
              </button>
            </div>
          )}

          {step === 'write' && (
            <div className="card-soft p-8 md:p-12 space-y-6">
              <div className="flex gap-4 mb-6 pb-6 border-b border-border">
                <button
                  onClick={() => setStep('choose')}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back
                </button>
                <div className="flex-1" />
                <span className="text-sm text-muted-foreground">
                  {readTime} min read • {sensitiveIssues.length} issues detected
                </span>
              </div>

              {/* Warning for sensitive info */}
              {showWarning && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">
                    ⚠️ We detected some information that should probably be removed:
                  </p>
                  <ul className="space-y-1">
                    {sensitiveIssues.slice(0, 3).map((issue, i) => (
                      <li key={i} className="text-xs text-amber-800 dark:text-amber-300">
                        • <strong>{issue.type}:</strong> "{issue.text}"
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-3">
                    Removing personal details protects you and keeps the focus on your feelings.
                  </p>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Letter Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(sanitizeInput(e.target.value))}
                  placeholder="Give your letter a title..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Opening */}
              <div>
                <label className="block text-sm font-medium mb-2">Letter Opening</label>
                <div className="p-4 bg-secondary rounded-lg border border-border">
                  <p className="font-display text-2xl font-bold mb-4">
                    {selectedTemplate === 'DEAR_SON' && 'Dear Son,'}
                    {selectedTemplate === 'DEAR_DAUGHTER' && 'Dear Daughter,'}
                    {selectedTemplate === 'DEAR_CHILD' && 'Dear Child,'}
                    {selectedTemplate === 'I_MISS_YOU' && 'I miss you.'}
                    {selectedTemplate === 'WHAT_I_NEVER_SAID' && 'What I Never Said —'}
                    {!selectedTemplate && 'Dear...'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Words ({content.length} characters)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(sanitizeInput(e.target.value))}
                  placeholder="Write freely. There's no word limit. You can save as a draft and come back anytime."
                  className="w-full h-96 rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-sans resize-none"
                />
              </div>

              {/* Author Name (for public letters) */}
              {letterType === 'PUBLIC' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    How should we credit this? (anonymous by default)
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(sanitizeInput(e.target.value))}
                    placeholder="e.g., A Dad, Somewhere"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {/* Recipient Email (for shared letters) */}
              {letterType === 'SHARED' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Recipient's Email Address
                  </label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="their@email.com"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setStep('review')}
                  className="flex-1 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
                >
                  Save (💾) className="inline h-4 w-4 mr-2" />
                  Save & Review
                </button>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="card-soft p-8 md:p-12 space-y-6">
              <h2 className="font-display text-2xl font-bold">Review Your Letter</h2>

              <div className="bg-secondary p-8 rounded-lg border border-border space-y-4">
                <p className="font-display text-2xl font-bold">
                  {selectedTemplate === 'DEAR_SON' && 'Dear Son,'}
                  {selectedTemplate === 'DEAR_DAUGHTER' && 'Dear Daughter,'}
                  {selectedTemplate === 'DEAR_CHILD' && 'Dear Child,'}
                  {selectedTemplate === 'I_MISS_YOU' && 'I miss you.'}
                  {selectedTemplate === 'WHAT_I_NEVER_SAID' && 'What I Never Said —'}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">{content}</p>
              </div>

              {showWarning && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-3">
                    Please review the flagged information before submitting.
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setStep('write')}
                  className="flex-1 rounded-lg border border-border bg-background px-8 py-3 font-medium text-foreground transition-all hover:bg-secondary"
                >
                  Back to Editing
                </button>
                <button
                  onClick={() => setStep('submit')}
                  disabled={showWarning}
                  className="flex-1 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SendIcon className="inline h-4 w-4 mr-2" />
                  {letterType === 'PRIVATE' ? 'Save Letter' : 'Submit for Review'}
                </button>
              </div>
            </div>
          )}

          {step === 'submit' && (
            <div className="card-soft p-8 md:p-12 text-center space-y-6">
              <div className="text-6xl">✓</div>
              <h2 className="font-display text-3xl font-bold">
                {letterType === 'PRIVATE' ? 'Letter Saved' : 'Letter Submitted'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {letterType === 'PRIVATE'
                  ? 'Your private letter has been saved securely. You can edit it anytime.'
                  : 'Thank you for sharing. Our team will review your letter to ensure it\'s safe for our community, then it will be published.'}
              </p>
              <button
                onClick={() => {
                  setStep('choose');
                  setContent('');
                  setTitle('');
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                <Copy size={20} />
                Write Another Letter
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
