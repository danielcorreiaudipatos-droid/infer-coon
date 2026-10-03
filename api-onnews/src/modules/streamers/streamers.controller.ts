import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreamersService } from './streamers.service';

@ApiTags('Streamers')
@Controller('streamers')
export class StreamersController {
  constructor(private streamersService: StreamersService) {}

  @Get(':id')
  async getStreamer(@Param('id') id: string) {
    return this.streamersService.getStreamer(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/follow')
  async followStreamer(@Request() req, @Param('id') streamerId: string) {
    return this.streamersService.followStreamer(req.user.userId, streamerId);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') streamerId: string) {
    return this.streamersService.getFollowers(streamerId);
  }
}
