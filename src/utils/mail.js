import Mailgen from "mailgen"; 
import nodemailer from "nodemailer"; 

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Project Manager",
            link: "https://projectmanagelink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);

    const emailHTML = mailGenerator.generate(options.mailgenContent); 

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }

    })

    const mail = {
        from: "mail.projectmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHTML
    }

    try {
        await transporter.sendMail(mail);
    } catch (error) {
        console.error("Email service failed. Please make sure you have provided the credentials are correct!");
        console.error("Error: ", error);
    }
}

const emailVerifyMailContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our project! We are excited to have you onboard!",
            action: {
                instructions: "To verify email, please click on the following button: ",
                button: {
                    color: "#f288c4",
                    text: "VERIFY!",
                    link: verificationURL
                },
            },
        outro: "Facing issues or need assistance? Contact us or reply to this email! We'll get in touch shortly..." 
        },
    };
}

const forgetPassEmailContent = (username, forgetPassURL) => {
    return {
        body: {
            name: username,
            intro: "Hey, we received a request for reset password of your account.",
            action: {
                instructions: "To change password, please click on the following button",
                button: {
                    color: "#f2bb88",
                    text: "RESET PASSWORD!",
                    link: forgetPassURL
                },
            },
        outro: "Facing issues or need assistance? Contact us or reply to this email! We'll get in touch shortly." 
        },
    };
}

export {
    emailVerifyMailContent,
    forgetPassEmailContent,
    sendEmail
}; 
