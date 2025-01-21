import nodemailer, { TransportOptions } from "nodemailer";
import { env } from "~/env";

const transporter = nodemailer.createTransport({
  host: env.MAIL_SERVER_HOST,
  port: env.MAIL_SERVER_PORT,
  auth: {
    user: env.MAIL_SERVER_USER,
    pass: env.MAIL_SERVER_PASS,
  },
  secure: false, // Use STARTTLS
  tls: {
    ciphers: "SSLv3",
  },
} as TransportOptions);

export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: env.MAIL_FROM,
    to,
    subject: "Verify your email address",
    text: `Please verify your email address by clicking the following link: ${verificationUrl}`,
    html: `<p>Please verify your email address by clicking the following link: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
}
