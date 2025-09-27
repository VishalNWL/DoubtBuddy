import 'dotenv/config'; // ✅ loads automatically
import SibApiV3Sdk from 'sib-api-v3-sdk';
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];

apiKey.apiKey =process.env.BREVO_API_KEY;

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
 
var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export const sendOTP = async ({ name, email, otp }) => {
  if (!email) throw new Error("Email is required for sending OTP");

  console.log("📧 Sending OTP email to:", email, "Name:", name);

  const sendSmtpEmail = {
    sender: { email: "vishalqbsj@gmail.com", name: "Doubt Buddy" },
    to: [{ email, name }],
    subject: "Password Reset OTP",
    htmlContent: `
      <div style="color:black;">
        <p style="color:black;">Dear ${name || "User"},</p>
        <p style="color:black;">You're requested a password reset. Please use the following OTP:</p>
        <div style="background:#03a9fc; font-size:20px; padding:20px; text-align:center; font-weight:800;">
          ${otp}
        </div>
        <br/>
        <p style="color:black;">This OTP is valid for 1 hour only.</p>
        <p>Thanks,<br/>Doubt Buddy</p>
      </div>
    `,
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    return true;
  } catch (error) {
    console.error("❌ Sendinblue Error:", error);
    return false;
  }
};