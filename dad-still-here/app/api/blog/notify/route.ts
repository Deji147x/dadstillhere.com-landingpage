import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { env } from '@/lib/server/env';

sgMail.setApiKey(env.SENDGRID_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { creatorEmail, postTitle, postId } = await req.json();

    if (!creatorEmail || !postTitle || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const msg = {
      to: creatorEmail,
      from: env.SENDGRID_FROM_EMAIL,
      subject: `Your story is live: "${postTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your story inspired us! 🎉</h2>
          <p>We've published your letter as a blog post on Dad, Still Here.</p>

          <p style="margin: 20px 0;">
            <a href="https://dadstillhere.com/blog/${postId}"
               style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Read Your Post
            </a>
          </p>

          <p>See how many dads are connecting with your words.</p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Questions? Reply to this email.
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      { success: true, message: 'Email sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('SendGrid error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
