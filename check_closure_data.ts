import { Client } from 'pg';

async function checkClosureData() {
  const client = new Client({ host: 'localhost', port: 5432, user: 'moon', password: '1234', database: 'hk-hrams' });
  await client.connect();
  try {
    const frontDept = await client.query("SELECT \"departmentId\" FROM department WHERE \"departmentName\" = '프론트';");
    const frontId = frontDept.rows[0].departmentId;

    console.log(`--- Closure rows for DESCENDANT = 프론트 (${frontId}) ---`);
    const res = await client.query(`
      SELECT ct.*, d."departmentName" as ancestorName
      FROM department_closure ct
      JOIN department d ON ct."departmentId_ancestor" = d."departmentId"
      WHERE ct."departmentId_descendant" = $1;
    `, [frontId]);
    console.table(res.rows);
  } finally {
    await client.end();
  }
}
checkClosureData();
