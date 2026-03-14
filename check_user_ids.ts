import { Client } from 'pg';

async function checkUserIds() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- All Users and IDs ---');
    const users = await client.query('SELECT "userId", "koreanName", "email" FROM hrams_user;');
    console.table(users.rows);
  } finally {
    await client.end();
  }
}

checkUserIds();
