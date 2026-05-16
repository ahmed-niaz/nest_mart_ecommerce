import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import PrismaPkg from '../../generated/prisma/index.js';
declare const PrismaClient: typeof PrismaPkg.PrismaClient;
export declare class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
export {};
