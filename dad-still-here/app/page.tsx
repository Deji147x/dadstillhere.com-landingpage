'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  // Topics for section 5
  const topics = [
    { title: 'Missing Your Child', href: '/topics/missing-child' },
    { title: 'Estrangement', href: '/topics/estrangement' },
    { title: 'Divorce & Separation', href: '/topics/divorce' },
    { title: 'Fatherhood', href: '/topics/fatherhood' },
    { title: 'Motherhood', href: '/topics/motherhood' },
    { title: 'Letters', href: '/topics/letters' },
    { title: 'Reconnection', href: '/topics/reconnection' },
    { title: 'Recovery', href: '/topics/recovery' },
    { title: 'Family Silence', href: '/topics/family-silence' },
    { title: 'When You Don\'t Know What to Say', href: '/topics/when-you-dont-know' },
  ];

  // Sample letters for section 6
  const sampleLetters = [
    {
      id: 1,
      title: 'Dear Daughter, On Your Birthday',
      category: 'Birthday',
      topic: 'Missing You',
      readTime: 5,
    },
    {
      id: 2,
      title: 'I Don\'t Know If You Remember',
      category: 'Memory',
      topic: 'Estrangement',
      readTime: 7,
    },
    {
      id: 3,
      title: 'What I Never Said',
      category: 'Unspoken Words',
      topic: 'Regret',
      readTime: 6,
    },
    {
      id: 4,
      title: 'If You Ever Find This',
      category: 'Hope',
      topic: 'Reconnection',
      readTime: 8,
    },
  ];

  return (
    <>
      {/* SECTION 1: IMMERSIVE HERO */}
      <section className="relative min-h-screen w-full overflow-hidden gradient-warm dark:gradient-warm-dark flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gold-500/5" />
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-32 text-center">
          <motion.div {...fadeInUp} className="space-y-6">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Still loving them.
              <br />
              <span className="gradient-text">Still here.</span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
              For parents living through distance, silence, estrangement and the words they still
              hope to say.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row justify-center pt-4">
              <Link
                href="/watch"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                ▶
                Watch a Story
              </Link>
              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 py-3 font-medium text-foreground transition-all hover:bg-secondary"
              >
                ✉
                Write a Letter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: YOU ARE NOT ALONE */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">You Are Not Alone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Some stories are too complicated for a comment section. Some words are too important
              to leave unsaid. This is a place to write them down.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Play className="h-8 w-8" />,
                label: 'WATCH',
                description: 'Stories and conversations',
                href: '/watch',
              },
              {
                icon: <Mail className="h-8 w-8" />,
                label: 'WRITE',
                description: 'Letters you need to say',
                href: '/write',
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                label: 'REMEMBER',
                description: 'Private reflections and journal',
                href: '/journal',
              },
            ].map((pathway, i) => (
              <motion.a
                key={i}
                href={pathway.href}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                className="card-soft p-6 text-center group cursor-pointer"
              >
                <div className="flex justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                  {pathway.icon}
                </div>
                <h3 className="font-display text-2xl font-bold mb-2">{pathway.label}</h3>
                <p className="text-muted-foreground">{pathway.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED STORY */}
      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="card-soft overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-gold-200 to-teal-200 dark:from-navy-700 dark:to-teal-900 flex items-center justify-center">
                <Play size={64} className="text-muted-foreground/30" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                  Featured Story
                </span>
                <h3 className="font-display text-3xl font-bold mb-4">
                  The Phone Doesn't Ring Anymore
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  What happens when a parent slowly realizes that silence has become part of
                  everyday life? A story about the small moments that add up to big absences.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>8 min read</span>
                  <span>•</span>
                  <span>Estrangement</span>
                </div>
                <Link
                  href="/stories/phone-doesnt-ring"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-all hover:shadow-warm w-fit"
                >
                  <Play size={18} />
                  Watch the Story
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: FEATURED LETTER */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="max-w-2xl mx-auto">
            <div className="card-soft p-8 md:p-12">
              <p className="font-display text-2xl font-bold mb-6">Dear Son,</p>
              <p className="text-lg leading-relaxed text-foreground mb-8 italic">
                I keep thinking about the last real conversation we had. Do you remember? You were
                telling me about your new apartment, the one with the balcony you were so excited
                about. I was only half-listening then, already thinking about work emails I needed
                to answer. I would give anything for that moment back. Not to say something
                profound, just to actually listen...
              </p>
              <div className="flex gap-4">
                <Link
                  href="/letters/dear-son-1"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition-all hover:shadow-warm"
                >
                  Read the Letter
                </Link>
                <Link
                  href="/write"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-2 font-medium text-foreground transition-all hover:bg-secondary"
                >
                  Write Your Own
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: EXPLORE TOPICS */}
      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">Explore Your Experience</h2>
            <p className="text-lg text-muted-foreground">Find stories, letters, and resources for your journey</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topics.map((topic, i) => (
              <motion.a
                key={topic.href}
                href={topic.href}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: (i % 5) * 0.05 }}
                className="card-soft p-4 text-center hover:border-primary/50"
              >
                <p className="font-medium text-foreground">{topic.title}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: LETTER ARCHIVE */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">The Open Letter Archive</h2>
            <p className="text-lg text-muted-foreground">Words from parents learning to live with silence</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {sampleLetters.map((letter, i) => (
              <motion.a
                key={letter.id}
                href={`/letters/${letter.id}`}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                className="card-soft p-6 group"
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-primary uppercase">{letter.category}</p>
                  <h3 className="font-display text-lg font-bold group-hover:text-primary transition">
                    {letter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{letter.topic}</p>
                  <p className="text-xs text-muted-foreground">{letter.readTime} min read</p>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div {...fadeInUp} className="text-center">
            <Link
              href="/letters"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
            >
              💬
              Explore All Letters
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 7: NEWSLETTER */}
      <section className="w-full py-16 md:py-24 bg-gradient-warm dark:gradient-warm-dark">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="text-center">
            <h2 className="font-display text-4xl font-bold mb-4">The Sunday Letter</h2>
            <p className="text-lg text-muted-foreground mb-8">
              One thoughtful note every Sunday. Stories, letters and perspectives for parents who
              are still finding their way through the silence.
            </p>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" required className="mt-1" />
                <span className="text-muted-foreground">
                  I agree to receive emails about new stories and resources. I can unsubscribe anytime.
                </span>
              </label>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                Join the Sunday Letter
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: COMMUNITY PROMPT */}
      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="card-soft p-8 md:p-12 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">This Week's Reflection</h2>
            <p className="text-xl text-foreground mb-8 italic">
              "What is one ordinary moment with your child that you still remember?"
            </p>
            <p className="text-muted-foreground mb-8">
              Join our community and share your reflection. All responses are reviewed for safety
              and can be posted anonymously.
            </p>
            <Link
              href="/community"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
            >
              <Heart size={20} />
              Share Your Reflection
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 9: FINAL CTA */}
      <section className="w-full py-20 md:py-32">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="space-y-4">
              <h2 className="font-display text-5xl md:text-6xl font-bold">
                You still have something to say.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether it's a letter that needs writing, a memory that deserves remembering, or a
                story that's finally ready to be told, there's a place for your words here.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row justify-center pt-4">
              <Link
                href="/write"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-all hover:shadow-warm"
              >
                ✉
                Write a Letter
              </Link>
              <Link
                href="/journal"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 py-3 font-medium text-foreground transition-all hover:bg-secondary"
              >
                📖
                Start Your Journal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
