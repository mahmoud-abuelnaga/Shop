// Packages
const { createTransport } = require("nodemailer");

// Constants
const mailTransporter = createTransport({
    service: "gmail",
    auth: {
        user: "mahmoudabuelnaga27@gmail.com",
        pass: process.env.gmailPass,
    },
});

exports.sendTextMail = (to, subject, text, callback) => {
    const mail = {
        from: "mahmoudabuelnaga27@gmail.com",
        to,
        subject,
        text,
    };

    mailTransporter.sendMail(mail, callback);
};

exports.sendHTMLMail = (to, subject, html, callback) => {
    const mail = {
        from: "mahmoudabuelnaga27@gmail.com",
        to,
        subject,
        html,
    };

    mailTransporter.sendMail(mail, callback);
};
