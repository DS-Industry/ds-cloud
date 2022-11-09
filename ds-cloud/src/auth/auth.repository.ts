import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { IPayloadJwt } from './interface/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Creating new user, after successful registration
   * @param createUserDto
   */
  public async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  public async getUserById(userId: string) {
    return this.userModel.findById(userId);
  }

  /**
   * Setting refresh token to user Model
   * @param id
   * @param refreshToken
   */
  public async updateRefreshToken(id: string, refreshToken: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id },
      { refreshToken: refreshToken },
      { new: true },
    );

    return await user.save();
  }

  /**
   * Removing refresh token from user Model
   * @param id
   */
  public async removeRefreshToken(id: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: id },
      { refreshToken: null },
      { new: true },
    );

    return await user.save();
  }

  /**
   * Validating user by refresh token.
   * @param id
   * @param refreshToken
   */
  public async getUserIfRefreshTokenMatches(id: string, refreshToken: string) {
    const user = await this.userModel.findOne({ _id: id });

    const isRefreshMatching = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (isRefreshMatching) return user;

    return null;
  }

  /**
   * Getting user by access token
   * @param accessToken
   */
  public async getUserFromAuthToken(accessToken: string) {
    try {
      const payload: IPayloadJwt = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (!payload.userId) throw new BadRequestException('Invalid Credentials');

      return this.getUserById(payload.userId);
    } catch (e) {
      if (e.status) throw e;
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Searching user by email
   * @param email
   */
  public async getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  /**
   * Setting api access key to user model
   * @param userId
   * @param key
   */
  public async setApiKey(userId: string, apiKey: string) {
    const user = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { apiKey: apiKey },
      { new: true },
    );
    return user.save();
  }

  /**
   * Validating api key
   * @param userId
   * @param apiKey
   */
  public async getUserIfApiKeyMatches(apiKey: string) {
    const user = await this.userModel.findOne({ apiKey: apiKey}).select({ _id: 1}).lean();
    //const match = users.find((user) => user.apiKey == apiKey);
    if (user) return user;

    return null;
  }
}
