import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const res = await dataSource.manager.query(`
      select u."koreanName", d."departmentName", au."appraisalUserId",
             count(ca."assessmentId") as "caCount",
             count(CASE WHEN ca.grade IS NOT NULL THEN 1 END) as "completedCount"
      from appraisal_user au
      join hrams_user u on u."userId" = au."userId"
      left join hrams_user_department hud on hud."userId" = u."userId"
      left join department d on d."departmentId" = hud."departmentId"
      left join competency_assessment ca on ca."appraisalUserId" = au."appraisalUserId"
      where u."koreanName" = '문찬웅'
      group by 1, 2, 3
    `);
  console.log(res);

  await app.close();
}
bootstrap();
