import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Newsletter } from '@/models/Newsletter';
import { NewsletterCampaign } from '@/models/NewsletterCampaign';
import { sendNewsletterEmail } from '@/lib/email';
import { authenticateUser } from '@/lib/auth-helpers';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {

    await connectToDatabase();
        
    const user = await authenticateUser(request);
    if (!user || user.role !== "admin") return NextResponse.json<ApiResponse>({ success: false, error: "Unauthorized" }, { status: 403 });

    const body = await request.json();
    const { subject, previewText, htmlContent } = body;

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Subject and content required' },
        { status: 400 }
      );
    }

    // Get all subscribers
    const subscribers = await Newsletter.find({
      isSubscribed: true,
      isDeleted: { $ne: true },
    }).lean();

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No subscribers found' },
        { status: 400 }
      );
    }

    // Create campaign record
    const campaign = new NewsletterCampaign({
      subject,
      previewText,
      htmlContent,
      recipientCount: subscribers.length,
      status: 'sending',
      sentBy: user._id,
    });

    await campaign.save();

    // Send emails in background
    const emailPromises = subscribers.map((subscriber) =>
      sendNewsletterEmail({
        email: subscriber.email,
        name: subscriber.name || 'Subscriber',
        subject,
        htmlContent,
      }).catch((err) => {
        console.error(`Failed to send email to ${subscriber.email}:`, err);
      })
    );

    Promise.allSettled(emailPromises).then(async () => {
      await NewsletterCampaign.findByIdAndUpdate(campaign._id, {
        status: 'sent',
        sentAt: new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('[NEWSLETTER_SEND]', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
