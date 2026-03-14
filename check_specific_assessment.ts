import { Client } from 'pg';

async function checkSpecificAssessment() {
  const client = new Client({ host: 'localhost', port: 5432, user: 'moon', password: '1234', database: 'hk-hrams' });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT ca.*, u.koreanName as evaluatorName, t.koreanName as targetName
      FROM competency_assessment ca
      JOIN hrams_user u ON ca."evaluatorId" = u."userId"
      JOIN appraisal_user au ON ca."appraisalUserId" = au."appraisalUserId"
      JOIN hrams_user t ON au."userId" = t."userId"
      WHERE u."koreanName" = '이탁희' AND t."koreanName" = '문찬웅';
    `);
    console.log('--- Assessments for 이탁희 (evaluator) -> 문찬웅 (target) ---');
    console.table(res.rows);
  } finally {
    await client.end();
  }
}
checkSpecificAssessment();
