export const ErrorsEnglish = {
  UserEmailAlreadyExists:
    'This email is already in use by another user. Please enter another email and try again',
  LocaleValueInvalid:
    'You have inserted an invalid value for the query parameter "locale". The valid values are "en" and "es"',
  AuthorizationHeaderNotFound:
    'The "authorization" header is not defined. Please, add an "authorization" header to the request and try again',
  AuthorizationHeaderBadFormed:
    'The "authorization" header does not have the correct format. Please, change the "authorization" header format to "bearer token" and try again',
  BadJwtToken:
    'The JSON Web Token used in the "authorization" headers is not valid. Please, try again with a valid one',
  ExpiredToken: 'Your session has expired. Please, login again',
  UserNotFound:
    'The inserted user does not exists. Please, use another user and try again',
  UnauthorizedUser: 'You do not have permissions to use this route',
  BadRequestFindUser: 'The user search has fail.',
  BadRequestUpdateContact: 'You should provide an userId or ContactId',
  BadRequestDeletingAContact: 'Delete a contact fails',
  BadRequestAddingAContact: 'Save a contact fails',
};
