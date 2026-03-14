import { Client } from 'pg';

async function checkClosureCols() {
  const client = new Client({ host: 'localhost', port: 5432, user: 'moon', password: '1234', database: 'hk-hrams' });
  await client.connect();
  try {
    const cols = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'department_closure';
    `);
    console.table(cols.rows);
  } finally {
    await client.end();
  }
}
checkClosureCols();
