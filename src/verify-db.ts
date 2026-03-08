import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'moon',
    password: '1234',
    database: 'hk-hrams',
    synchronize: false,
    logging: true,
});

async function run() {
    await AppDataSource.initialize();
    const res = await AppDataSource.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'goals';
  `);
    console.log('Columns:', res.map((r: any) => r.column_name));

    const data = await AppDataSource.query(`
    SELECT * FROM goals LIMIT 5;
  `);
    console.log('Goals data:', data);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
