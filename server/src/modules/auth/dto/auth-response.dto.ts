export class AuthResponseDto {
  user!: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    avatar: string | null;
    role: string;
    isActive: boolean;
  };

  accessToken!: string;
  refreshToken!: string;
}
