import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import * as hbs from 'nodemailer-express-handlebars';
import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export default class MailService {
  private readonly transporter: Mail;

  constructor(
    private authService: AuthService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.transporter.use(
      'compile',
      hbs({
        viewEngine: {
          extname: '.hbs',
          partialsDir: path.join(__dirname, './views'),
          layoutsDir: path.join(__dirname, './views/layouts'),
          defaultLayout: 'blank',
        },
        viewPath: path.join(__dirname, './views'),
        extName: '.hbs',
      }),
    );
  }

  async sendTestMail(): Promise<void> {
    const email = {
      from: `"My classroom" <${process.env.EMAIL}>`,
      to: 'tamtt@dgroup.co',
      subject: 'Test Email',
      template: 'test',
      context: {
        title: 'Test Email',
        name: 'Tam Buu',
        btnText: 'Activate',
        btnLink: `${process.env.FE_URL}/activate/?token=asd12345`,
      },
    };

    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log(error);
    }
  }

  async sendMail(invitedEmail: string, link: string, className: string) {
    const aUser = await this.authService.getUserByEmail(invitedEmail);
    if (aUser == null) {
      return;
    }
    const email = {
      from: `"My classroom" <${process.env.EMAIL}>`,
      to: invitedEmail,
      subject: 'Invite to join ' + className,
      template: 'test',
      context: {
        title: 'Invite to join class' + className,
        name: aUser.name,
        btnText: 'Activate',
        btnLink: link,
      },
    };

    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log(error);
    }
  }
}
