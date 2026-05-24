import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../database/prisma.service.js';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        firstName: string | null | undefined;
        lastName: string | null | undefined;
        phone: string | null | undefined;
        avatar: string | null | undefined;
        role: import("generated/prisma/index.js").$Enums.Role;
        isActive: true;
    }>;
}
export {};
