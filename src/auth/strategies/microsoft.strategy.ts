import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile } from 'passport';
import { Strategy, VerifyCallback } from 'passport-microsoft';
import { AUTHENTICATION_THIRD_PARTY } from 'src/constants/const';
import { AuthService } from '../auth.service';
import { ThirdPartyPayload } from '../interfaces/third-party-payload.interface';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private authService: AuthService) {
    super(AUTHENTICATION_THIRD_PARTY.MICROSOFT);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const { name, emails } = profile;

    const payload: ThirdPartyPayload =
      await this.authService.verifyThirdPartyAuthentication({
        name: name.givenName + name.familyName,
        email: emails[0].value,
        photo: '',
      });

    done(null, payload);
  }
}
