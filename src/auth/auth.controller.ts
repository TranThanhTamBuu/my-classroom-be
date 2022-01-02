import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
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
import { ChangeProfileDto } from './dto/change-profile.dto';
import { ToggleActiveDto } from './dto/toggle-active-dto';
import { ChangeStudentIdDto } from './dto/change-student-id-dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password-dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard())
  async getCurrentUser(@Req() req) {
    const { _id, photo, name, email, studentId, active, isAdmin } = req.user;
    return { _id, photo, name, email, studentId, active, isAdmin };
  }

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto): Promise<JwtAccessToken | Users> {
    return this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<JwtAccessToken> {
    return this.authService.signIn(signInDto);
  }

  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ success: boolean }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean }> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('/activation/:token')
  async activate(@Res() res, @Param('token') token: string) {
    try {
      await this.authService.activate(token);
      res.redirect(process.env.FE_URL + '/?tab=sign-in&activation=1');
    } catch (error) {
      console.log(error);
      res.redirect(process.env.FE_URL + '/404');
    }
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
  async changeProfile(
    @Req() req,
    @Body() changeProfileDto: ChangeProfileDto,
  ): Promise<Users> {
    return this.authService.changeUserProfile(req.user, changeProfileDto);
  }

  @Get('/users/:type')
  @UseGuards(AuthGuard())
  async getUsers(@Req() req, @Param('type') type: string): Promise<Users[]> {
    if (req.user.isAdmin) return this.authService.getAllUsers(type === 'admin');
    else throw new ForbiddenException();
  }

  @Post('/toggle-active')
  @UseGuards(AuthGuard())
  async toggleActive(
    @Req() req,
    @Body() toggleActiveDto: ToggleActiveDto,
  ): Promise<Users[]> {
    if (req.user.isAdmin)
      return this.authService.toggleActiveUser(toggleActiveDto);
    else throw new ForbiddenException();
  }

  @Post('/change-student-id')
  @UseGuards(AuthGuard())
  async changeStudentId(
    @Req() req,
    @Body() changeStudentIdDto: ChangeStudentIdDto,
  ): Promise<Users> {
    if (req.user.isAdmin)
      return this.authService.changeStudentId(changeStudentIdDto);
    else throw new ForbiddenException();
  }

  @Post('/create-admin')
  @UseGuards(AuthGuard())
  async createAdmin(
    @Req() req,
    @Body() signUpDto: SignUpDto,
  ): Promise<JwtAccessToken | Users> {
    if (req.user.isAdmin) return this.authService.signUp(signUpDto, true);
    else throw new ForbiddenException();
  }
}
