import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AUTHENTICATION_THIRD_PARTY } from 'src/constants/const';
import { AuthService } from '../auth.service';
import { ThirdPartyPayload } from '../interfaces/third-party-payload.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super(AUTHENTICATION_THIRD_PARTY.GOOGLE);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails, photos } = profile;

    const payload: ThirdPartyPayload =
      await this.authService.verifyThirdPartyAuthentication({
        name: name.givenName + name.familyName,
        email: emails[0].value,
        photo: (photos[0] && photos[0].value) || '',
      });

    done(null, payload);
  }
}
