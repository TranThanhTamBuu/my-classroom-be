import { HttpException } from '@nestjs/common';

export interface ThirdPartyPayload {
  accessToken?: string;
  exception?: HttpException;
}
