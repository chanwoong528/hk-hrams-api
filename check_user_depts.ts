import { Client } from 'pg';

async function checkUserDepts() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- User Departments ---');
    const hud = await client.query(`
      SELECT u."koreanName", d."departmentName", d.rank, hud."isLeader"
      FROM hrams_user_department hud
      JOIN hrams_user u ON hud."userId" = u."userId"
      JOIN department d ON hud."departmentId" = d."departmentId"
      WHERE u."koreanName" IN ('문찬웅', '오준식');
    `);
    console.table(hud.rows);
  } finally {
    await client.end();
  }
}

checkUserDepts();
