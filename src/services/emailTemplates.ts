interface InterviewEmailData {
  candidateName: string;
  interviewLink: string;
  companyName: string;
  recruiterName: string;
}

export const getInterviewEmailTemplate = (data: InterviewEmailData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { 
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { 
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AI Interview Invitation</h1>
        </div>
        <div class="content">
          <p>Dear ${data.candidateName},</p>
          
          <p>You have been invited to participate in an AI-powered interview for ${data.companyName}.</p>
          
          <p>This interview will be conducted through our AI platform, which will ask you questions and record your responses. The interview is designed to be interactive and efficient.</p>
          
          <p><strong>Important Notes:</strong></p>
          <ul>
            <li>Please ensure you have a quiet environment for the interview</li>
            <li>You'll need a working microphone for the interview</li>
            <li>The interview can be completed at your convenience</li>
            <li>You can take breaks between questions if needed</li>
          </ul>
          
          <p>To start your interview, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${data.interviewLink}" class="button">Start Interview</a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact ${data.recruiterName}.</p>
          
          <p>Best regards,<br>${data.recruiterName}<br>${data.companyName}</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}; 