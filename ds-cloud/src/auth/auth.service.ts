import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { Promise } from 'mongoose';
import { AuthRepository } from './auth.repository';
import { User } from '../user/schema/user.schema';
import { IPayloadJwt } from './interface/payload.interface';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Login in user
   * @param email
   * @param password
   */
  public async validateUser(email: string, password: string) {
    try {
      const user = await this.getUserByEmail(email);

      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) return user;
      }
    } catch (e) {
      if (e.status == HttpStatus.BAD_REQUEST) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Registering new user. Returning token on completed registration.
   * @param registerDto
   */
  public async register(registerDto: CreateUserDto) {
    try {
      //Check if user already exists
      const userCheck = await this.authRepository.getUserByEmail(
        registerDto.email,
      );

      if (userCheck)
        throw new ConflictException(
          `User with this email ${registerDto.email} already exists`,
        );

      //Hashing password
      const hashPassword: string = await this.dataHash(registerDto.password);

      //Creating user in database
      const user = await this.authRepository.create({
        ...registerDto,
        password: hashPassword,
      });

      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        message: 'Success',
      };
    } catch (e) {
      if (e.status == HttpStatus.CONFLICT) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generating cookie with access token
   * @param payload
   */
  public getCookieWithToken(payload: IPayloadJwt) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME'),
    });
    return `Authorization=${token};HttpOnly;Path=/;Max-Age=${this.configService.get<string>(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  /**
   * Generating cookie with refresh token
   * @param payload
   */
  public getCookieWithJwtRefreshToken(payload: IPayloadJwt) {
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      ),
    });
    const cookie = `Refresh=${refreshToken};HttpOnly;Path=/;Max-Age=${this.configService.get<string>(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;

    return {
      cookie,
      refreshToken,
    };
  }

  /**
   * Getting user by email if exists
   * @param email
   */
  public async getUserByEmail(email: string) {
    try {
      const user = await this.authRepository.getUserByEmail(email);

      if (!user)
        throw new NotFoundException('User with this email does not exists');
      return user;
    } catch (e) {
      if (e.status) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Assigning refresh token to user document
   * @param userId
   * @param refreshToken
   */
  public async setRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const hashedRefreshToken = await this.dataHash(refreshToken);
    return await this.authRepository.updateRefreshToken(
      userId,
      hashedRefreshToken,
    );
  }

  /**
   * Get user by id if exists
   * @param userId
   */
  public async getUserById(userId: string) {
    try {
      const user = await this.authRepository.getUserById(userId);

      if (!user)
        throw new NotFoundException('User with this id does not exists');
      return user;
    } catch (e) {
      if (e.status) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Deleting refresh token from user document
   * @param userId
   */
  public async removeRefreshToken(userId: string): Promise<User> {
    return await this.authRepository.removeRefreshToken(userId);
  }

  /**
   * Clearing cookie
   */
  public clearCookie(res: Response): void {
    const emptyCookie = [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
    res.setHeader('Set-Cookie', emptyCookie);
  }

  /**
   * Setting cookie into response header
   * @param res
   * @param cookie
   */
  public setHeaderSingle(res: Response, cookie: string): void {
    res.setHeader('Set-Cookie', cookie);
  }

  /**
   * Setting array of cookies into response header
   * @param res
   * @param cookies
   */
  public setHeaderArray(res: Response, cookies: string[]): void {
    res.setHeader('Set-Cookie', cookies);
  }

  /**
   * Using bcrypt library to hash data provided in params.
   * @param data
   */
  async dataHash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(data, salt);

    return hash;
  }

  /**
   * Generating api key
   */
  public async setApiKey(userId: string) {
    try {
      const key = crypto.randomBytes(8);
      const user = await this.authRepository.setApiKey(
        userId,
        key.toString('hex'),
      );

      if (!user)
        throw new NotFoundException('User with this id does not exists');

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        apiKey: user.apiKey,
      };
    } catch (e) {
      if (e.status) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
