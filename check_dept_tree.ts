import { Client } from 'pg';

async function checkDeptTree() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- Department Tree Relationships ---');
    const depts = await client.query('SELECT "departmentId", "departmentName", "parentDepartmentId", rank FROM department;');
    console.table(depts.rows);
  } finally {
    await client.end();
  }
}

checkDeptTree();
