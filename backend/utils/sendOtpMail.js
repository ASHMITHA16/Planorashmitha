import nodemailer from 'nodemailer';

const sendOtpMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: 'Verify your email',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`
  });
  console.log(`Sent OTP ${otp} to email ${email}`); // Debug log
};

export default sendOtpMail;
