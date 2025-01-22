"use server";

import nodemailer, { TransportOptions } from "nodemailer";
import { env } from "~/env";
import { Locale } from "~/types/locale";

const transporter = nodemailer.createTransport({
  host: env.MAIL_SERVER_HOST,
  port: env.MAIL_SERVER_PORT,
  auth: {
    user: env.MAIL_SERVER_USER,
    pass: env.MAIL_SERVER_PASS,
  },
  secure: env.MAIL_SERVER_PORT === 465,
  tls: {
    ciphers: "SSLv3",
  },
} as TransportOptions);

export async function sendVerificationEmail(
  to: string,
  token: string,
  locale: Locale,
) {
  const verificationUrl = `${env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

  const subject = {
    en: "Verify your email address",
    de: "Bestätige deine E-Mail-Adresse",
  };

  const textContent = {
    en: `Hello,

Thank you for registering with GrowAGram. Please verify your email address by clicking the following link:

${verificationUrl}

If you did not create an account, please ignore this email.

Best regards,
The GrowAGram Team`,
    de: `Hallo,

Vielen Dank für deine Registrierung bei GrowAGram. Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:

${verificationUrl}

Falls du kein Konto erstellt hast, ignoriere bitte diese E-Mail.

Mit freundlichen Grüßen,
Das GrowAGram Team`,
  };

  const htmlContent = {
    en: `<p>Hello,</p>
<p>Thank you for registering with GrowAGram. Please verify your email address by clicking the following link:</p>
<p><a href="${verificationUrl}">${verificationUrl}</a></p>
<p>If you did not create an account, please ignore this email.</p>
<p>Best regards,<br>The GrowAGram Team</p>`,
    de: `<p>Hallo,</p>
<p>Vielen Dank für deine Registrierung bei GrowAGram. Bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
<p><a href="${verificationUrl}">${verificationUrl}</a></p>
<p>Falls du kein Konto erstellt hast, ignoriere bitte diese E-Mail.</p>
<p>Mit freundlichen Grüßen,<br>Das GrowAGram Team</p>`,
  };

  // if (process.env.NODE_ENV === "development") {
  if (false) {
    console.log(`Verification URL: ${verificationUrl}`);
  } else {
    const mailOptions = {
      from: `${env.MAIL_FROM_NAME} <${env.MAIL_FROM_EMAIL}>`,
      to,
      subject: subject[locale],
      text: textContent[locale],
      html: htmlContent[locale],
    };

    await transporter.sendMail(mailOptions);
  }
}
