import { NextResponse } from "next/server";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

// MongoDB Connection URI
const MONGODB_URI =
  "mongodb+srv://user1:pwduser1@cluster0.1hqbs.mongodb.net/adi_portfolio?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(MONGODB_URI);
};

// Define Schema
const ContactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    subject: String,
    message: String,
  },
  { timestamps: true }
);

// Define Model
const ContactForm =
  mongoose.models.ContactForm || mongoose.model("ContactForm", ContactSchema);

// SMTP configuration for your domain
const smtpUser = 'nalawadeaditya017@gmail.com';
const smtpPass = 'wrdl xnpg ngid oube';
const recipient = 'nalawadeaditya017@gmail.com';
const smtpHost = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 587;
const smtpSecure = (process.env.SMTP_SECURE ?? 'false') === 'true';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

// Handle POST request to store form data and send email
export async function POST(req: Request) {
  try {
    await connectDB();
    const formData = await req.json();
    const { name, email, subject, message, phone } = formData;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save form data to MongoDB
    await ContactForm.create({ name, email, subject, message });

    // Send email directly using Nodemailer
    try {
      const mailOptions = {
        from: `"Contact Form" <${smtpUser}>`,
        to: recipient,
        replyTo: email,
        subject: `New Inquiry from ${name}`,
        text: `Customer: ${name}\nEmail: ${email}\nPhone: ${phone ?? 'N/A'}\nTopic: ${subject}\n\n${message}`,
        html: `<h2>New Inquiry</h2><b>${name}</b><br>${email}<br>${phone ?? 'N/A'}<br>${subject}<p>${message.replace(/\n/g, '<br>')}</p>`
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending email:', emailError);
      // Continue execution even if email fails - data is saved in DB
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully!",
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}