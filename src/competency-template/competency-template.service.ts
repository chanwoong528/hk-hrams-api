import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CompetencyTemplate } from './competency-template.entity';
import { CompetencyTemplateQuestion } from './competency-template-question.entity';

@Injectable()
export class CompetencyTemplateService {
  constructor(
    @InjectRepository(CompetencyTemplate)
    private readonly templateRepository: Repository<CompetencyTemplate>,
    @InjectRepository(CompetencyTemplateQuestion)
    private readonly templateQuestionRepository: Repository<CompetencyTemplateQuestion>,
    private readonly dataSource: DataSource,
  ) {}

  async createTemplate(userId: string, data: { title: string; description?: string; jobGroup?: string; questions: string[] }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const template = this.templateRepository.create({
        title: data.title,
        description: data.description,
        jobGroup: data.jobGroup === 'all' ? null : data.jobGroup,
        createdBy: userId,
      });

      const savedTemplate = await queryRunner.manager.save(CompetencyTemplate, template);

      const questionsToSave = data.questions.map((q, index) =>
        this.templateQuestionRepository.create({
          question: q,
          order: index,
          template: savedTemplate,
        }),
      );

      await queryRunner.manager.save(CompetencyTemplateQuestion, questionsToSave);

      await queryRunner.commitTransaction();
      return savedTemplate;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTemplates() {
    return this.templateRepository.find({
      relations: ['questions', 'creator'],
      order: { created: 'DESC' },
    });
  }

  async deleteTemplate(templateId: string) {
    const result = await this.templateRepository.delete(templateId);
    if (result.affected === 0) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }
    return { message: 'Template deleted successfully' };
  }
}
