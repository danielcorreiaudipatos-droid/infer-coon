import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  async create(@Body() data: any) {
    return { message: 'Creator creation endpoint ready', data };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.service.getStats(id);
  }
}
