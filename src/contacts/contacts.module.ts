import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactApp } from '../entity/contactsApp.entity';
import { Invitation } from './../entity/invitation.entity';
import { UsersModule } from './../users/users.module';
//import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContactApp, Invitation]),
    forwardRef(() => UsersModule),
  ],
  providers: [ContactsService],
  //controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
