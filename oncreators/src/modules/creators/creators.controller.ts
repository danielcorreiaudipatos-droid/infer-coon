import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreatorsService } from './creators.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Creators')
@Controller('creators')
export class CreatorsController {
  constructor(private readonly service: CreatorsService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.id, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async follow(@Request() req: any, @Param('id') creatorId: string) {
    return this.service.follow(req.user.id, creatorId);
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
