import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsForbiddenWord(
  //property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isForbiddenWord',
      target: object.constructor,
      propertyName: propertyName,
      //constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          //const [relatedPropertyName] = args.constraints;
          //const relatedValue = (args.object as any)[relatedPropertyName];
          const bad = value.match(
            new RegExp('querty|password|admin|test|administrator|123456', 'i'),
          );
          console.log(bad);
          //console.log(bad.length);
          //console.log(bad.length > 0);
          console.log(typeof value === 'string');
          return (
            typeof value === 'string' && (bad === null || bad.length === 0)
          ); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
