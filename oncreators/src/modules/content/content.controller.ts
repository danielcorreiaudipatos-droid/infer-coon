import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get()
  async getAll() {
    return this.service.getAll();
  }
}
