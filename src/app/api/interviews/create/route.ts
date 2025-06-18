import { NextResponse } from 'next/server';
import { InterviewDB } from '@/services/interview-db';
import { getInterviewEmailTemplate } from '@/services/emailTemplates';

export async function POST(request: Request) {
  try {
    const { candidateId, recruiterId, candidateEmail, candidateName, companyName, recruiterName } = await request.json();

    if (!candidateId || !recruiterId || !candidateEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create interview session
    const interviewId = await InterviewDB.createInterview({
      candidateId,
      recruiterId,
      status: 'pending',
      createdAt: new Date(),
    });

    // Generate interview URL
    const interviewLink = `${process.env.NEXT_PUBLIC_APP_URL}/interview/${interviewId}`;

    // Prepare email data
    const emailData = {
      candidateName: candidateName || 'Candidate',
      interviewLink,
      companyName: companyName || 'Our Company',
      recruiterName: recruiterName || 'Recruiter',
    };

    // Get email template
    const emailHtml = getInterviewEmailTemplate(emailData);

    // Send email
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: candidateEmail,
        subject: `AI Interview Invitation - ${companyName || 'Our Company'}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send interview email');
    }

    return NextResponse.json({
      success: true,
      interviewId,
      message: 'Interview created and invitation sent successfully',
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
} 