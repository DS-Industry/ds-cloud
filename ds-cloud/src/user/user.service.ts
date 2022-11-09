import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { use } from 'passport';
import { response } from 'express';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Find all users in db
   */
  public async findAll() {
    return this.userRepository.findAll({});
  }

  /**
   * Get user by id
   * @param id
   */
  public async findOne(id: string) {
    const user = this.userRepository.findOneById(id);

    if (!user) throw new NotFoundException(`User with id: ${id} is not found`);

    return user;
  }

  /**
   * Assigning role to user by id
   * @param id
   * @param assignRoleDto
   *
   */
  public async assignRole(id: string, assignRoleDto: AssignRoleDto) {
    const user = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $push: { roles: assignRoleDto.role } },
    );
    if (!user) throw new NotFoundException(`User with id: ${id} is not found`);

    return user;
  }

  /**
   * Remove role from user
   * @param id
   * @param assignRoleDto
   */
  public async removeRole(id: string, assignRoleDto: AssignRoleDto) {
    const user = await this.userRepository.findOneAndUpdate(
      { _id: id },
      { $pull: { roles: assignRoleDto.role } },
    );
    if (!user) throw new NotFoundException(`User with id: ${id} is not found`);

    return user;
  }

  /**
   * Update user
   * @param id
   * @param updateUserDto
   */
  public async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOneAndUpdate(
      { _id: id },
      updateUserDto,
    );

    if (!user) throw new NotFoundException(`User with id: ${id} is not found`);

    return user;
  }

  /**
   * Get user's api key
   * @param id
   */
  public async getApiKeyByUserId(user: any) {
    const response = {
      id: user._id,
      name: user.name,
      apiKey: user.apiKey,
    };

    return response;
  }

  //TODO
  // 1) Remove User Role Method
}
