import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post, Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ValidationException } from '../common/exceptions/validation.exception';
import {
  AddUserContactDTO,
  NewContactDTO,
  UpdateContactDTO,
} from './dto/contact.dto';
import { CurrentUser } from '../common/decorators/user.decorator';
import {
  ContactsByCategoryResponse,
  ContactsResponse,
} from './dto/contact-responses.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContactApp } from '../entity/contactsApp.entity';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactService: ContactsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Añadir Contactos',
  })
  @ApiBody({
    type: NewContactDTO,
    isArray: true,
  })
  @ApiCreatedResponse({
    type: ContactsResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    type: ValidationException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  createContacts(
    @Body() payload: NewContactDTO[],
    @CurrentUser() user,
  ): Promise<ContactsResponse> {
    console.log(payload);
    return this.contactService.createContacts(payload, user);
  }

  @Post('/addUserToContacts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Añadir usuario de App a Contactos',
  })
  @ApiBody({
    type: AddUserContactDTO,
  })
  @ApiCreatedResponse({
    type: ContactsResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    type: ValidationException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  addUserToContacts(
    @Body() payload: AddUserContactDTO,
    @CurrentUser() user,
  ): Promise<ContactsResponse> {
    return this.contactService.addAnUserToMyContacts(payload, user);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Ver lista completa de contactos',
  })
  @ApiCreatedResponse({
    type: ContactsResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    type: ValidationException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  getAllContacts(@CurrentUser() user): Promise<ContactsResponse> {
    return this.contactService.getAllContacts(user);
  }

  @Put()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Modificar un contacto de la lista',
  })
  @ApiBody({
    type: UpdateContactDTO,
  })
  @ApiCreatedResponse({
    type: ContactApp,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    type: ValidationException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  updateContact(@Body() payload: UpdateContactDTO, @CurrentUser() user) {
    return this.contactService.updateContact(payload, user);
  }

  @Get('/ContactsByCategory')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: 'Ver lista completa de contactos',
  })
  @ApiCreatedResponse({
    type: ContactsByCategoryResponse,
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
  })
  @ApiUnprocessableEntityResponse({
    type: ValidationException,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorException,
  })
  contactsByCategory(@CurrentUser() user): Promise<ContactsByCategoryResponse> {
    return this.contactService.contactByCategory(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search all my contact' })
  @Get('search')
  async searchContact(@Query('contactName') contactName: string, @CurrentUser() user) {
    const contacts = await this.contactService.searchContact(contactName, user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Search contact',
      data: contacts,
    };
  }

  @Delete()
  @ApiBearerAuth()
  @ApiQuery({ name: 'contactId', type: 'string' })
  @ApiOperation({ summary: 'Only Testing: Delete a contact' })
  @UseGuards(JwtAuthGuard)
  async deleteContact(@Query('contactId') contactId, @CurrentUser() user) {
    return await this.contactService.removeContact(contactId, user);
  }
}
