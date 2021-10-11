import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LogInDto } from './dto/auth.dto';
@ApiTags('User')
@Controller('users')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary:
      'The username and the password are received, it is validated, and the access token is sent',
  })
  @Post('login')
  async login(@Body() payload: LogInDto) {
    const user = await this.authService.validateUser(
      payload.username,
      payload.password,
    );
    if (!user) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Usuario o contraseña inválido',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const resp = await this.authService.login(user);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Resultado del login',
      data: resp,
    };
  }
}
