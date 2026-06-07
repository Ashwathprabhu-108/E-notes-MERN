import nodemailer from "nodemailer";

// ─────────────────────────────────────────────────────────────────
// Smart transporter: uses real Gmail if configured, otherwise falls
// back to Ethereal (a free Nodemailer test inbox that requires zero
// setup). Preview links are logged to the backend console.
// ─────────────────────────────────────────────────────────────────
const getRealGmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== "your_gmail@gmail.com" &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_PASS !== "your_gmail_app_password";

export const sendOtpEmail = async (toEmail, otp) => {
  let transporter;
  let isTest = false;

  if (getRealGmailConfigured()) {
    // ── Real Gmail ────────────────────────────────────────────────
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // ── Ethereal test account (auto-created, no setup needed) ─────
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isTest = true;
    console.log("\n📧 [DEV MODE] Using Ethereal test email account.");
    console.log("   To configure real Gmail, set EMAIL_USER and EMAIL_PASS in .env\n");
  }

  const mailOptions = {
    from: `"E-Notes" <${getRealGmailConfigured() ? process.env.EMAIL_USER : "noreply@enotes.dev"}>`,
    to: toEmail,
    subject: "Your E-Notes Verification Code",
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:480px;margin:0 auto;background:#12103a;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;font-size:26px;margin:0;letter-spacing:1px;">E-Notes</h1>
          <p style="color:#c4b5fd;margin:6px 0 0;font-size:14px;">Password Reset Code</p>
        </div>
        <div style="padding:36px 40px;background:#1a1750;">
          <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0 0 24px;">
            We received a request to reset your password. Use the code below — it expires in
            <strong style="color:#a78bfa">10 minutes</strong>.
          </p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;background:#0f0c2e;border:2px solid #7c3aed;border-radius:14px;padding:20px 44px;">
              <span style="color:#a78bfa;font-size:42px;font-weight:800;letter-spacing:14px;font-family:monospace;">${otp}</span>
            </div>
          </div>
          <p style="color:#6d5fa8;font-size:12px;margin:24px 0 0;line-height:1.6;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="background:#12103a;padding:16px 40px;text-align:center;">
          <p style="color:#4a4080;font-size:11px;margin:0;">© 2025 E-Notes. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  if (isTest) {
    // ── Print the Ethereal preview URL to the backend console ─────
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("┌─────────────────────────────────────────────────────┐");
    console.log("│  📬 OTP EMAIL PREVIEW (click to view in browser)    │");
    console.log("├─────────────────────────────────────────────────────┤");
    console.log(`│  ${previewUrl}`);
    console.log("└─────────────────────────────────────────────────────┘\n");
  }
};
