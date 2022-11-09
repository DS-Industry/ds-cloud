import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { IPayloadJwt } from './interface/payload.interface';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { GetAccessTokenDto } from './dto/get-access-token.dto';
import { RolesGuard } from './guard/roles.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register new user
   * @param registerDto
   */

  @Post('/register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  public register(@Body() registerDto: CreateUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiBody({ type: LoginUserDto })
  public async login(@Req() req) {
    const { user } = req;
    const payload: IPayloadJwt = {
      userId: user._id,
      email: user.email,
    };
    const accessTokenCookie = this.authService.getCookieWithToken(payload);
    const { cookie: refreshTokenCookie, refreshToken: refreshToken } =
      this.authService.getCookieWithJwtRefreshToken(payload);

    await this.authService.setRefreshToken(payload.userId, refreshToken);

    this.authService.setHeaderArray(req.res, [
      accessTokenCookie,
      refreshTokenCookie,
    ]);
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      message: 'Success',
    };
  }

  @Get()
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  public getAuthenticatedUser(@Req() req) {
    return { _id: req.user.id, email: req.user.email, name: req.useruser.name };
  }

  @Post('/logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiCreatedResponse({ description: 'Created Successfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiConflictResponse({ description: 'Conflict Request' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiBody({ type: GetAccessTokenDto })
  @UseGuards(JwtAuthGuard)
  public async logout(@Req() req) {
    const { user } = req;
    await this.authService.removeRefreshToken(user._id);
    this.authService.clearCookie(req.res);
    return {
      status: HttpStatus.OK,
      logout: true,
    };
  }

  @Get('/refresh')
  @ApiOperation({ summary: 'Get access token by refresh token' })
  @ApiOkResponse({ description: 'The resource was returned successfully' })
  @ApiForbiddenResponse({ description: 'Unauthorized Request' })
  @ApiNotFoundResponse({ description: 'Resource not found' })
  @ApiBody({ type: GetAccessTokenDto })
  @UseGuards(JwtRefreshAuthGuard)
  public async refreshToken(@Req() req) {
    const { user } = req;

    const payload: IPayloadJwt = {
      userId: user.userId,
      email: user.email,
    };

    const accessTokenCookie = this.authService.getCookieWithToken(payload);
    this.authService.setHeaderSingle(req.res, accessTokenCookie);
    return { _id: req.user.id, email: req.user.email, name: req.useruser.name };
  }

  @Get('/apikey')
  @ApiExcludeEndpoint()
  @Roles(Role.DEV, Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  public getApiKey(@Req() req) {
    const { user } = req;
    return this.authService.setApiKey(user._id);
  }
}
