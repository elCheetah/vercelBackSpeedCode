import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    imagePath?: string
) => {
    try {
        const mailOptions: any = {
            from: `"RediBo Notificaciones" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        if (imagePath) {
            mailOptions.attachments = [
                {
                    filename: 'comprobante_pago.png',
                    path: imagePath,
                },
            ];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo enviado: ', info.messageId);
        return true;
    } catch (error) {
        console.error('Error al enviar correo:', error);
        return false;
    }
};
