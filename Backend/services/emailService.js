import axios from "axios";

export const sendOtpEmail = async (toEmail, otp) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: {
        name: "E-Notes",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: toEmail }],
      subject: "Your E-Notes Verification Code",
      htmlContent: `
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
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};
