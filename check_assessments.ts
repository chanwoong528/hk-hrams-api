import { Client } from 'pg';

async function checkAssessments() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- Target User: 문찬웅 ---');
    const user = await client.query('SELECT "userId", "koreanName" FROM hrams_user WHERE "koreanName" = \'문찬웅\';');
    if (user.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const userId = user.rows[0].userId;
    console.log(`User ID: ${userId}`);

    console.log('--- Their AppraisalUser Records ---');
    const au = await client.query('SELECT "appraisalUserId", "appraisalId" FROM appraisal_user WHERE "userId" = $1;', [userId]);
    console.table(au.rows);

    if (au.rows.length > 0) {
      const auId = au.rows[0].appraisalUserId;
      console.log(`--- Competency Assessments for appraisalUserId: ${auId} ---`);
      const assessments = await client.query(`
        SELECT ca."assessmentId", ca."evaluatorId", u."koreanName" as "evaluatorName", q.question
        FROM competency_assessment ca
        JOIN hrams_user u ON ca."evaluatorId" = u."userId"
        JOIN competency_question q ON ca."competencyId" = q."competencyId"
        WHERE ca."appraisalUserId" = $1;
      `, [auId]);
      console.table(assessments.rows);
    }
  } finally {
    await client.end();
  }
}

checkAssessments();
