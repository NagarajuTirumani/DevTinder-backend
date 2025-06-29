const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
    const { subject, template, toEmail } = options;
    const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Dev Tinder." <${EMAIL_USER}>`,
    to: toEmail,
    subject: subject,
    html: template,
  });
};

module.exports = { sendEmail };
