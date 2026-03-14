import { Client } from 'pg';

async function listAllAssessments() {
  const client = new Client({ host: 'localhost', port: 5432, user: 'moon', password: '1234', database: 'hk-hrams' });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT ca."assessmentId", u."koreanName" as "evaluatorName", t."koreanName" as "targetName"
      FROM competency_assessment ca
      JOIN hrams_user u ON ca."evaluatorId" = u."userId"
      JOIN appraisal_user au ON ca."appraisalUserId" = au."appraisalUserId"
      JOIN hrams_user t ON au."userId" = t."userId"
      WHERE t."koreanName" = '문찬웅';
    `);
    console.log('--- All Assessments for 문찬웅 ---');
    console.table(res.rows);

    console.log('--- User Info: 이탁희 ---');
    const ures = await client.query(`
      SELECT u."userId", u."koreanName", d."departmentName", d.rank
      FROM hrams_user u
      JOIN hrams_user_department hud ON u."userId" = hud."userId"
      JOIN department d ON hud."departmentId" = d."departmentId"
      WHERE u."koreanName" = '이탁희';
    `);
    console.table(ures.rows);
  } finally {
    await client.end();
  }
}
listAllAssessments();
