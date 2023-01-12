import { HttpException, HttpStatus } from '@nestjs/common';



export class DeviceInternalException extends HttpException {
  constructor(device: string) {
    super(
      `Device ${device} experiencing internal issues`,
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
