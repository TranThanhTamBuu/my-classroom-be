import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as path from 'path';
import * as hbs from 'nodemailer-express-handlebars';
import 'dotenv/config';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export default class MailService {
  private readonly transporter: Mail;

  constructor(
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
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
    await this.sendMailActivation('boopro2000@gmail.com', 'Boo', '123');
    await this.sendMailInviteClass('boopro2000@gmail.com', '123', 'Class Name');
  }

  async sendMailInviteClass(
    invitedEmail: string,
    link: string,
    className: string,
  ) {
    const aUser = await this.authService.getUserByEmail(invitedEmail);
    if (aUser == null) {
      return;
    }
    const email = {
      from: `"My classroom" <${process.env.EMAIL}>`,
      to: invitedEmail,
      subject: 'Invite to join ' + className,
      template: 'class-invitation',
      context: {
        title: 'Invite to join ' + className,
        name: aUser.name,
        btnText: `Join ${className}`,
        className,
        btnLink: link,
      },
    };

    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log(error);
    }
  }

  async sendMailActivation(mail: string, name: string, token: string) {
    const email = {
      from: `"My classroom" <${process.env.EMAIL}>`,
      to: mail,
      subject: 'Welcome to My Classroom',
      template: 'activation',
      context: {
        title: 'Welcome to My Classroom',
        name: name,
        btnText: 'Activate',
        btnLink: `${process.env.BE_URL}/auth/activation/${token}`,
      },
    };

    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log(error);
    }
  }

  async sendForgetPassword(mail: string, name: string, token: string) {
    const email = {
      from: `"My classroom" <${process.env.EMAIL}>`,
      to: mail,
      subject: 'Reset your password',
      template: 'reset-password',
      context: {
        title: 'Reset My Classroom account password',
        name: name,
        btnText: 'Reset',
        btnLink: `${process.env.FE_URL}/?tab=reset-password&token=${token}`,
      },
    };

    try {
      await this.transporter.sendMail(email);
    } catch (error) {
      console.log(error);
    }
  }
}
