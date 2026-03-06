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
    const rawData = await AppDataSource.query(`
    SELECT 
        "appraisal"."appraisalId" AS "appraisal_appraisalId", 
        "appraisalUser"."appraisalUserId" AS "appraisalUser_appraisalUserId", 
        "owner"."userId" AS "owner_userId", 
        "owner"."koreanName" AS "owner_koreanName", 
        "goals"."goalId" AS "goals_goalId", 
        "goals"."title" AS "goals_title", 
        "goals"."goalType" AS "goals_goalType", 
        "goals"."description" AS "goals_description", 
        "goals"."created" AS "goals_created", 
        "goals"."updated" AS "goals_updated"
    FROM "public"."appraisal" "appraisal" 
    LEFT JOIN "public"."appraisal_user" "appraisalUser" ON "appraisalUser"."appraisalId"="appraisal"."appraisalId"  
    LEFT JOIN "public"."hrams_user" "owner" ON "owner"."userId"="appraisalUser"."userId"  
    LEFT JOIN "public"."goals" "goals" ON "goals"."appraisalUserId"="appraisalUser"."appraisalUserId"  
    WHERE "owner"."userId" = 'de7c337f-2f0b-4dd3-abac-a6d00970fe06'
  `);

    console.log('Raw Data for Moon Chanwoong:');
    console.log(JSON.stringify(rawData, null, 2));

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
