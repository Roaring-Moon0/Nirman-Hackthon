import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter only if credentials exist, else use mock
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

const transporter = createTransporter();

export const sendEmail = async (to, subject, html) => {
  try {
    if (transporter) {
      await transporter.sendMail({
        from:
          process.env.SMTP_FROM || '"Academic ERP" <no-reply@academicerp.com>',
        to,
        subject,
        html,
      });
      console.log(`📧 Email sent to ${to}`);
    } else {
      // Mock for development (Free requirement)
      console.log("==================================================");
      console.log(`📧 MOCK EMAIL TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`CONTENT: ${html}`);
      console.log("==================================================");
    }
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};
