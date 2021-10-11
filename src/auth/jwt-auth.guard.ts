import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context) {
    /*const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles && user) {
      return user;
    }

    let havePermission = true;

    if (requiredRoles)
      havePermission = requiredRoles.some((role) => user.roles?.includes(role));

    if (err || !user || !havePermission) {
      throw err || new UnauthorizedException();
    }*/
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
