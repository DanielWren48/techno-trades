import nodemailer, { Transporter } from 'nodemailer';
import { renderToStaticMarkup } from 'react-dom/server';
import ENV from '../config/config'
import { ForgotPasswordVerification, ActivateAccount, Welcome, OtpSignIn, EmailChangeVerification } from '../templates';
import React from 'react';
import { IUser } from '../models/users';

export enum EmailType {
    WELCOME = 'welcome',
    ACTIVATE = 'activate',
    OTP_LOGIN = 'otp-login',
    RESET_PASSWORD = 'reset-password',
    RESET_PASSWORD_SUCCESS = 'reset-password-success',
    RESET_EMAIL = 'reset-email',
}

interface EmailProps {
    user: IUser
    emailType: EmailType;
    data?: any;
}

const transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: ENV.EMAIL_HOST_USER,
        pass: ENV.EMAIL_HOST_PASSWORD,
    },
});

export const sendEmail = async ({ user, emailType, data }: EmailProps) => {
    let subject: string;
    let template: React.ReactNode;

    switch (emailType) {
        case EmailType.ACTIVATE:
            subject = 'Activate your account';
            template = <ActivateAccount otp={data} />;
            break;
        case EmailType.WELCOME:
            subject = 'Welcome';
            template = <Welcome name={user.firstName} />;
            break;
        case EmailType.RESET_PASSWORD:
            subject = 'Password Reset';
            template = <ForgotPasswordVerification otp={data} />;
            break;
        case EmailType.OTP_LOGIN:
            subject = 'Otp SignIn';
            template = <OtpSignIn otp={data} />;
            break;
        case EmailType.RESET_EMAIL:
            subject = 'Otp SignIn';
            template = <EmailChangeVerification otp={data} />;
            break;
        default:
            throw new Error('Invalid email type');
    }

    const htmlContent = renderToStaticMarkup(template);

    const mailOptions = {
        from: ENV.EMAIL_HOST_USER,
        to: user.email,
        html: htmlContent,
        subject,
    };

    if (ENV.NODE_ENV === 'DEVELOPMENT') return;

    process.nextTick(async () => {
        await transporter.sendMail(mailOptions)
            .catch(error => {
                console.error('Error sending email:', error.message);
            });
    })
};
