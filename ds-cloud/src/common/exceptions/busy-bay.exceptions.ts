import { HttpException, HttpStatus } from '@nestjs/common';

export class BusyBayExceptions extends HttpException {
  constructor(device: string) {
    super(`Device with identifier ${device} is busy`, HttpStatus.SERVICE_UNAVAILABLE);
  }
}
