const nodemailer = require('nodemailer');
const configuration = require('../configs/configuration');

const sendMail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    service: 'Gmail',
    auth: {
      user: configuration.gmail.USER,
      pass: configuration.gmail.PASS,
    },
  });

  const message = {
    from: `ADMIN ${configuration.gmail.USER} FROM INDUSTRIAL PARK MANAGEMENT`,
    to: email,
    subject: subject,
    html: html,
  };

  const info = await transporter.sendMail(message);
  return info;
};

module.exports = sendMail;
