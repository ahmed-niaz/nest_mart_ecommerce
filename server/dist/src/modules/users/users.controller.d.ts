import { UsersService } from './users.service.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(userId: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    updateMyProfile(userId: string, dto: UpdateUserDto): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    findAll(): Promise<({
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null)[]>;
    updateRole(userId: string, role: string): Promise<{
        id: any;
        email: any;
        firstName: any;
        lastName: any;
        phone: any;
        avatar: any;
        role: any;
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
}
