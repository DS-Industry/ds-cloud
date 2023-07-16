import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Inject,
  LoggerService,
  Query,
} from '@nestjs/common';
import { ExternalService } from './external.service';
import { ExternalMobileWriteRequest } from './dto/write-mobile-external.dto';
import { ApiKeyGuard } from '../auth/guard/api-key.guard';
import {
  ApiForbiddenResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { GetCollectionListRequest } from './dto/get-collection-list-request.dto';
import { GetCollectionBayRequest } from './dto/get-collection-bay-request.dto';


@ApiTags('External mobile')
@ApiSecurity('x-api-key', ['x-api-key'])
@Controller('external')
export class ExternalController {
  constructor(
    private readonly externalService: ExternalService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  @Get('/device/write/:id')
  @ApiOperation({ summary: 'Write device data from device' })
  @ApiParam({ name: 'id', required: false, type: 'int' })
  @ApiHeader({ name: 'data', required: false })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @UseGuards(ApiKeyGuard)
  writeDeviceData(@Param('id') id: string, @Req() req) {
    //Get data from header and parse in into JSON
    const data = req.headers.data.split(',');
    return this.externalService.writeControllerData(id, data);
  }

  @Post('mobile/write/:id')
  @ApiOperation({ summary: 'Write device data from mobile' })
  @ApiParam({ name: 'id', required: false, type: 'int' })
  @ApiOkResponse({ description: 'The resource was updated successfully' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @UseGuards(ApiKeyGuard)
  writeMobileData(
    @Param('id') id: string,
    @Body() externalMobileWriteRequest: ExternalMobileWriteRequest,
    @Req() req,
  ) {
    this.logger.log(
      `[${req.url}] External device request. ${JSON.stringify(req.body)}`,
      req.headers,
    );
    return this.externalService.writeMobileData(id, externalMobileWriteRequest);
  }

  @Get('/price/write/:id')
  writePriceData(@Req() req, @Param('id') id: string) {
    const data = req.headers.data;
    return this.externalService.writePriceData(id, JSON.parse(data));
  }

  @Get('collection/list')
  @UseGuards(ApiKeyGuard)
  getCollectionList(@Query() query: GetCollectionListRequest) {
    return this.externalService.getCollectionList(+query.code);
  }

  @Get('collection/group/list')
  @UseGuards(ApiKeyGuard)
  getCollectionListGrouped(@Query() query: GetCollectionListRequest) {
    return this.externalService.getCollectionListLocationGroup(+query.code);
  }

  @Get('collection/device')
  getCollectionBay(@Query() query: GetCollectionBayRequest) {
    return this.externalService.getDeviceByCarwashIdAndBayNumber(
      query.carwashId,
      +query.bayNumber,
    );
  }
}
