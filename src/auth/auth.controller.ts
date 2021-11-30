import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { JwtAccessToken } from './interfaces/jwt-access-token.interface';
import 'dotenv/config';
import { Users } from './users.entity';
import { ChangeProfileDto} from './dto/change-profile.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard())
  async getCurrentUser(@Req() req) {
    const { _id, photo, name, email, studentId } = req.user;
    return { _id, photo, name, email, studentId };
  }

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<JwtAccessToken> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<JwtAccessToken> {
    return this.authService.signIn(signInDto);
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  googleAuth(@Req() _req) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    res.redirect(this.authService.thirdPartyRedirectURL(req.user));
  }

  @Get('/microsoft')
  @UseGuards(AuthGuard('microsoft'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  microsoftAuth(@Req() _req) {}

  @Get('/microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  microsoftAuthRedirect(@Req() req, @Res() res) {
    res.redirect(this.authService.thirdPartyRedirectURL(req.user));
  }

  @Post('/profile')
  @UseGuards(AuthGuard())
  async changeProfile(@Req() req, @Body() changeProfileDto: ChangeProfileDto): Promise<Users> {
    return this.authService.changeUserProfile(req.user, changeProfileDto);
  }
}
