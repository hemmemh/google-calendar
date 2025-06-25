import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserSchema } from 'src/schemas/User.schema';
import { registerDTO } from '../auth/DTO/registerDTO';
import { AccessToken } from '../auth/types/accessToken';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserSchema)
    private UserRepo: Repository<UserSchema>,
  ) {}

  getUserByEmail(email: string) {
    return this.UserRepo.findOne({ where: { email } });
  }

  async create(user: registerDTO) {
    return this.UserRepo.save(user);
  }

  async validateUser(email: string): Promise<UserSchema> {
    const user: UserSchema = await this.getUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  async login(dto: UserSchema): Promise<AccessToken> {
    const user: UserSchema = await this.getUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const isMatch: boolean = bcrypt.compareSync(dto.password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Password does not match');
    }
    return this.verify(user);
  }

  async logout(res: any) {
    try {
      return res.status(200).send({ message: 'Successfully logged out' });
    } catch (error) {
      console.log('err', error);
      
      throw new BadRequestException(error);
    }
  }

  async delete(id: string) {
    try {
      return this.UserRepo.delete(id);
    } catch (error) {
      throw new BadRequestException('User not found');
    }
  }

  async verify(user: UserSchema): Promise<AccessToken> {
    const payload = { email: user.email, uid: user.uid };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async register(user: registerDTO): Promise<AccessToken> {
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await this.create({ ...user, password: hashedPassword });
    return this.verify(newUser);
  }

  async getProfile(user: UserSchema) {
    console.log('user', user);

    const profile = await this.validateUser(user.email);
    return profile;
  }
}
