import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  
  const results = await dataSource.query(`
    SELECT 
      au."appraisalUserId",
      au.status,
      owner."koreanName",
      COUNT(DISTINCT cq."questionId") as "cqTotal",
      COUNT(DISTINCT goals."goalId") as "goalTotal"
    FROM appraisal_user au
    INNER JOIN appraisal a ON au."appraisalId" = a."appraisalId"
    INNER JOIN hrams_user owner ON au."userId" = owner."userId"
    LEFT JOIN competency_question cq ON a."appraisalId" = cq."appraisalId"
    LEFT JOIN goal goals ON au."appraisalUserId" = goals."appraisalUserId"
    WHERE owner."koreanName" = '문찬웅' AND a.status = 'ongoing'
    GROUP BY au."appraisalUserId", au.status, owner."koreanName"
  `);
  
  console.log('Results:', results);
  await app.close();
}
bootstrap();
