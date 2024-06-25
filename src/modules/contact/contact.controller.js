import nodemailer from 'nodemailer';
import { HttpResponse } from '../../handlers/HttpResponse.js';
import { HttpException } from '../../handlers/HttpException.js';
import InternalServerException from '../../handlers/InternalServerException.js';

export async function contact(req, res) {
    try {

        const {company_name, person_name, contact_email, phone_number, message} = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_PASSWORD,
            }
        });

        let mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: process.env.OWNER_EMAIL,
            subject: 'Contact Us',
            text: message,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return HttpException(res, 400, 'Error sending email', {});
            } else {
                console.log('Email sent: ' + info.response);

                mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: contact_email,
                    subject: 'Thank You',
                    text: `We Received Your Mail.`,
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        return HttpException(res, 400, 'Error sending confirmation email', {});
                    } else {
                        console.log('Email sent: ' + info.response);
                        return HttpResponse(res, 200, 'Confirmation Email sent', {});
                    }
                });
            }
        });

    } catch (error) {
        return InternalServerException(res, error);
    }
}