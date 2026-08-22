# Dad, Still Here — Premium Media & Community Platform

A production-ready, full-stack web application for creating a safe, dignified space for parents experiencing child estrangement, parental alienation, and family separation.

**Domain:** https://dadstillhere.com  
**Tagline:** "Still loving them. Still here."

---

## 🎯 Overview

Dad, Still Here is a comprehensive platform combining:
- **Premium editorial media** (stories, videos, articles)
- **Private journaling** (encrypted, never tracked)
- **Letter writing** (private, anonymous public, shareable)
- **Community engagement** (moderated prompts and responses)
- **SEO-first content architecture** (pillar pages, topic hubs)
- **Privacy-by-design** (consent controls, data export, deletion)
- **Moderation dashboard** (human review, auto-detection)

---

## 🏗️ Architecture

### Tech Stack
- **Frontend:** Next.js 14+ (TypeScript, React 18)
- **Backend:** Node.js + Next.js API Routes
- **Database:** PostgreSQL (via Prisma ORM)
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** NextAuth.js v4+
- **Animation:** Framer Motion
- **Form Handling:** React Hook Form + Zod validation
- **Media Storage:** AWS S3 (or S3-compatible)
- **Email:** SMTP (Gmail, SendGrid, etc.)
- **Analytics:** Privacy-first (no PII tracking)

### Core Directories
```
dad-still-here/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   ├── write/               # Letter writing interface
│   ├── journal/             # Private journal
│   ├── letters/             # Read letters
│   ├── stories/             # Stories & videos
│   ├── community/           # Community prompts
│   ├── resources/           # Help center, FAQs
│   ├── admin/               # Moderation dashboard
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage (9 sections)
├── components/              # Reusable React components
│   ├── Header.tsx          # Navigation
│   ├── Footer.tsx          # Footer
│   └── ...                 # Feature components
├── lib/                     # Utilities & helpers
│   ├── utils.ts            # Common functions
│   ├── moderation.ts       # Content moderation
│   └── auth.ts             # Authentication helpers
├── types/                   # TypeScript type definitions
├── styles/                  # Global CSS
├── public/                  # Static assets
├── prisma/
│   └── schema.prisma       # Database schema
├── .env.example            # Environment variables template
├── tsconfig.json           # TypeScript config
├── next.config.js          # Next.js config
└── tailwind.config.ts      # Tailwind CSS config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 12+ (local or hosted)
- AWS S3 bucket (for media storage, optional)
- Email service (Gmail SMTP, SendGrid, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dad-still-here
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   - Database URL
   - NextAuth secrets
   - Email service credentials
   - AWS S3 credentials (optional)

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates the PostgreSQL schema and runs Prisma migrations.

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Run development server**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

7. **Access Prisma Studio** (optional, for database inspection)
   ```bash
   npx prisma studio
   ```

---

## 📋 Core Features

### For Visitors
- **Homepage:** 9-section immersive experience
  1. Hero section with CTAs
  2. Three pathways (Watch, Write, Remember)
  3. Featured story
  4. Featured letter
  5. Topic exploration grid
  6. Letter archive
  7. Newsletter signup
  8. Community prompt
  9. Final CTA
- **Stories:** Cinematic story archive with filters
- **Videos:** Video library with transcripts & chapters
- **Letters:** Browse anonymous community letters
- **Resources:** SEO-optimized articles & FAQs
- **Community:** Moderated prompts & responses

### For Writers
- **Letter Writing:** Guided template-based interface
  - Private mode (encrypted, never tracked)
  - Anonymous public (moderated before publishing)
  - Shareable (send via private link)
  - Auto-detection of sensitive information
- **Private Journal:** Distraction-free writing
  - Auto-save
  - Tags, dates, mood tracking
  - Never exported to analytics
  - Encryption at rest
- **Publishing:** Moderation workflow
  - Automatic privacy/safety screen
  - Human review queue
  - Feedback & revision suggestions

### For Moderators
- **Dashboard:** 
  - Content queue (letters, stories, comments)
  - Automated flagging (names, addresses, threats)
  - Manual review interface
  - Rejection reasons & feedback
  - Analytics on moderation time/decisions

### For Admins
- **Dashboard:**
  - User management
  - Content management (publish, archive, feature)
  - Newsletter management
  - Analytics overview
  - Audit logs
  - System configuration

### Privacy & Compliance
- **Privacy Center:** User controls for:
  - Data export (JSON/CSV)
  - Delete account & content
  - Manage analytics consent
  - Review access logs
  - Manage newsletter subscriptions
- **Consent Records:** Track all user permissions
- **Audit Logging:** All actions logged for accountability
- **No PII Tracking:** Journal, private letters never tracked
- **GDPR Ready:** Data deletion, export, right to be forgotten

---

## 🔐 Security Checklist

- [ ] Enable HTTPS everywhere (production)
- [ ] Set secure cookies (HttpOnly, SameSite)
- [ ] Implement CSRF protection
- [ ] Rate limiting on API endpoints
- [ ] Input validation & output encoding
- [ ] SQL injection prevention (Prisma handles)
- [ ] XSS protection (React handles)
- [ ] Password hashing (bcryptjs)
- [ ] Secure share tokens (expiring, revocable)
- [ ] Backup strategy for database
- [ ] Error monitoring (Sentry or similar)
- [ ] Content Security Policy headers

---

## 📊 SEO Architecture

### Pillar Pages (High-Authority Hub Pages)
- Child Estrangement
- Father-Child Estrangement
- Mother-Child Estrangement
- Divorce & Family Separation
- Writing to an Estranged Child
- Reconnection & Communication
- Missing Your Child
- Parent Recovery

### Supporting Articles (1-2 rank for pillar + long-tail keywords)
- Examples: "Why Won't My Son Talk to Me?", "How to Write to an Estranged Child"
- All linked from pillar page + each other
- Optimized for natural language questions

### Content Types
- Pillar pages → Supporting articles → Videos → Letters
- Internal linking strategy explicit in database
- Structured data (Article, VideoObject, BreadcrumbList)
- XML sitemap auto-generated
- No thin tag pages (noindex if needed)

---

## 🎨 Design System

### Colors (Warm Human Futurism)
```
Base:
  Cream:    #F5F1ED
  Ivory:    #FFF8F5
  Navy:     #1A2847
  Charcoal: #2D2D2D

