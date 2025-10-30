import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'TimeChest - Restablecer contraseña',
    html: `
      <h1>Restablecer contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
      <a href="${resetUrl}">Restablecer contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;