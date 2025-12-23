import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOTP = async ({ name, email, otp }) => {
  if (!email) throw new Error("Email is required for sending OTP");

  console.log("📧 Sending OTP email to:", email);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Doubt Buddy" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `
      <div style="color:black;">
        <p>Dear ${name || "User"},</p>
        <p>You're requested a password reset. Please use the following OTP:</p>
        <div style="background:#03a9fc; font-size:20px; padding:20px; text-align:center; font-weight:800; color:white;">
          ${otp}
        </div>
        <br/>
        <p>This OTP is valid for 1 hour only.</p>
        <p>Thanks,<br>Doubt Buddy</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Gmail OTP sent!");
    return true;
  } catch (err) {
    console.error("❌ Gmail SMTP Error:", err);
    return false;
  }   
};