Accents:
  Teal:  #4A9B8E
  Sage:  #7B9B7F
  Gold:  #D4A574
  Sand:  #E8D5C4
```

### Typography
- **Display:** Playfair Display (serif, emotional, headlines)
- **Interface:** Inter (humanist sans-serif, navigation, forms)

### Animations (Respect prefers-reduced-motion)
- Soft fade-in
- Gentle slide-up
- Low-intensity parallax
- Card elevation on hover
- Subtle page transitions

---

## 📱 Responsive Design

- **Mobile-first approach:** Exceptional write experience on phones
- **Breakpoints:** xs (mobile), sm, md, lg, xl, 2xl
- **Touch-friendly:** Large targets, sticky actions, minimal friction
- **Performance:** Fast FCP/LCP, minimal CLS

---

## 🔄 Moderation Workflow

```
User submits letter
    ↓
Automated privacy screen
  (emails, phones, addresses, schools, court cases, threats)
    ↓
Human moderation queue
    ↓
APPROVED → Published immediately
REJECTED → User notified with reason
EDIT_REQUESTED → User can revise & resubmit
```

---

## 📊 Analytics (Privacy-First)

### Tracked Events
- page_view
- video_click, newsletter_start, letter_submitted
- subscribe_click, social_click
- search_performed, report_submitted

### NOT Tracked
- Private journal content
- Private letter content
- Sensitive personal details
- Children's identifying info

### User Controls
- Cookie preferences
- Analytics opt-out
- Data export
- Delete account

---

## 🚢 Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backups enabled
- [ ] SSL/HTTPS enforced
- [ ] Security headers configured
- [ ] Error monitoring active
- [ ] Analytics initialized (privacy-conscious)
- [ ] Email service tested
- [ ] Admin account created
- [ ] Load testing completed

### Recommended Platforms
- **Frontend:** Vercel (Next.js optimized)
- **Database:** Railway, Neon, AWS RDS
- **Storage:** AWS S3 or Backblaze B2
- **Email:** SendGrid, Mailgun, or Gmail SMTP
- **Monitoring:** Sentry, LogRocket

### Deploy Command (Vercel)
```bash
vercel deploy
```

---

## 🧪 Testing

### Run Type Checking
```bash
npm run type-check
```

### Run Linting
```bash
npm run lint
```

### Run Tests (to be implemented)
```bash
npm test
```

---

## 🛠️ Development Workflow

1. **Create a feature branch:** `git checkout -b feature/feature-name`
2. **Make changes** to components, pages, or APIs
3. **Test locally:** `npm run dev`
4. **Check types:** `npm run type-check`
5. **Commit:** `git commit -m "Add feature description"`
6. **Push & create PR:** `git push origin feature/feature-name`

---

## 📚 Database Migrations

### View migration history
```bash
npx prisma migrate status
```

### Create a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset database (development only)
```bash
npx prisma migrate reset
```

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Follow the TypeScript/React conventions
2. Add tests for new features
3. Update documentation
4. Ensure accessibility (WCAG 2.2 AA)
5. Respect user privacy

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support & Contact

For issues, feature requests, or security concerns:
- **Email:** support@dadstillhere.com
- **GitHub Issues:** [Create an issue](#)
- **Privacy Concerns:** privacy@dadstillhere.com

---

## 🎯 Quality Standards

Before launching, ensure:
- [ ] Feels warm, not cold
- [ ] Design is futuristic without sci-fi aesthetics
- [ ] Mobile experience is exceptional
- [ ] Private journals truly private (no leaks)
- [ ] Public letters properly moderated
- [ ] SEO built-in from start
- [ ] WCAG 2.2 AA accessibility passed
- [ ] Performance metrics met (FCP <2.5s, LCP <4s, CLS <0.1)
- [ ] Conversion path is natural (DISCOVER → WATCH → READ → WRITE → RETURN → JOIN)

---

**Built with ❤️ for the words that still need a place to go.**
