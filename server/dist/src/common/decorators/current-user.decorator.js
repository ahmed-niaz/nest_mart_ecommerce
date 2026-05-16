import { createParamDecorator } from '@nestjs/common';
export const CurrentUser = createParamDecorator((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (data) {
        return user?.[data];
    }
    return user;
});
//# sourceMappingURL=current-user.decorator.js.map