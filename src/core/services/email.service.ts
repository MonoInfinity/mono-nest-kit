import { Injectable } from '@nestjs/common';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { monoEnum, monoLogger } from 'mono-utils-core';
import { config } from '../config';
import { constant } from '../constant';

@Injectable()
export class EmailService {
    constructor(private readonly mailService: MailService) {}

    private sendMail(receiver: string, subject: string, content: string) {
        const mail: MailDataRequired = {
            to: receiver,
            from: config.SENDGRID_SENDER,
            subject: subject,
            html: `<div>${content}</div>`,
            mailSettings: {
                sandboxMode: {
                    enable: config.NODE_ENV !== monoEnum.NODE_ENV_MODE.PRODUCTION,
                },
            },
        };

        return this.mailService
            .send(mail)
            .then(() => true)
            .catch((error) => {
                monoLogger.log(constant.NS.APP_ERROR, error.response.body);
                return false;
            });
    }

    async sendEmailForVerify(receiver: string, otp: string) {
        return await this.sendMail(
            receiver,
            'VERIFY EMAIL',
            `
                                                <div>
                                                    <h2>Hello, ${receiver}</h2>
                                                    <p>We are from Mono Infinity Team</p>
                                                    <p>Please click to this link to verify your email:</p>
                                                    <a href="${config.SENDGRID_URL}/user/verify-email/${otp}"></a>
                                                </div>
        `,
        );
    }
}
