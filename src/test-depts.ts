import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'moon',
    password: '1234',
    database: 'hk-hrams',
    synchronize: false,
});

async function run() {
    await AppDataSource.initialize();

    // 1. Get JunSik's userId
    const users = await AppDataSource.query(`
    SELECT "userId", "email", "koreanName" FROM "hrams_user" WHERE "email" = 'junsik@hankookilbo.com';
  `);
    console.log('Junsik user:', users[0]);
    const junsikId = users[0].userId;

    // 2. Get JunSik's departments (and check if leader)
    const depts = await AppDataSource.query(`
    SELECT hud."departmentId", d."departmentName", hud."isLeader"
    FROM "hrams_user_department" hud
    JOIN "department" d ON hud."departmentId" = d."departmentId"
    WHERE hud."userId" = $1;
  `, [junsikId]);
    console.log('Junsik departments:', depts);

    if (depts.length === 0) {
        console.log('Junsik is not in any department.');
        process.exit(0);
    }

    // 3. Who is in that department?
    const deptId = depts[0].departmentId;
    const members = await AppDataSource.query(`
    SELECT u."userId", u."koreanName", u."email"
    FROM "hrams_user_department" hud
    JOIN "hrams_user" u ON hud."userId" = u."userId"
    WHERE hud."departmentId" = $1;
  `, [deptId]);
    console.log('Department members:', members);

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
