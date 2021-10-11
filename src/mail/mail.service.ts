import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../entity/user.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {
    sgMail.setApiKey(config.get('SENDGRID_API_KEY'));
  }

  async sendUserConfirmation(user: User, pin: string) {
    const msg = {
      to: user.email,
      from: this.config.get('SENDGRID_FROM'),
      subject: 'Confirmation PIN',
      text: 'The confirmation pin is ' + pin,
    };

    console.log('Email msg ', msg);

    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
        console.log('----------------------');
        console.log(error.response.body);
      });
  }
}
