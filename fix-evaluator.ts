import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CompetencyQuestionService } from './src/competency-question/competency-question.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    const questionService = app.get(CompetencyQuestionService);

    const appraisal = await dataSource.manager.query(`SELECT "appraisalId" FROM public.appraisal WHERE title = '2026 데모' LIMIT 1`);
    const department = await dataSource.manager.query(`SELECT "departmentId" FROM public.department WHERE "departmentName" = '프론트' LIMIT 1`);

    if (appraisal.length > 0 && department.length > 0) {
        const appraisalId = appraisal[0].appraisalId;
        const departmentId = department[0].departmentId;

        const questions = await dataSource.manager.query(
            `SELECT question, "creatorId" FROM public.competency_question WHERE "appraisalId" = $1 AND "departmentId" = $2`,
            [appraisalId, departmentId]
        );

        if (questions.length > 0) {
            const qTexts = questions.map((q: any) => q.question);
            const creatorId = questions[0].creatorId;

            console.log('Migrating existing questions for 프론트 department:', qTexts);

            await questionService.createQuestionsAndAssignToDepartment(creatorId, {
                appraisalId: appraisalId,
                departmentId: departmentId,
                questions: qTexts
            });
            console.log('Migration complete!');
        }
    }

    await app.close();
}
bootstrap();
