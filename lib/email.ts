import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "NexHR <onboarding@resend.dev>";

export async function sendCompanyWelcomeEmail({
  to,
  companyName,
  domain,
  password,
}: {
  to: string;
  companyName: string;
  domain: string;
  password: string;
}) {
  const loginUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3001";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to NexHR</title>
</head>
<body style="margin:0;padding:0;background:#F7F9F8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9F8;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #E5EAE7;">

          <!-- Header -->
          <tr>
            <td style="background:#064E3B;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">NexHR</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.65);font-size:13px;">HR Management System</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px;color:#17211C;font-size:20px;font-weight:700;">Welcome to NexHR! 🎉</h2>
              <p style="margin:0 0 24px;color:#4A5E55;font-size:14px;line-height:1.6;">
                Your company <strong>${companyName}</strong> has been successfully onboarded on NexHR. Here are your login credentials to get started.
              </p>

              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9F8;border:1px solid #E5EAE7;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 12px;color:#8AA398;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">Your Login Credentials</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;color:#8AA398;font-size:13px;width:120px;">Company</td>
                        <td style="padding:6px 0;color:#17211C;font-size:13px;font-weight:600;">${companyName}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#8AA398;font-size:13px;">Domain</td>
                        <td style="padding:6px 0;color:#17211C;font-size:13px;font-weight:600;">${domain}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#8AA398;font-size:13px;">Email</td>
                        <td style="padding:6px 0;color:#17211C;font-size:13px;font-weight:600;">${to}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;color:#8AA398;font-size:13px;">Password</td>
                        <td style="padding:6px 0;color:#17211C;font-size:13px;font-weight:600;font-family:monospace;">${password}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}/login" style="display:inline-block;background:#16A34A;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:12px;">
                      Login to NexHR →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#92400E;font-size:12px;line-height:1.5;">
                      ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes. Do not share these credentials with anyone.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#8AA398;font-size:12px;line-height:1.6;">
                If you have any questions, contact your system administrator. This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F7F9F8;padding:20px 40px;border-top:1px solid #E5EAE7;text-align:center;">
              <p style="margin:0;color:#8AA398;font-size:11px;">© ${new Date().getFullYear()} NexHR · HR Management System for Pakistan</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to NexHR — ${companyName} is ready!`,
      html,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}
