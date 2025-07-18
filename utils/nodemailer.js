const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "yashpouranik124@gmail.com",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

/**
 * Send email to a recipient
 * @param {Object} options - mail options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.text - plain text
 * @param {string} options.html - html content
 */
const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: 'yashpouranik1245@gmail.com@gmail.com',
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendMail;
