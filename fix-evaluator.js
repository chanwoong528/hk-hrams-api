const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'moon',
  password: '1234',
  database: 'hk-hrams',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting DB Rescue...');
    await client.query('BEGIN');

    // 1. Get the departmentId for "프론트"
    const deptRes = await client.query(
      `SELECT "departmentId" FROM department WHERE "departmentName" = '프론트' LIMIT 1`,
    );
    if (deptRes.rows.length === 0) throw new Error('Dept not found');
    const deptId = deptRes.rows[0].departmentId;

    // 2. Get the leader's userId for "프론트"
    const leaderRes = await client.query(
      `SELECT "userId" FROM hrams_user_department WHERE "departmentId" = $1 AND "isLeader" = true LIMIT 1`,
      [deptId],
    );
    if (leaderRes.rows.length === 0) throw new Error('Leader not found');
    const trueLeaderId = leaderRes.rows[0].userId;
    console.log('True Leader ID:', trueLeaderId);

    // 3. Find all competency assessments for this department where evaluator is NOT self and NOT the true leader
    const questionsRes = await client.query(
      `SELECT "competencyId" FROM competency_question WHERE "departmentId" = $1`,
      [deptId],
    );
    const questionIds = questionsRes.rows.map((q) => q.competencyId);

    if (questionIds.length > 0) {
      // Find assessments
      const assessmentsRes = await client.query(
        `
        SELECT ca."assessmentId", ca."appraisalUserId", au."userId" as "ownerId"
        FROM competency_assessment ca
        JOIN appraisal_user au ON ca."appraisalUserId" = au."appraisalUserId"
        WHERE ca."competencyId" = ANY($1)
      `,
        [questionIds],
      );

      let updated = 0;
      for (const row of assessmentsRes.rows) {
        // Find existing self evaluator
        const selfEvalRes = await client.query(
          `SELECT "evaluatorId" FROM competency_assessment WHERE "assessmentId" = $1`,
          [row.assessmentId],
        );
        const currentEvaluatorId = selfEvalRes.rows[0].evaluatorId;

        // If the evaluator is neither the owner nor the true leader, it means HR hijacked it
        if (
          currentEvaluatorId !== row.ownerId &&
          currentEvaluatorId !== trueLeaderId
        ) {
          console.log(
            `Fixing assessment ${row.assessmentId}: replacing ${currentEvaluatorId} -> ${trueLeaderId}`,
          );
          await client.query(
            `UPDATE competency_assessment SET "evaluatorId" = $1 WHERE "assessmentId" = $2`,
            [trueLeaderId, row.assessmentId],
          );
          updated++;
        }
      }
      console.log(`Fixed ${updated} mismatched evaluations.`);
    }

    await client.query('COMMIT');
    console.log('Done.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
  } finally {
    client.release();
    pool.end();
  }
}

run();
