import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

@Controller('api/auth')
export class GoogleAuthController {
  constructor(private googleAuth: GoogleAuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: { token: string; app: string }) {
    try {
      if (!dto.token || !dto.app) {
        throw new HttpException(
          'Missing token or app parameter',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verify Google token
      const googleData = await this.googleAuth.verifyGoogleToken(dto.token);

      // Authenticate or create user
      const result = await this.googleAuth.authenticateOrCreate(
        googleData,
        dto.app,
      );

      return {
        success: true,
        token: result.token,
        user: result.user,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('validate-token')
  async validateToken(@Body() dto: { token: string }) {
    try {
      if (!dto.token) {
        throw new HttpException(
          'Token is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const googleData = await this.googleAuth.verifyGoogleToken(dto.token);

      return {
        valid: true,
        email: googleData.email,
        name: googleData.name,
      };
    } catch (error) {
      throw new HttpException(
        {
          valid: false,
          error: error.message,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
