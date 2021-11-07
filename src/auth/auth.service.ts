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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersRepository: Repository<Users>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<JwtAccessToken> {
    const { studentId, email, name, password } = signUpDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const isStudentExist = (await this.usersRepository.find({ studentId }))
      .length;
    if (studentId && isStudentExist) {
      throw new ConflictException();
    }

    const user = this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      studentId,
    });

    try {
      await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === ERROR_CODE.DUPLICATE) {
        throw new ConflictException();
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
    }&statusCode=${exception.getStatus() || ''}`;
  }
}
