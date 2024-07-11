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
            subject: 'New Querry ',
            html:  `<head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            width: 80%;
                            margin: auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .button {
                            background-color: #4CAF50;
                            border: none;
                            color: white;
                            padding: 15px 32px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 16px;
                            margin: 4px 2px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Hii Team,</h2>
                        <p>We found the query with following details:</p>
                        
                        <p>We found the query with following details:</p>
                            <p>Company Name: ${company_name}</p>
                            <p>Persion Name: ${person_name}</p>
                            <p>Email: ${contact_email}</p>
                            <p>Phone: ${phone_number}</p>
                            |<p>Message: ${message}</p>
                        <p>Thanks,</p>
                        <p>Zcel India Team</p>
                    </div>
                </body>`
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
                    subject: 'Thank You for Connecting to Bizdiving - ZCEL INDIA',
                    // text: `We Received Your Mail.`,
                    html:  `<head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                        }
                        .container {
                            width: 80%;
                            margin: auto;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                        }
                        .button {
                            background-color: #4CAF50;
                            border: none;
                            color: white;
                            padding: 15px 32px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 16px;
                            margin: 4px 2px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h2>Thankyou for joining us</h2>
                        <p>Hello,</p>
                        <p>We got your querry and we will connect you soon.</p>
                        
                        <p>Got a question? Email us at sales@zcelindia.com or give us a call at +91-9821342553</p>
                        <p>Thanks,</p>
                        <p>Zcel India Team</p>
                    </div>
                </body>`
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