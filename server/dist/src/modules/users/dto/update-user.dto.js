var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { IsOptional, IsString, Matches } from 'class-validator';
export class UpdateUserDto {
    firstName;
    lastName;
    phone;
    avatar;
    email;
    address;
    city;
    postalCode;
}
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
__decorate([
    IsString(),
    IsOptional(),
    Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number',
    }),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "avatar", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "address", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "city", void 0);
__decorate([
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "postalCode", void 0);
//# sourceMappingURL=update-user.dto.js.map