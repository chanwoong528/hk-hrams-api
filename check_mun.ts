import { Client } from 'pg';

async function checkMunChanUng() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- Search by Name: 문찬웅 ---');
    const users = await client.query("SELECT * FROM hrams_user WHERE \"koreanName\" = '문찬웅';");
    console.table(users.rows);

    if (users.rows.length > 0) {
      const ids = users.rows.map(u => u.userId);
      console.log('--- Their Department Assignments ---');
      const hud = await client.query(`
        SELECT u."koreanName", d."departmentName", d.rank
        FROM hrams_user_department hud
        JOIN hrams_user u ON hud."userId" = u."userId"
        JOIN department d ON hud."departmentId" = d."departmentId"
        WHERE u."userId" = ANY($1);
      `, [ids]);
      console.table(hud.rows);
    }
  } finally {
    await client.end();
  }
}

checkMunChanUng();
