import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    imageBase64?: string
) => {
    try {
        const mailOptions: any = {
            from: `"RediBo Notificaciones" <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        };

        if (imageBase64) {
            mailOptions.attachments = [
                {
                    filename: 'comprobante_pago.png',
                    content: Buffer.from(imageBase64, 'base64'),
                    encoding: 'base64',
                    contentType: 'image/png',
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
