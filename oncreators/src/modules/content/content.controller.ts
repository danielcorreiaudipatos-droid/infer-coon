import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.id, data);
  }

  @Post(':id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async trackAccess(@Request() req: any, @Param('id') contentId: string) {
    return this.service.trackAccess(req.user.id, contentId);
  }

  @Get(':id/access')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async checkAccess(@Request() req: any, @Param('id') contentId: string) {
    return this.service.hasAccess(req.user.id, contentId);
  }
}
