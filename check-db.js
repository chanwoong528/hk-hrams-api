const { Client } = require('pg');

async function run() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'hrams',
    password: 'password', // or 'postgres'
    port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query(`
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
    console.log(res.rows);
  } catch (err) {
    console.error(
      'Error with password password, trying postgres:',
      err.message,
    );
    const client2 = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'hrams',
      password: 'postgres',
      port: 5432,
    });
    await client2.connect();
    const res = await client2.query(`
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
    console.log(res.rows);
    client2.end();
  } finally {
    client.end();
  }
}

run();
