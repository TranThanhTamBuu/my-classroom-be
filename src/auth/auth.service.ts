import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<JwtAccessToken> {
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
      return await this.getAccessToken(user.email);
    } else {
      throw new UnauthorizedException();
    }
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
    }&statusCode=${exception?.getStatus() || ''}`;
  }

  async getUser(userId: string): Promise<Users> {
    return this.usersRepository.findOne(userId);
  }

  async getUserByEmail(email: string): Promise<Users> {
    return this.usersRepository.findOne({ email: email });
  }

  async getAllUsers(): Promise<Users[]> {
    return this.usersRepository.find();
  }

  async toggleActiveUser(toggleActiveDto: ToggleActiveDto): Promise<Users> {
    const { userId, active } = toggleActiveDto;
    const user = await this.usersRepository.findOne({ _id: userId });
    user.active = active;
    return this.usersRepository.save(user);
  }

  async changeStudentId(
    changeStudentIdDto: ChangeStudentIdDto,
  ): Promise<Users> {
    const { userId, studentId } = changeStudentIdDto;

    const user = await this.usersRepository.findOne({ _id: userId });

    if (!user.studentId)
      throw new ConflictException(
        'Can not set student id for teacher or admin',
      );

    const student = await this.usersRepository.findOne({
      studentId: studentId,
    });

    if (student) throw new ConflictException('This Student ID has been used');

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
