import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignUpDto } from './dto/sign-up.dto';
import { Users } from './users.entity';
import { ERROR_CODE } from '../constants/const';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtAccessToken } from './interfaces/jwt-access-token.interface';
import { ThirdPartyDto } from './dto/third-party.dto';
import { ThirdPartyPayload } from './interfaces/third-party-payload.interface';
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ToggleActiveDto } from './dto/toggle-active-dto';
import { ChangeStudentIdDto } from './dto/change-student-id-dto';
import MailService from 'src/mail/mail.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async signUp(
    signUpDto: SignUpDto,
    admin?: boolean,
  ): Promise<JwtAccessToken | Users> {
    const { studentId, email, name, password, isAdmin } = signUpDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const isStudentExist = (await this.usersRepository.find({ studentId }))
      .length;
    if (studentId && isStudentExist)
      throw new ConflictException('Student ID has already been taken.');

    if (studentId && isAdmin)
      throw new ConflictException('Student must not be admin.');

    const user = this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      studentId,
      isAdmin,
      active: true,
      createdAt: new Date(),
      activation: isAdmin ? true : undefined
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === ERROR_CODE.DUPLICATE) {
        throw new ConflictException('Email has already been taken.');
      } else {
        throw new InternalServerErrorException();
      }
    }

    this.mailService.sendMailActivation(
      email,
      name,
      (await this.getAccessToken(user.email)).accessToken,
    );

    if (admin) return user;
    return await this.getAccessToken(user.email);
  }

  async getAccessToken(email: string): Promise<JwtAccessToken> {
    const payload: JwtPayload = { email };
    const accessToken: string = await this.jwtService.sign(payload);
    return { accessToken };
  }

  async signIn(signInDto: SignInDto): Promise<JwtAccessToken> {
    const { email, password } = signInDto;
    const user = await this.usersRepository.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.active)
        throw new UnauthorizedException('This user has been deactivated');

      if (!user.activation) throw new UnauthorizedException('Unactivation');

      return await this.getAccessToken(user.email);
    } else {
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ success: boolean }> {
    const { email } = forgotPasswordDto;
    const user = await this.usersRepository.findOne({ email });

    if (!user) throw new NotFoundException();

    this.mailService.sendForgetPassword(
      email,
      user.name,
      (await this.getAccessToken(user.email)).accessToken,
    );

    return { success: true };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    const { token, password } = resetPasswordDto;

    const { email } = await this.jwtService.verify(token);
    const user = await this.usersRepository.findOne({ email });
    if (!user) throw new NotFoundException();

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { success: true };
  }

  async activate(token: string): Promise<void> {
    const { email } = await this.jwtService.verify(token);
    await this.usersRepository.update({ email }, { activation: true });
  }

  async verifyThirdPartyAuthentication(
    thirdPartyDto: ThirdPartyDto,
  ): Promise<ThirdPartyPayload> {
    const { email, photo } = thirdPartyDto;

    const user = await this.usersRepository.findOne({ email });

    if (!user)
      return {
        exception: new UnauthorizedException(),
      };

    if (!user.active)
      return {
        exception: new UnauthorizedException('This user has been deactivated'),
      };

    if (!user.activation)
      return {
        exception: new UnauthorizedException('Unactivation'),
      };

    await this.usersRepository.update({ email }, { photo });
    const { accessToken } = await this.getAccessToken(user.email);

    return {
      accessToken,
    };
  }

  thirdPartyRedirectURL(thirdPartyPayload: ThirdPartyPayload): string {
    const { accessToken, exception } = thirdPartyPayload;
    return `${process.env.FE_URL}/oauth?accessToken=${
      accessToken || ''
    }&statusCode=${exception?.getStatus() || ''}&message=${
      exception?.message || ''
    }`;
  }

  async getUser(userId: string): Promise<Users> {
    return this.usersRepository.findOne(userId);
  }

  async getUserByEmail(email: string): Promise<Users> {
    return this.usersRepository.findOne({ email: email });
  }

  async getAllUsers(isAdmin: boolean): Promise<Users[]> {
    return this.usersRepository.find({
      where: {
        isAdmin,
      },
    });
  }

  async toggleActiveUser(toggleActiveDto: ToggleActiveDto): Promise<Users[]> {
    const { userIds, active } = toggleActiveDto;
    return Promise.all(
      userIds.map(async (userId) => {
        const user = await this.usersRepository.findOne(userId);
        user.active = active;
        return this.usersRepository.save(user);
      }),
    );
  }

  async changeStudentId(
    changeStudentIdDto: ChangeStudentIdDto,
  ): Promise<Users> {
    const { userId, studentId } = changeStudentIdDto;

    const user = await this.usersRepository.findOne(userId);

    if (!user) throw new NotFoundException();

    if (!user.studentId)
      throw new ConflictException(
        'Can not set student id for teacher or admin',
      );

    const student = await this.usersRepository.findOne({
      studentId: studentId,
    });

    if (student) throw new ConflictException('This Student Id has been used');

    user.studentId = studentId;
    return this.usersRepository.save(user);
  }

  async getListUser(userIds: string[]): Promise<Users[]> {
    return this.usersRepository.findByIds(userIds);
  }

  async getListUserByStuId(stuId: string[]): Promise<Users[]> {
    return this.usersRepository.find({
      where: {
        studentId: { $in: stuId },
      },
    });
  }

  async changeUserProfile(
    user: Users,
    changeProfileDto: ChangeProfileDto,
  ): Promise<Users> {
    const { name, studentId } = changeProfileDto;
    var aUser = null;
    if (studentId)
      aUser = await this.usersRepository.findOne({ studentId: studentId });
    if (aUser == null || aUser._id.toString() === user._id.toString()) {
      user.name = name;
      user.studentId = studentId;
      return this.usersRepository.save(user);
    } else {
      throw new ConflictException('This Student ID has been used');
    }
  }
}
