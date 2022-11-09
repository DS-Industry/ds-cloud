import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../user/schema/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private _authService: AuthService) {
    super({ usernameField: 'email' });
  }

  public async validate(email: string, password: string) {
    const user = await this._authService.validateUser(email, password);
    return user;
  }
}
