import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { isString } from 'class-validator';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { DeepPartial, FindConditions, Repository } from 'typeorm';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { User } from '../entity/user.entity';
import { MailService } from '../mail/mail.service';
import { deleteFile, getExtension } from '../utils/utils';
import { CodeVerificationType, Pin } from './../entity/pin.entity';
import RegisterDto, { KycDto } from './dto/user.dto';
import { getError, LocaleEnum } from '../utils/errors';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Pin)
    private pinRepository: Repository<Pin>,
    private mailService: MailService,
    @InjectTwilio() private readonly client: TwilioClient,
    private readonly jwtService: JwtService,
  ) {}

  async getAll() {
    return await this.usersRepository.find();
  }

  async findOneByUserName(username: string) {
    try {
      return await this.usersRepository.findOne({ username: username });
    } catch (e) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Usuario no encontrado.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findUserByCriteria(
    criteria: FindConditions<User> | any,
  ): Promise<User[]> {
    try {
      return await this.usersRepository.find(criteria);
    } catch (e) {
      return [];
    }
  }

  async findOneUser(criteria: FindConditions<User> | any): Promise<User> {
    try {
      const user = await this.usersRepository.findOne(criteria);
      if (!user) return null;
      return user;
    } catch (e) {
      throw new NotFoundException(getError(LocaleEnum.ES).BadRequestFindUser);
    }
  }

  async findUserWithContact(
    criteria: FindConditions<User> | any,
  ): Promise<User[]> {
    try {
      return await this.usersRepository.find({
        where: criteria,
      });
    } catch (e) {
      return [];
    }
  }

  async findPinByCriteria(criteria: FindConditions<Pin>): Promise<Pin[]> {
    try {
      return await this.pinRepository.find({
        where: criteria,
        relations: ['user'],
      });
    } catch (e) {
      return [];
    }
  }

  async verifyValue(phoneNumber?: string, username?: string, email?: string) {
    let criteria;
    if (phoneNumber) {
      criteria = { phoneNumber: phoneNumber };
    }
    if (username) {
      criteria = { username: username };
    }
    if (email) {
      criteria = { email: email };
    }
    //Object.keys(criteria).map((x) => (x = false));

    const user = await this.findUserByCriteria(criteria);
    if (user && user.length > 0) return false;
    return true;
  }

  async validatePin(pin: string, ref: string, user?: User) {
    const resp = await this.pinRepository.findOne({
      pin: pin,
      ref: ref,
      valid: true,
    });
    if (!resp)
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Pin invalido.',
        },
        HttpStatus.NOT_FOUND,
      );
    else {
      await this.pinRepository.update(
        { pin: pin, ref: ref, valid: true },
        { valid: false },
      );
      if (resp.typePin === CodeVerificationType.changeEmail) {
        await this.usersRepository.save({ id: user.id, email: ref });
      }
    }
    return await this.usersRepository.findOne({
      where: [{ phoneNumber: ref }, { email: ref }],
    });
  }

  /*async updateUser(updateData: DeepPartial<User>) {
    try {
      return await this.usersRepository.save(updateData);
    } catch (e) {
      return [];
    }
  }*/

  public async recoveryPassword(email: string) {
    const criteria = {
      where: [{ email: email }],
    };
    const resp = await this.findUserByCriteria(criteria);

    if (resp && resp.length > 0) {
      await this.sendPin(resp[0], CodeVerificationType.forgotPassword);
      return resp[0];
    } else {
      throw new HttpException(
        'No existe un usuario con ese email o username',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async forgotPassword(criteria: string, isAnEmail: boolean) {
    const user = await this.usersRepository.findOne({
      where: [
        { email: criteria },
        { phoneNumber: criteria },
        { username: criteria },
      ],
    });
    console.log('user forgot ', user);
    if (user) {
      return await this.sendPin(
        user,
        CodeVerificationType.forgotPassword,
        !isAnEmail,
      );
    } else {
      throw new HttpException(
        {
          message: 'No existe un usuario con ese email o número de teléfono',
          statusCode: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async restoreForgotPassword(ref: string, newPassword: string, pin: string) {
    const verifyPhone = await this.pinRepository.findOne({
      where: {
        ref: ref,
        valid: false,
        typePin: CodeVerificationType.forgotPassword,
        pin: pin,
      },
    });
    console.log('VerifyPhone ', verifyPhone);
    if (!verifyPhone)
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Solicitud incorrecta.',
        },
        HttpStatus.NOT_FOUND,
      );
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await this.usersRepository.findOne({
      where: [{ email: ref }, { phoneNumber: ref }, { username: ref }],
    });
    await this.pinRepository.update({ pin: pin }, { valid: false });
    if (user) {
      user.password = hashedPassword;
      return await this.usersRepository.save(user);
    }
    return null;
  }

  async changePassword(newPass: string, confirmPass: string, user: User) {
    if (newPass !== confirmPass)
      throw new HttpException(
        'Las contraseñas no son iguales',
        HttpStatus.BAD_REQUEST,
      );

    const hashedPassword = await bcrypt.hash(newPass, 10);
    const u = await this.usersRepository.save({
      id: user.id,
      password: hashedPassword,
    });
    return u;
  }

  private CreateReferralLink(id: number) {
    const token = this.jwtService.sign(
      { id },
      {
        expiresIn: '7300d',
        secret: 'secretKey',
      },
    );
    return token;
  }

  public async register(registrationData: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    !!registrationData.extraSecurityPin
      ? (registrationData.extraSecurityPin = bcrypt.hashSync(
          registrationData.extraSecurityPin,
          8,
        ))
      : null;

    if (registrationData.phoneNumber) {
      const verifyPhone = await this.pinRepository.findOne({
        where: {
          ref: registrationData.phoneNumber,
          valid: false,
          typePin: CodeVerificationType.verifyPhone,
        },
      });
      if (!verifyPhone)
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Debe verificar su número de telefono primero',
          },
          HttpStatus.NOT_FOUND,
        );
    }
    try {
      registrationData.password = hashedPassword;
      registrationData.username = `@${registrationData.username}`;
      const newUser = await this.usersRepository.create(registrationData);

      const createdUser = await this.usersRepository.save(newUser);

      const referralLink = this.CreateReferralLink(createdUser.id);
      await this.usersRepository.update(createdUser.id, {
        referralLink,
      });
      const updateUser = await this.usersRepository.findOne({
        id: createdUser.id,
      });
      updateUser.password = undefined;
      return updateUser;
    } catch (error) {
      console.log('Error registro ', error);
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Ya existe un usuario con ese email o username',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async kyc(payload: KycDto) {
    try {
      const resp = await this.usersRepository.save(payload);
      const user = await this.findUserByCriteria({ id: payload.id });
      return user[0];
    } catch (e) {
      return [];
    }
  }

  async updateUser(
    updateData: DeepPartial<User>,
    user: User,
    files?: Express.Multer.File,
  ) {
    try {
      if (files) {
        console.log('En files ');
        let avatar;
      }
        /* if (files) {
          if (user.avatar && user.avatar !== '' && user.avatarUri !== '') {
            this.awsService.deleteObject('profile/' + user.avatar);
          }
          avatar = await this.awsService.uploadFile(
            files.buffer,
            'profile',
            getExtension(files.originalname),
            files.mimetype,
          );
          updateData = {
            ...updateData,
            avatar: avatar.filename,
            avatarUri: avatar.uploadResult.Location,
          };
          console.log('avatar ', avatar);
        }
      } */

      //if (updateData.avatar) this.deleteAvatar(user);

      updateData = Object.entries(updateData)
        .filter(([_, value]) => !!value || typeof value === 'boolean')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      console.log('Updatedata ', updateData);
      return await this.usersRepository.save(updateData);
    } catch (e) {
      return [];
    }
  }

  async sendPin(
    user: User | string,
    typePin: CodeVerificationType,
    sendToPhone = false,
  ) {
    const pin = '000000'; // this.generatePin();
    const ref: string = isString(user)
      ? user
      : sendToPhone
      ? user.phoneNumber
      : user.email;
    await this.pinRepository.save({
      pin: pin,
      ref: ref,
      typePin: typePin,
    });
    if (sendToPhone) {
      console.log('Phone pin');
      //await this.sendSMS(ref, 'Your pin is ' + pin);
    } else {
      console.log('Email pin');
      if (!isString(user))
        await this.mailService.sendUserConfirmation(user, pin);
    }

    return true;
  }

  async login(username: string, password: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: [{ email: username }, { username: `@${username}` }],
      });
      if (user) {
        const isPasswordMatching = await bcrypt.compare(
          password,
          user.password,
        );
        if (!isPasswordMatching) {
          throw new HttpException(
            'Introdujo credenciales inválidas',
            HttpStatus.BAD_REQUEST,
          );
        }
        return user;
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'El usuario que introdujo no existe',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      console.log('Error en login ', e);
      return null;
    }
  }

  async sendSMS(to: string, body: string) {
    if (process.env.TWILIO_MODE !== 'test') {
      try {
        return await this.client.messages.create({
          body: body,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to.replace('-', ''),
        });
      } catch (e) {
        console.log(e);
        return e;
      }
    }
  }

  async delete(criteria: any) {
    const user = await this.findUserByCriteria(criteria);
    if (user && user.length > 0) {
      user.map(async (x) => {
        console.log('perfil a borrar de aws ', x);
        if (x.avatar && x.avatar !== '') {
          //await this.awsService.deleteObject('profile/' + x.avatar);
          await deleteFile(x.avatar);
        }
      });
    }
    //await this.pinRepository.delete(criteria);
    await this.usersRepository.delete(criteria);
  }

/*   async getListAwsFiles() {
    try {
      return await this.awsService.listFiles();
    } catch (e) {
      console.log('Error list file ', e);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Error list files. ' + e,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }
 */
  async deleteAvatar(user: User) {
    if (user.avatar && user.avatar !== '') {
      const resp = deleteFile(user.avatar);
      if (resp) {
        await this.usersRepository.update({ id: user.id }, { avatar: null });
      }
    }
    return true;
  }

  generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async filterByUsername(username: string, user: User) {
    try {
      const SearchName = this.usersRepository.createQueryBuilder('user');
      SearchName.where(
        '((LOWER(user.username) LIKE LOWER(:username) OR LOWER(user.fullname) LIKE LOWER(:username)) AND user.id != :userid )',
        { username: `%${username}%`, userid: user.id },
      );

      return await SearchName.getMany();
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
