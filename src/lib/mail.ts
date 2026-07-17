import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // 587 için false
  auth: {
    user: process.env.SMTP_USER, // Brevo'nun verdiği 853df2... adresi buraya gitmeli (Doğrulama için)
    pass: process.env.SMTP_PASS,
  },
});

export async function sendKocaCinarMail(to: string, subject: string, htmlContent: string) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Koca Çınar Şarküteri" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('Mail Gönderme Hatası:', error);
    return false;
  }
}