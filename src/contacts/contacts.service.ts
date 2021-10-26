import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContactApp } from '../entity/contactsApp.entity';
import { User } from '../entity/user.entity';
import { UsersService } from '../users/users.service';
import { Invitation } from '../entity/invitation.entity';
import {
  AddUserContactDTO,
  NewContactDTO,
  UpdateContactDTO,
} from './dto/contact.dto';
import { getError, LocaleEnum } from '../utils/errors';
import {
  ContactsByCategoryResponse,
  ContactsResponse,
} from './dto/contact-responses.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactApp)
    private contactRepository: Repository<ContactApp>,
    @InjectRepository(Invitation)
    private invitationRepository: Repository<Invitation>,
    private readonly userService: UsersService,
  ) {}

  async createContacts(data: NewContactDTO[], user: User) {
    if (!data || data.length === 0) {
      throw new BadRequestException(
        getError(LocaleEnum.ES).BadRequestAddingAContact,
      );
    }
    const checkIfUserExist = await this.userService.findOneUser({
      id: user.id,
    });
    if (!checkIfUserExist) {
      throw new BadRequestException(getError(LocaleEnum.ES).UserNotFound);
    }

    const contactsOfThisUser = await this.contactRepository.find({
      user,
    });
    const contactsToAdd = data.filter(
      ({ phoneNumber: id1 }) =>
        !contactsOfThisUser.some(({ phoneNumber: id2 }) => id2 === id1),
    );

    const savePromises = [];
    for (const contact of contactsToAdd) {
      const contactToaddAlreadyExistAsAppUser =
        await this.userService.findOneUser({
          phoneNumber: contact.phoneNumber,
        });
      if (contactToaddAlreadyExistAsAppUser) {
        const newData = {
          fullname: contactToaddAlreadyExistAsAppUser.fullname,
          phoneNumber: contactToaddAlreadyExistAsAppUser.phoneNumber,
          username: contactToaddAlreadyExistAsAppUser.username,
          favorite: false,
          alias: null,
        };
        savePromises.push(this.contactRepository.save({ ...newData, user }));
      } else {
        savePromises.push(this.contactRepository.save({ ...contact, user }));
      }
    }
    try {
      await Promise.all(savePromises);
      return {
        statusCode: HttpStatus.OK,
        message: 'Contactos creados',
        data: await this.contactRepository.find({ user }),
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async removeContact(contactID: string, user) {
    try {
      const contact = await this.contactRepository.findOne({ id: contactID });
      if (!contact.user === user)
        throw new BadRequestException(
          getError(LocaleEnum.ES).BadRequestDeletingAContact,
        );
      return {
        statusCode: HttpStatus.OK,
        message: 'Remover contactos',
        data: await this.contactRepository.delete({ id: contactID }),
      };
    } catch (e) {
      throw new BadRequestException(
        getError(LocaleEnum.ES).BadRequestDeletingAContact,
      );
    }
  }

  // TODO: Evaluar que solo se pueden añadir usuarios con numero de telefono y que tengan el validado de KYC a true!.
  async addAnUserToMyContacts(contactData: AddUserContactDTO, user: User) {
    const checkIfUserExistPromise = this.userService.findOneUser({
      id: user.id,
    });
    const checkIfUserThatIWantToAddPromise = this.userService.findOneUser({
      id: contactData.userId,
    });

    try {
      const [checkIfUserExist, checkIfUserThatIWantToAdd] = await Promise.all([
        checkIfUserExistPromise,
        checkIfUserThatIWantToAddPromise,
      ]);

      if (!checkIfUserExist || !checkIfUserThatIWantToAdd) {
        throw new BadRequestException(getError(LocaleEnum.ES).UserNotFound);
      }

      if (!checkIfUserThatIWantToAdd.phoneNumber)
        throw new BadRequestException(
          getError(LocaleEnum.ES).BadRequestAddingAContact,
        );
      const userIsAlreadyMyContact = await this.contactRepository.findOne({
        where: { phoneNumber: checkIfUserThatIWantToAdd.phoneNumber, user },
      });
      if (userIsAlreadyMyContact) {
        const newData = {
          favorite:
            typeof contactData.favorite == 'boolean'
              ? contactData.favorite
              : false,
          alias: contactData.favorite ? contactData.alias : null,
        };
        await this.contactRepository.save({
          ...userIsAlreadyMyContact,
          ...newData,
        });
      } else {
        const newData = {
          fullname: checkIfUserThatIWantToAdd.fullname,
          phoneNumber: checkIfUserThatIWantToAdd.phoneNumber,
          username: checkIfUserThatIWantToAdd.username,
          favorite:
            typeof contactData.favorite == 'boolean'
              ? contactData.favorite
              : false,
          alias: contactData.favorite ? contactData.alias : null,
        };
        await this.contactRepository.save({ ...newData, user });
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Contacto Alfred añadido a tu lista de contacto',
        data: await this.contactRepository.find({ user }),
      };
    } catch (e) {
      Logger.log(e);
      throw new BadRequestException(
        getError(LocaleEnum.ES).BadRequestAddingAContact,
      );
    }
  }

  // TODO: No se pueden editar contactos que no son usuarios alfred y no se puede editar mas que favorito y alias de los contactos alfred.
  async updateContact(contactUpdate: UpdateContactDTO, user: User) {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id: contactUpdate.contactId, user: user },
      });
      if (!contact)
        throw new BadRequestException(
          getError(LocaleEnum.ES).BadRequestUpdateContact,
        );

      const contactExistAsUser = await this.userService.findOneUser({
        phoneNumber: contact.phoneNumber,
      });
      if (!contactExistAsUser) contactUpdate.favorite = false;
      if (!contactUpdate.favorite) contactUpdate.alias = null;
      delete contactUpdate.contactId;
      return {
        statusCode: HttpStatus.OK,
        message: 'Actualizaste un contacto',
        data: await this.contactRepository.save({
          ...contact,
          ...contactUpdate,
        }),
      };
    } catch (e) {
      throw new BadRequestException(
        getError(LocaleEnum.ES).BadRequestUpdateContact,
      );
    }
  }

  async getAllContacts(user: User): Promise<ContactsResponse> {
    return {
      statusCode: HttpStatus.OK,
      message: `Lista de usuarios de ${user.username}`,
      data: await this.contactRepository.find({ user }),
    };
  }

  async contactByCategory(user: User): Promise<ContactsByCategoryResponse> {
    const contacts = await this.contactRepository.find({ user: user });
    if (contacts && contacts.length > 0) {
      const contactPhoneNumber: string[] = [];
      const contactFavoritePhoneNumber: string[] = [];
      const contactPhone: string[] = [];

      contacts.forEach((contact) => {
        contact.favorite
          ? contactFavoritePhoneNumber.push(contact.phoneNumber)
          : contactPhoneNumber.push(contact.phoneNumber);
        contactPhone.push(contact.phoneNumber);
      });
      const contactInAppPromise = this.userService.findUserWithContact({
        phoneNumber: In(contactPhoneNumber.filter(Boolean)),
      });
      const contactFavoriteInAppPromise =
        this.userService.findUserWithContact({
          phoneNumber: In(contactFavoritePhoneNumber.filter(Boolean)),
        });

      const [contactInApp, contactFavoriteInApp] = await Promise.all([
        contactInAppPromise,
        contactFavoriteInAppPromise,
      ]);

      const contactInAppData = contactInApp.map((user) => {
        const contact = contacts.find(
          (contact) => contact.phoneNumber === user.phoneNumber && contact,
        );
        return { ...user, contact };
      });
      const contactInAppPhone = contactInApp.map((x) => x.phoneNumber);
      const contactFavoriteInAppData = contactFavoriteInApp.map(
        (user) => {
          const contact = contacts.find(
            (contact) => contact.phoneNumber === user.phoneNumber && contact,
          );
          return { ...user, contact };
        },
      );
      const contactFavoriteInAppPhone = contactFavoriteInApp.map(
        (x) => x.phoneNumber,
      );

      const allContactsInApp = [
        ...contactInAppPhone,
        ...contactFavoriteInAppPhone,
      ];
      const missingContacts = contactPhone.filter(
        (item) => allContactsInApp.indexOf(item) < 0,
      );

      const contactNotInApp = contacts
        .map((x) => {
          if (missingContacts.indexOf(x.phoneNumber) > -1) return x;
        })
        .filter(Boolean);

      return {
        statusCode: HttpStatus.OK,
        message: 'Lista de microcreditos por categorias',
        data: {
          //inApp
          forUsers: contactInAppData,
          //favoriteInApp
          forShops: contactFavoriteInAppData,
          //notInApp: contactNotInApp,
        },
      };
    } else {
      return {
        statusCode: HttpStatus.OK,
        message: 'Lista de microcreditos por categorias',
        data: {
          forUsers: [],
          forShops: [],
          /* inApp: [],
          favoriteInApp: [],
          notInApp: [], */
        },
      };
    }
  }

  async checkIfPhoneNumberContactIsAnUser(phoneNumber: string): Promise<User> {
    return this.userService.findOneUser({ phoneNumber });
  }

  async searchContact(username: string, user: User) {
    try {
      console.log(user.id);
      const contactSearchPromise = this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.favorite = TRUE')
        .andWhere(
          '(LOWER(contact.alias) LIKE LOWER(:username) OR LOWER(contact.fullname) LIKE LOWER(:username) OR LOWER(contact.username) LIKE LOWER(:username)) AND contact."userId" = :userid ',
          {
            username: `%${username}%`,
            userid: user.id,
          },
        )
        .getMany();
      const userSearchPromise = this.userService.filterByUsername(username, user);

      const [contactSearch, userSearch] = await Promise.all([
        contactSearchPromise,
        userSearchPromise,
      ]);

      const userToShow = userSearch.filter(
        ({ phoneNumber: id1 }) =>
          !contactSearch.some(({ phoneNumber: id2 }) => id2 === id1),
      );

      return {
        contactSearch,
        userSearch: userToShow,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
