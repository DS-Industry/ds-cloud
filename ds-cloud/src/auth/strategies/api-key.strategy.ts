import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthRepository } from '../auth.repository';
import { Error } from 'mongoose';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private authRepository: AuthRepository) {
    super({ header: 'akey', prefix: '' }, true, async (apiKey, done) =>
      this.validateKey(apiKey, done),
    );
  }

  public async validateKey(
    incomingApiKey: string,
    done: (error: Error, data) => Record<string, unknown>,
  ) {
    const trimmedKey =
      typeof incomingApiKey === 'string' ? incomingApiKey.trim() : incomingApiKey;

    const checkKey = await this.authRepository.getUserIfApiKeyMatches(
      trimmedKey,
    );

    if (!checkKey) return done(new UnauthorizedException(), false);

    done(null, true);
  }
}
