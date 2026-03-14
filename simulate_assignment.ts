import { Client } from 'pg';

async function simulateEvaluatorAssignment() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    // 1. Get '프론트' department ID
    const frontDept = await client.query("SELECT \"departmentId\" FROM department WHERE \"departmentName\" = '프론트';");
    const frontId = frontDept.rows[0].departmentId;
    console.log(`Target Dept ID (프론트): ${frontId}`);

    // 2. Find ancestors using the closure table manually to see what TYPEORM's findAncestors would do
    // TypeORM uses the closure table for Tree('closure-table')
    const ancestors = await client.query(`
      SELECT d."departmentName", d.rank, d."departmentId"
      FROM department d
      JOIN department_closure ct ON d."departmentId" = ct."departmentId_ancestor"
      WHERE ct."departmentId_descendant" = $1;
    `, [frontId]);
    console.log('--- Ancestors of 프론트 (from closure table) ---');
    console.table(ancestors.rows);

    const deptIds = ancestors.rows.map(a => a.departmentId);

    // 3. Query potential evaluators like the service does
    // appraisal.maxGradeRank is 2.
    const maxRank = 2;
    const potentialEvaluators = await client.query(`
      SELECT u."koreanName", d."departmentName", d.rank, hud."userId"
      FROM hrams_user_department hud
      JOIN department d ON hud."departmentId" = d."departmentId"
      JOIN hrams_user u ON hud."userId" = u."userId"
      WHERE hud."departmentId" = ANY($1)
      AND d.rank >= $2;
    `, [deptIds, maxRank]);
    console.log('--- Potential Evaluators (Rank >= 2) ---');
    console.table(potentialEvaluators.rows);

  } finally {
    await client.end();
  }
}

simulateEvaluatorAssignment();
