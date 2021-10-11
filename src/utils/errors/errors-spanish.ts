export const ErrorsSpanish = {
  UserEmailAlreadyExists:
    'El correo electrónico ingresado ya esta en uso. Por favor, ingrese otro correo electrónico y vuelva intentarlo',
  LocaleValueInvalid:
    'Se ha ingresado un valor invalido para el query "locale". Los valores permitidos son "en" y "es"',
  AuthorizationHeaderNotFound:
    'El header "authorization" no esta definido. Por favor, agrega el header "authorization" a la petición y vuelva a intentarlo',
  AuthorizationHeaderBadFormed:
    'El header "authorization" no cuenta con el formato correcto.' +
    ' Por favor, usa el formato "bearer token" para el header "authorization" y vuelva a intentarlo',
  BadJwtToken:
    'El JSON Web Token utilizado no es valido. Por favor, ingrese uno valido y vuelva a intentarlo',
  UserNotFound:
    'El usuario no existe. Por favor, use otro usuario y vuelva a intentarlo',
  UserStateNotOnHold:
    'Este usuario no se encuentra en espera de aprobación o rechazo por lo que no se puede cambiar su estado.' +
    ' Por favor, vuelva a intentarlo con otro usuario',
  UnauthorizedUser: 'Este usuario no tiene permisos para acceder a esta ruta',
  ExpiredToken: 'Su sesión ha caducado. Por favor, vuelva a iniciar sesión',
  BadRequestFindUser: 'La busqueda del usuario ha fallado.',
  BadRequestUpdateContact: 'Debes suministrar userId o contactId',
  BadRequestDeletingAContact: 'Eliminar un contacto ha fallado',
  BadRequestAddingAContact: 'Añadir un contacto ha fallado',
};
