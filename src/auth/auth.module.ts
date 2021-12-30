import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Users } from './users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_OPTIONS } from 'src/constants/const';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register(JWT_OPTIONS),
    MailModule,
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, MicrosoftStrategy],
  controllers: [AuthController],
  exports: [
    JwtStrategy,
    PassportModule,
    GoogleStrategy,
    MicrosoftStrategy,
    AuthService,
  ],
})
export class AuthModule {}
