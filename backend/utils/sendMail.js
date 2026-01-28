import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendMail = async (to, name, eventTitle, position, certPath) => {
  try {
    const mailOptions = {
      from: `"Event Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🎓 Certificate for ${eventTitle}`,
      text: `Hi ${name}, congratulations! Please find your certificate attached.`,
      attachments: [
        {
          filename: "certificate.pdf",
          path: certPath
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Certificate sent to ${to}`);

  } catch (error) {
    console.error("❌ Error sending mail:", error.message);
  }
};

export default sendMail;
