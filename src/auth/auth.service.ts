import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { User } from '../entity/user.entity';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.login(username, password);
    if (user) return user;
    return null;
  }

  async login(user: User) {
    const payload = {
      username: user.username,
      sub: user.id,
      //email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: plainToClass(User, user),
      expiresIn: jwtConstants.expiresIn,
    };
  }
}
