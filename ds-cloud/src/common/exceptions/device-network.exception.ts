import { HttpException, HttpStatus } from '@nestjs/common';

export class DeviceNetworkException extends HttpException {
  constructor(device: string) {
    super(
      `Network error: Connection with ${device} device interrupted`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
