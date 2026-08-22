'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Watch', href: '/watch' },
    { label: 'Stories', href: '/stories' },
    { label: 'Letters', href: '/letters' },
    { label: 'Write', href: '/write' },
    { label: 'Journal', href: '/journal' },
    { label: 'Resources', href: '/resources' },
    { label: 'Community', href: '/community' },
    { label: 'About', href: '/about' },
  ];

  const dropdownItems = {
    'Home': [
      { label: '📖 Featured Story', href: '#featured-story' },
      { label: '💌 Featured Letter', href: '#featured-letter' },
      { label: '📚 Explore Topics', href: '#explore-topics' },
      { label: '✉️ Letter Archive', href: '#letter-archive' },
      { label: '📰 Newsletter', href: '#newsletter' },
      { label: '💬 Community Prompt', href: '#community-prompt' },
    ],
    'Blog': [
      { label: '📝 Latest Articles', href: '/blog' },
      { label: '🔍 Browse by Topic', href: '/blog/topics' },
      { label: '🏆 Most Popular', href: '/blog/popular' },
      { label: '📅 Archive', href: '/blog/archive' },
    ],
    'Resources': [
      { label: '❓ FAQ', href: '/faq' },
      { label: '🆘 Help Center', href: '/resources' },
      { label: '💬 Community', href: '/community' },
      { label: '📧 Contact', href: '/contact' },
      { label: '📋 Guidelines', href: '/guidelines' },
    ],
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <nav className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-gold-500 to-teal-500 flex items-center justify-center transition-transform group-hover:scale-110">
            <img src="/favicon.svg" alt="Dad, Still Here" className="h-full w-full" />
          </div>
          <span className="hidden font-display text-xl font-bold md:inline text-foreground">
            Dad, Still Here
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {/* Home Dropdown */}
          <div className="relative" onMouseLeave={() => setOpenDropdown(null)}>
            <button
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
              onMouseEnter={() => setOpenDropdown('Home')}
            >
              Home <span className="text-xs">▼</span>
            </button>
            {openDropdown === 'Home' && (
              <div
                className="absolute left-0 mt-0 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50"
                onMouseEnter={() => setOpenDropdown('Home')}
              >
                {dropdownItems['Home'].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {navItems.filter(item => !['Home', 'Blog', 'Resources'].includes(item.label)).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}

          {/* Blog & Resources Dropdowns */}
          {['Blog', 'Resources'].map((label) => (
            <div key={label} className="relative" onMouseLeave={() => setOpenDropdown(null)}>
              <button
                className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1"
                onMouseEnter={() => setOpenDropdown(label)}
              >
                {label} <span className="text-xs">▼</span>
              </button>
              {openDropdown === label && (
                <div
                  className="absolute left-0 mt-0 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50"
                  onMouseEnter={() => setOpenDropdown(label)}
                >
                  {dropdownItems[label as keyof typeof dropdownItems].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Social Icons */}
        <div className="hidden items-center gap-3 md:flex">
          <a href="https://www.instagram.com/dadstillhere/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" title="Instagram">
            📷
          </a>
          <a href="https://www.facebook.com/profile.php?id=61593247216715" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" title="Facebook">
            f
          </a>
          <a href="https://x.com/dadstillhere" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" title="Twitter">
            𝕏
          </a>
          <a href="https://www.youtube.com/channel/UCNZ-b1JmtT8dTcjY9MiO8xQ" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" title="YouTube">
            ▶
          </a>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/subscribe"
            className="hidden px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary md:inline"
          >
            Subscribe
          </Link>
          <Link
            href="/auth/signin"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex lg:hidden text-2xl"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-card lg:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {/* Home Dropdown Mobile */}
            <div>
              <button
                className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center justify-between"
                onClick={() => setOpenDropdown(openDropdown === 'Home' ? null : 'Home')}
              >
                Home <span className={`text-xs transition-transform ${openDropdown === 'Home' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openDropdown === 'Home' && (
                <div className="pl-4 space-y-1">
                  {dropdownItems['Home'].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {navItems.filter(item => !['Home', 'Blog', 'Resources'].includes(item.label)).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* Blog Dropdown Mobile */}
            <div>
              <button
                className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center justify-between"
                onClick={() => setOpenDropdown(openDropdown === 'Blog' ? null : 'Blog')}
              >
                Blog <span className={`text-xs transition-transform ${openDropdown === 'Blog' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openDropdown === 'Blog' && (
                <div className="pl-4 space-y-1">
                  {dropdownItems['Blog'].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Dropdown Mobile */}
            <div>
              <button
                className="w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center justify-between"
                onClick={() => setOpenDropdown(openDropdown === 'Resources' ? null : 'Resources')}
              >
                Resources <span className={`text-xs transition-transform ${openDropdown === 'Resources' ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openDropdown === 'Resources' && (
                <div className="pl-4 space-y-1">
                  {dropdownItems['Resources'].map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/subscribe"
              className="block px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Subscribe
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
