import Mailgen from "mailgen"; 


const emailVerifyMailContent = (username, verificationURL) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our project! We are excited to have you onboard!",
            action: {
                instructions: "To verify email, please click on the following button",
                button: {
                    color: "#f288c4ff",
                    text: "VERIFY!",
                    link: verificationURL
                },
            },
        },
    };

}