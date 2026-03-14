import { Client } from 'pg';

async function checkRanks() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'moon',
    password: '1234',
    database: 'hk-hrams',
  });
  await client.connect();
  try {
    console.log('--- Departments ---');
    const depts = await client.query('SELECT "departmentName", rank FROM department ORDER BY rank;');
    console.table(depts.rows);

    console.log('--- Appraisals ---');
    const appraisals = await client.query('SELECT title, "minGradeRank", "maxGradeRank" FROM appraisal;');
    console.table(appraisals.rows);
  } finally {
    await client.end();
  }
}

checkRanks();
