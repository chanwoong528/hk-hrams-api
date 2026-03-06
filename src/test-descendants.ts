import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'moon',
    password: '1234',
    database: 'hk-hrams',
    synchronize: false,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});

async function run() {
    await AppDataSource.initialize();
    const repo = AppDataSource.manager.getTreeRepository('Department');

    const dept = await repo.findOne({ where: { departmentId: 'b1473cb9-f656-4ec2-9aa8-4920a916319d' } });
    console.log('Dept found:', dept);

    if (dept) {
        const descendants = await repo.findDescendants(dept);
        console.log('Descendants:', descendants.map((d: any) => d.departmentId));
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
