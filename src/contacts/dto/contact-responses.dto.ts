import { DefaultResponsesDto } from '../../common/dto/default-responses.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ContactApp } from '../../entity/contactsApp.entity';
import { User } from '../../entity/user.entity';

class ContactsInAppData extends User {
  contact: ContactApp;
}
class ContactsByCategoryData {
  //inApp
  forUsers: ContactsInAppData[];
  //favoriteInApp
  forShops: ContactsInAppData[];
  //notInApp: ContactApp[];
}
export class ContactsResponse extends DefaultResponsesDto {
  @ApiProperty()
  @IsNotEmpty()
  data: ContactApp[];
}

export class ContactsByCategoryResponse extends DefaultResponsesDto {
  @ApiProperty()
  @IsNotEmpty()
  data: ContactsByCategoryData;
}
