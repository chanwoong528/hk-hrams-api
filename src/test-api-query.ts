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
    const junsikId = '20d3cfee-e07a-4208-929e-e8a0aa041fbb';
    const deptIds = ['b1473cb9-f656-4ec2-9aa8-4920a916319d'];

    const rawData = await AppDataSource.query(`
    SELECT 
        "appraisal"."appraisalId" AS "appraisal_appraisalId", 
        "appraisalUser"."appraisalUserId" AS "appraisalUser_appraisalUserId", 
        "owner"."userId" AS "owner_userId", 
        "owner"."koreanName" AS "owner_koreanName", 
        "goals"."goalId" AS "goals_goalId", 
        "goals"."title" AS "goals_title"
    FROM "public"."appraisal" "appraisal" 
    LEFT JOIN "public"."appraisal_user" "appraisalUser" ON "appraisalUser"."appraisalId"="appraisal"."appraisalId"  
    LEFT JOIN "public"."hrams_user" "owner" ON "owner"."userId"="appraisalUser"."userId"  
    LEFT JOIN "public"."hrams_user_department" "hud" ON "hud"."userId"="owner"."userId"  
    LEFT JOIN "public"."department" "department" ON "department"."departmentId"="hud"."departmentId"  
    LEFT JOIN "public"."goals" "goals" ON "goals"."appraisalUserId"="appraisalUser"."appraisalUserId"  
    LEFT JOIN "public"."goal_assessment_by" "goalAssessmentBy" ON "goalAssessmentBy"."goalId"="goals"."goalId"  
    LEFT JOIN "public"."hrams_user" "gradedByUser" ON "gradedByUser"."userId"="goalAssessmentBy"."gradedBy"  
    LEFT JOIN "public"."appraisal_by" "appraisalBy" ON "appraisalBy"."appraisalId"="appraisalUser"."appraisalUserId"  
    WHERE "appraisal"."status" = 'ongoing' 
    AND "department"."departmentId" IN ($1) 
    AND "owner"."userId" != $2
  `, [deptIds[0], junsikId]);

    console.log('Returned rows:', rawData.length);
    if (rawData.length > 0) {
        console.log('Sample row owner:', rawData[0].owner_koreanName, rawData[0].appraisal_title);
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
