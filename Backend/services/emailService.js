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
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap');
            body { margin: 0; padding: 0; background: #0b0928; }
            .wrapper { width: 100%; padding: 24px 12px; box-sizing: border-box; }
            .card { font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #12103a; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg,#7c3aed,#4f46e5); padding: 32px 40px; text-align: center; }
            .header h1 { color: #fff; font-size: 26px; margin: 0; letter-spacing: 1px; }
            .header p { color: #c4b5fd; margin: 6px 0 0; font-size: 14px; }
            .body { padding: 36px 40px; background: #1a1750; }
            .body p { color: #e2e8f0; font-size: 15px; line-height: 1.7; margin: 0 0 24px; }
            .otp-box { text-align: center; margin: 28px 0; }
            .otp-inner { display: inline-block; background: #0f0c2e; border: 2px solid #7c3aed; border-radius: 14px; padding: 20px 44px; }
            .otp-code { color: #a78bfa; font-size: 42px; font-weight: 800; letter-spacing: 14px; font-family: monospace; }
            .footer { background: #12103a; padding: 16px 40px; text-align: center; }
            .footer p { color: #4a4080; font-size: 11px; margin: 0; }
            @media (max-width: 480px) {
              .header { padding: 24px 20px; }
              .header h1 { font-size: 22px; }
              .body { padding: 24px 20px; }
              .body p { font-size: 14px; }
              .otp-inner { padding: 16px 24px; }
              .otp-code { font-size: 32px; letter-spacing: 10px; }
              .footer { padding: 14px 20px; }
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="card">
              <div class="header">
                <h1>E-Notes</h1>
                <p>Password Reset Code</p>
              </div>
              <div class="body">
                <p>
                  We received a request to reset your password. Use the code below — it expires in
                  <strong style="color:#a78bfa">10 minutes</strong>.
                </p>
                <div class="otp-box">
                  <div class="otp-inner">
                    <span class="otp-code">${otp}</span>
                  </div>
                </div>
              </div>
              <div class="footer">
                <p>© 2025 E-Notes. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
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
