const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //options=email address to where we want to send, subject line, email content.
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    //enable or aCTIVATE IN GMAIL: "LESS SECURE APP" OPTION
  });

  //2)Define the email options
  const mailOptions = {
    from: 'Ashok kumar <ashokkumar1999@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  //3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
