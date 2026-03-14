import { Body, Controller, Delete, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { CompetencyTemplateService } from './competency-template.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('competency-template')
@UseGuards(AuthGuard)
export class CompetencyTemplateController {
  constructor(private readonly templateService: CompetencyTemplateService) {}

  @Post()
  async createTemplate(@Request() req: any, @Body() body: { title: string; description?: string; jobGroup?: string; questions: string[] }) {
    const { sub: userId } = (await req['user']) as { sub: string };
    return this.templateService.createTemplate(userId, body);
  }

  @Get()
  async getTemplates() {
    return this.templateService.getTemplates();
  }

  @Delete(':id')
  async deleteTemplate(@Param('id') id: string) {
    return this.templateService.deleteTemplate(id);
  }
}
