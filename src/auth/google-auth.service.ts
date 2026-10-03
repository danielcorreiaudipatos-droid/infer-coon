import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import { OAuth2Client } from 'google-auth-library';

interface GooglePayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  email_verified?: boolean;
}

@Injectable()
export class GoogleAuthService {
  private googleClient: OAuth2Client;

  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async verifyGoogleToken(token: string): Promise<GooglePayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        sub: payload.sub,
        email: payload.email || '',
        name: payload.name || '',
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
    } catch (error) {
      throw new Error(`Google token verification failed: ${error.message}`);
    }
  }

  async authenticateOrCreate(googleData: GooglePayload, app: string) {
    try {
      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email: googleData.email },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: googleData.email,
            name: googleData.name,
            picture: googleData.picture || null,
            googleId: googleData.sub,
            authMethod: 'google',
            apps: [app],
            emailVerified: googleData.email_verified || false,
            createdAt: new Date(),
          },
        });

        // Record consent
        await this.prisma.userConsent.create({
          data: {
            userId: user.id,
            consentType: 'terms',
            status: 'accepted',
            acceptedAt: new Date(),
            ipAddress: 'google_oauth',
            userAgent: 'google_auth',
            version: '1.0',
          },
        });
      } else {
        // Update existing user
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleData.sub,
            authMethod: 'google',
            apps: Array.from(new Set([...(user.apps || []), app])),
            lastLoginAt: new Date(),
          },
        });
      }

      // Generate JWT
      const jwtToken = this.jwt.sign({
        id: user.id,
        email: user.email,
        app: app,
      });

      return {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          apps: user.apps,
        },
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }
}
