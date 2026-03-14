import { Client } from 'pg';

async function checkColumns() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- Columns in department table ---');
    const cols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'department';
    `);
    console.table(cols.rows);
  } finally {
    await client.end();
  }
}

checkColumns();
