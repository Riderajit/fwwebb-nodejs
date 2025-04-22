import { Controller, Get, Req } from '@nestjs/common';
import { AzureTokenValidationMiddleware } from '../../middleware/token-validation.middleware';

@Controller('users')
export class UsersController {
  @Get('profile')
  getProfile(@Req() req: any) {
    const user = req.user;
    console.log("User:", user);

    return {
      name : user.name,
      email: user.preferred_username
    }
  }
}
