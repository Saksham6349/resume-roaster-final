const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function sendVerificationEmail(email, name, token) {
  if (!process.env.EMAIL_USER) {
    console.log('📧 [DEV] Verification link:', BASE_URL + '/api/auth/verify/' + token);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"Resume Roaster 🔥" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Verify your Resume Roaster account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a09;color:#eeeae0;border-radius:16px">
        <div style="font-size:32px;margin-bottom:16px">🔥</div>
        <h2 style="font-size:22px;font-weight:800;margin-bottom:8px">Welcome, ${name}!</h2>
        <p style="color:#79766e;margin-bottom:24px">Click below to verify your email and start roasting resumes.</p>
        <a href="${BASE_URL}/api/auth/verify/${token}" style="display:inline-block;background:#e8622a;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Verify Email</a>
        <p style="color:#4f4d49;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't sign up, ignore this.</p>
      </div>`
  });
}

async function sendPasswordResetEmail(email, name, token) {
  if (!process.env.EMAIL_USER) {
    console.log('📧 [DEV] Reset link:', BASE_URL + '/reset-password?token=' + token);
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: '"Resume Roaster 🔥" <' + process.env.EMAIL_USER + '>',
    to: email,
    subject: 'Reset your Resume Roaster password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0a0a09;color:#eeeae0;border-radius:16px">
        <div style="font-size:32px;margin-bottom:16px">🔥</div>
        <h2 style="font-size:22px;font-weight:800;margin-bottom:8px">Password Reset</h2>
        <p style="color:#79766e;margin-bottom:24px">Hi ${name}, click below to reset your password. Link expires in 1 hour.</p>
        <a href="${BASE_URL}/reset-password?token=${token}" style="display:inline-block;background:#e8622a;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Reset Password</a>
        <p style="color:#4f4d49;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
      </div>`
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
