import { NextRequest, NextResponse } from 'next/server';
import { moderateLetter, calculateQualityScore } from '@/lib/moderation';

// POST /api/letters - Create a new letter
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, visibility, template, authorAnonymity, recipientEmail } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Letter must be at least 20 characters' },
        { status: 400 }
      );
    }

    // Moderate content if public
    let moderation = null;
    if (visibility === 'PUBLIC' || visibility === 'SHARED') {
      moderation = moderateLetter(content, visibility === 'PUBLIC');

      if (moderation.status === 'REJECTED') {
        return NextResponse.json(
          {
            error: 'Content was rejected during moderation',
            details: moderation.issues,
            message: moderation.recommendedAction,
          },
          { status: 422 }
        );
      }
    }

    // Calculate metrics
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    const qualityScore = calculateQualityScore(content);

    // In a real app, you would save to database here
    // For now, return success response
    const letter = {
      id: Math.random().toString(36).slice(2, 11),
      title: title || 'Untitled Letter',
      content,
      visibility,
      template,
      authorAnonymity: authorAnonymity || 'A Parent, Somewhere',
      recipientEmail: visibility === 'SHARED' ? recipientEmail : null,
      status: visibility === 'PRIVATE' ? 'DRAFT' : 'SUBMITTED',
      wordCount,
      readTime,
      qualityScore,
      moderation: moderation ? {
        status: moderation.status,
        issues: moderation.issues,
        requiresHumanReview: moderation.requiresHumanReview,
      } : null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        letter,
        message:
          visibility === 'PRIVATE'
            ? 'Letter saved to your drafts'
            : visibility === 'SHARED'
              ? 'Letter ready to share. A link has been generated.'
              : 'Letter submitted for moderation. You\'ll be notified when it\'s published.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Letter submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process letter' },
      { status: 500 }
    );
  }
}

// GET /api/letters - Get user's letters (requires auth)
export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Check authentication
    // 2. Get user ID from session
    // 3. Query database for user's letters
    // 4. Return paginated results

    return NextResponse.json(
      {
        success: true,
        letters: [],
        total: 0,
        message: 'Letters endpoint ready for database connection',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Letters fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch letters' },
      { status: 500 }
    );
  }
}
