import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtGuard, Public } from '../auth/guards/JwtGuard';
import { UserSchema } from 'src/schemas/User.schema';


@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Public()
  @Post('registration')
  registration(@Body() dto: UserSchema) {
    return this.userService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: UserSchema) {
    return this.userService.login(dto);
  }

  @UseGuards(JwtGuard)
  @Get('logout')
  logout(@Res() res) {
    return this.userService.logout(res);
  }

  @UseGuards(JwtGuard)
  @Get('getProfile')
  getProfile(@Req() req) {
    return this.userService.getProfile(req.user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
