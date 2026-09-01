import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
  private readonly logger = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const akey = req.headers['akey'];

    this.logger.log(
      `[${req.method} ${req.originalUrl}] akey header present=${akey != null && akey !== ''} value=${JSON.stringify(
        akey,
      )}`,
    );

    return super.canActivate(context);
  }
}
