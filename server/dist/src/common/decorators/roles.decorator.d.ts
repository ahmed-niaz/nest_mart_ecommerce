import { Role } from '../../../generated/prisma/index.js';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
