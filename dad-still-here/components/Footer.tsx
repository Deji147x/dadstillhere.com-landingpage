'use client';

import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-gradient-warm dark:gradient-warm-dark">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-gold-500 to-teal-500 flex items-center justify-center">
                <img src="/favicon.svg" alt="Dad, Still Here" className="h-full w-full" />
              </div>
              <span className="font-display text-lg font-bold">Dad, Still Here</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Still loving them. Still here.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/watch" className="text-sm text-muted-foreground hover:text-foreground">
                  Watch Stories
                </Link>
              </li>
              <li>
                <Link href="/letters" className="text-sm text-muted-foreground hover:text-foreground">
                  Read Letters
                </Link>
              </li>
              <li>
                <Link href="/write" className="text-sm text-muted-foreground hover:text-foreground">
                  Write
                </Link>
              </li>
              <li>
                <Link href="/journal" className="text-sm text-muted-foreground hover:text-foreground">
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                  Cookies
                </Link>
              </li>
              <li>
                <Link href="/guidelines" className="text-sm text-muted-foreground hover:text-foreground">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold">Follow</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="https://www.youtube.com/channel/UCNZ-b1JmtT8dTcjY9MiO8xQ" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  YouTube
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/profile.php?id=61593247216715" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/dadstillhere/" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://x.com/dadstillhere" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Twitter/X
                </a>
              </li>
              <li>
                <a href="https://share.google/zplmWJDMgqjb3wE2r" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                  Google Business
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Dad, Still Here. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Made with</span>
              <span className="text-gold-500">❤</span>
              <span className="text-sm text-muted-foreground">for the words still waiting to be said.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
