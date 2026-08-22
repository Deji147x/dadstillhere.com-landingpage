// User & Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  isModerator: boolean;
  consentAnalytics: boolean;
  consentMarketing: boolean;
}

export interface PublicProfile {
  id: string;
  userId: string;
  displayName: string;
  isAnonymous: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
}

// Letter Types
export type LetterVisibility = 'PRIVATE' | 'PUBLIC' | 'SHARED';
export type LetterTemplate =
  | 'DEAR_SON'
  | 'DEAR_DAUGHTER'
  | 'DEAR_CHILD'
  | 'I_MISS_YOU'
  | 'HAPPY_BIRTHDAY'
  | 'WHAT_I_NEVER_SAID'
  | 'IM_SORRY'
  | 'IM_PROUD'
  | 'IF_YOU_EVER_FIND'
  | 'IF_WE_TALK_AGAIN';

export interface Letter {
  id: string;
  userId: string;
  title: string;
  content: string;
  visibility: LetterVisibility;
  template?: LetterTemplate;
  recipientEmail?: string; // For SHARED letters
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';
  authorAnonymity: string; // e.g., "A Dad, Somewhere"
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  expiresAt?: Date; // For shared letters
}

export interface LetterModeration {
  id: string;
  letterId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDIT_REQUESTED';
  issues: ModerationIssue[];
  moderatorId: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModerationIssue {
  type: 'NAME' | 'EMAIL' | 'PHONE' | 'ADDRESS' | 'SCHOOL' | 'COURT_CASE' | 'MINOR_DETAILS' | 'THREAT' | 'HARASSMENT';
  text: string;
  lineNumber?: number;
  suggestion?: string;
}

// Journal Types
export interface JournalEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  tags: string[];
  relationshipCategory?: string;
  mood?: string;
  createdAt: Date;
  updatedAt: Date;
  isEncrypted: boolean;
}

// Story Types
export interface Story {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  heroImage?: string;
  videoUrl?: string;
  category: 'FATHERHOOD' | 'MOTHERHOOD' | 'ESTRANGEMENT' | 'RECONNECTION' | 'DIVORCE' | 'SILENCE' | 'HOPE' | 'RECOVERY';
  author?: string;
  isAnonymous: boolean;
  readTime: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  publishedAt?: Date;
  updatedAt: Date;
  relatedLetterIds?: string[];
  relatedVideoIds?: string[];
}

// Video Types
export interface Video {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  category: 'THE_SILENCE' | 'DEAR_CHILD' | 'LONG_GAME' | 'CHILDS_SIDE' | 'PARENT_SURVIVED' | 'OPEN_DOOR';
  transcript?: string;
  chapters?: VideoChapter[];
  thumbnail?: string;
  duration: number;
  publishedAt: Date;
  relatedStoryIds?: string[];
  relatedLetterIds?: string[];
}

export interface VideoChapter {
  timestamp: number;
  title: string;
  description?: string;
}

// Article Types
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  keywordFocus?: string;
  searchIntent?: string;
  pillarPageId?: string; // Link to parent pillar page
  relatedArticleIds?: string[];
  relatedVideoIds?: string[];
  relatedLetterIds?: string[];
  author?: string;
  readTime: number;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  publishedAt?: Date;
  updatedAt: Date;
  viewCount: number;
}

export interface PillarPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  supportingArticleIds: string[];
  relatedVideoIds?: string[];
  relatedLetterIds?: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: Date;
  publishedAt?: Date;
}

// Community Types
export type CommunityPromptFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface CommunityPrompt {
  id: string;
  question: string;
  description?: string;
  frequency: CommunityPromptFrequency;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'ARCHIVED';
  responseCount: number;
}

export interface CommunityResponse {
  id: string;
  promptId: string;
  userId: string;
  publicProfileId: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED';
  confirmToken?: string;
  unsubscribeToken?: string;
  userId?: string;
  consentGiven: boolean;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface NewsletterIssue {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT';
  sendAt?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// Recipient Share Types
export interface RecipientShare {
  id: string;
  letterId: string;
  recipientEmail: string;
  shareToken: string;
  createdAt: Date;
  expiresAt: Date;
  viewedAt?: Date;
  accessCount: number;
}

// Moderation & Reports
export interface Report {
  id: string;
  contentType: 'LETTER' | 'COMMENT' | 'COMMUNITY_RESPONSE' | 'STORY';
  contentId: string;
  userId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  action?: 'APPROVED' | 'REMOVED' | 'WARNING';
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  contentId?: string;
  contentType?: string;
  properties: Record<string, unknown>;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  createdAt: Date;
}

// Privacy & Consent
export interface ConsentRecord {
  id: string;
  userId: string;
  type: 'ANALYTICS' | 'MARKETING' | 'DATA_PROCESSING';
  given: boolean;
  timestamp: Date;
  ipAddress?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  timestamp: Date;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
