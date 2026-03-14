import { Client } from 'pg';

async function checkEntireHierarchy() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- All Members in Innovation Hierarchy ---');
    const hud = await client.query(`
      SELECT d."departmentName", d.rank, u."koreanName", hud."isLeader"
      FROM department d
      LEFT JOIN hrams_user_department hud ON d."departmentId" = hud."departmentId"
      LEFT JOIN hrams_user u ON hud."userId" = u."userId"
      WHERE d."departmentName" IN ('혁신실', '플랫폼', '프론트')
      ORDER BY d.rank, hud."isLeader" DESC;
    `);
    console.table(hud.rows);
  } finally {
    await client.end();
  }
}

checkEntireHierarchy();
