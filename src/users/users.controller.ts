import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { isEmail } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entity/user.entity';
import { AuthService } from './../auth/auth.service';
import { CodeVerificationType } from './../entity/pin.entity';
import { UserStatus } from './../entity/user.entity';
import RegisterDto, {
  ChangePasswordDto,
  ForgotPasswordDto,
  KycDto,
  NewEmailDto,
  UpdateUserDto,
  ValidatePinDto,
  ValidatePinNewEmailDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

export interface ImgProfile {
  avatar: Express.Multer.File;
}
@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Perfil de usuario' })
  @Get()
  async getProfile(@Request() req) {
    console.log(req.user);
    const user = await this.usersService.findOneByUserName(
      req.user.user.username,
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Profile data',
      data: plainToClass(User, user),
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Only Testing: Todos los usuarios del sistema' })
  @Get('all')
  async getAll() {
    const user: User[] = await this.usersService.findUserByCriteria({});
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Todos los usuarios',
      data: plainToClass(User, user),
    };
  }

  @Get('verify-phone')
  async sendVerifyCodePhone(@Query('phoneNumber') phoneNumber: string) {
    const user: User[] = await this.usersService.findUserByCriteria({
      phoneNumber: phoneNumber,
    });
    let resp = null;
    if (user && user.length > 0)
      resp = await this.usersService.sendPin(
        user[0],
        CodeVerificationType.verifyPhone,
        true,
      );
    else
      resp = await this.usersService.sendPin(
        phoneNumber,
        CodeVerificationType.verifyPhone,
        true,
      );
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Send pin',
      data: resp,
    };
  }

  @Get('verify-value')
  @ApiQuery({
    name: 'phoneNumber',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
  })
  async verifyValue(
    @Query('phoneNumber') phoneNumber?: string,
    @Query('username') username?: string,
    @Query('email') email?: string,
  ) {
    const resp = await this.usersService.verifyValue(
      phoneNumber,
      username,
      email,
    );
    if (phoneNumber) {
      return { data: { phoneNumber: resp } };
    }
    if (username) {
      return { data: { username: resp } };
    }
    if (email) {
      return { data: { email: resp } };
    }
  }

  @Get('forgot-password')
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Olvidó su contraseña' })
  async forgotPassword(@Query('criteria') criteria: string) {
    let isAnEmail: boolean;
    isEmail(criteria) ? (isAnEmail = true) : (isAnEmail = false);
    const resp = await this.usersService.forgotPassword(criteria, isAnEmail);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Recovery password',
      data: plainToClass(User, resp),
    };
  }

  /* @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Testing: Get list files',
  })
  @Get('listAwsFiles')
  async getListAwsFiles(@Request() req) {
    return {
      statusCode: HttpStatus.OK,
      message: 'List aws files',
      data: await this.usersService.getListAwsFiles(),
    };
  } */

  @Post()
  @ApiOperation({ summary: 'Registro de usuarios' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registrationData: RegisterDto) {
    const user = await this.usersService.register(registrationData);
    const resp = await this.authService.login(user);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Resultado del register',
      data: plainToClass(User, resp),
    };
  }

  @Post('kyc')
  @ApiOperation({ summary: 'Kyc' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: KycDto })
  async kyc(@Body() payload: KycDto, @Request() req) {
    const user: User = req.user.user;
    payload.status = UserStatus.active;
    payload.id = user.id;
    const resp = await this.usersService.kyc(payload);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Kyc',
      data: plainToClass(User, resp),
    };
  }

  @Post('changeUserStatus')
  @ApiOperation({ summary: 'Change user status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiQuery({ name: 'status', enum: UserStatus })
  async changeUserStatus(@Request() req, @Query('status') status: UserStatus) {
    const user: User = req.user.user;
    const resp = await this.usersService.updateUser(
      { status: status, id: user.id },
      user,
    );
    const data = await this.usersService.findUserByCriteria({ id: user.id });
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Change user status',
      data: plainToClass(User, data[0]),
    };
  }

  @Post('/forgot-password')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        newPassword: {
          type: 'string',
        },
        ref: {
          type: 'string',
          description:
            'El email o usermail que usaron en el forgot password (get)',
          example: 'admin@example.com o admin ',
        },
        pin: {
          type: 'string',
        },
      },
      required: ['newPassword', 'ref', 'pin'],
    },
  })
  @ApiOperation({ summary: 'Nueva contraseña por olvidar su clave' })
  async restoreForgotPassword(@Body() payload: ForgotPasswordDto) {
    const resp = await this.usersService.restoreForgotPassword(
      payload.ref,
      payload.newPassword,
      payload.pin,
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Resultado del forgot password',
      data: plainToClass(User, resp),
    };
  }

  @Post('changePassword')
  @ApiOperation({ summary: 'Permite cambiar el cambiar el password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Request() req, @Body() payload: ChangePasswordDto) {
    const u: User = req.user.user;
    const user = await this.usersService.changePassword(
      payload.newPassword,
      payload.confirmPassword,
      u,
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Resultado del Update',
      data: true,
    };
  }

  @Post('changeEmail')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cambia el email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
        },
      },
      required: ['email'],
    },
  })
  async changeEmail(@Request() req, @Body() payload: NewEmailDto) {
    const user: User = req.user.user;
    if (user.email === payload.email) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'No puede usar el email que tiene actualmente.',
        data: [],
      };
    }
    user.email = payload.email;
    const veryEmail = await this.usersService.verifyValue(
      null,
      null,
      payload.email,
    );
    if (!veryEmail)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Ese email no puede ser usado. Intente con otro',
        data: [],
      };
    const resp = await this.usersService.sendPin(
      user,
      CodeVerificationType.changeEmail,
      false,
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Pin para cambio de email',
      data: plainToClass(User, resp),
    };
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('pin/validate')
  @ApiOperation({ summary: 'Validate pin' })
  async validatePin(@Request() req, @Body() payload: ValidatePinDto) {
    let ref: string = null;
    if (payload.email) ref = payload.email;
    if (payload.phoneNumber) ref = payload.phoneNumber;
    if (ref === null)
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'El email o número de telefono es necesario',
        data: [],
      };
    const resp = await this.usersService.validatePin(payload.pin, ref);
    if (resp) {
      const data = await this.authService.login(resp);
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Pin',
        data: plainToClass(User, data),
      };
    } else {
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Pin',
        data: true,
      };
    }
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('pin/validateNewEmail')
  @ApiOperation({ summary: 'Validate pin' })
  async validatePinNewEmail(
    @Request() req,
    @Body() payload: ValidatePinNewEmailDto,
  ) {
    const resp = await this.usersService.validatePin(
      payload.pin,
      payload.email,
      req.user.user,
    );
    if (resp) {
      //const data = await this.authService.login(resp);
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Pin',
        data: plainToClass(User, resp),
      };
    } else {
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Pin',
        data: true,
      };
    }
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualiza datos del usuarios' })
  @ApiBody({ type: UpdateUserDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('avatar'))
  /*@UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './photos',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )*/
  //@UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
        fullname: {
          type: 'string',
        },
        firebaseToken: {
          type: 'string',
        },
      },
      required: [],
    },
  })
  async updateUser(
    @Request() req,
    @Body() payload: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const user: User = req.user.user;
    if (payload)
      await this.usersService.updateUser(
        { ...payload, id: user.id },
        user,
        avatar,
      );

    const data = await this.usersService.findUserByCriteria({ id: user.id });
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Resultado del Update',
      data: plainToClass(User, data[0]),
    };
  }

  @Delete('avatar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Borrar el avatar del usuario',
  })
  async deleteAvatar(@Request() req) {
    await this.usersService.deleteAvatar(req.user.user);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Delete avatar',
      data: true,
    };
  }

  @Delete(':id?')
  @ApiQuery({
    name: 'id',
    required: false,
    type: String,
  })
  @ApiOperation({
    summary: 'Only Testing: Borrar usuarios, uno (por id) o todos',
  })
  async deleteUser(@Query('id') id?: string) {
    let criteria = {};
    if (id) criteria = { id: id };
    return await this.usersService.delete(criteria);
  }
}
