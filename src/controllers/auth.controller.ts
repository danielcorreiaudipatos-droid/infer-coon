import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { GoogleAuthService } from '../auth/google-auth.service';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private googleAuth: GoogleAuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: { token: string; app: string }) {
    const googleData = await this.googleAuth.verifyGoogleToken(dto.token);
    return this.googleAuth.authenticateOrCreate(googleData, dto.app);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req) {
    return this.googleAuth.getUserById(req.user.id);
  }
}
