import { DataSource } from 'typeorm';
import { AppraisalUser } from './src/appraisal-user/appraisal-user.entity';
import { HramsUser } from './src/hrams-user/hrams-user.entity';
import { HramsUserDepartment } from './src/hrams-user-department/hrams-user-department.entity';
import { Department } from './src/department/department.entity';
import { Appraisal } from './src/appraisal/appraisal.entity';
import { AppraisalBy } from './src/appraisal-by/appraisal-by.entity';
import { Goal } from './src/goal/goal.entity';
import { CompetencyAssessment } from './src/competency-assessment/competency-assessment.entity';
import { CompetencyQuestion } from './src/competency-question/competency-question.entity';

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'moon',
    password: '1234',
    database: 'hk-hrams',
    entities: [AppraisalUser, HramsUser, HramsUserDepartment, Department, Appraisal, AppraisalBy, Goal, CompetencyAssessment, CompetencyQuestion],
});

async function run() {
    await AppDataSource.initialize();

    const appraisalId = 'd1d8c4cc-5579-45ef-b6bd-34b74c31ec41';

    try {
        const queryBuilder = AppDataSource.getRepository(AppraisalUser)
            .createQueryBuilder('appraisalUser')
            .leftJoinAndSelect('appraisalUser.owner', 'owner')
            .leftJoinAndSelect('appraisalUser.appraisal', 'appraisal')
            .leftJoinAndSelect('owner.hramsUserDepartments', 'hramsUserDepartments')
            .leftJoinAndSelect('hramsUserDepartments.department', 'department')
            .leftJoin('appraisalUser.competencyAssessments', 'ca')
            .addSelect('COUNT(ca.assessmentId)', 'competencyTotal')
            .addSelect('COUNT(CASE WHEN ca.grade IS NOT NULL THEN 1 END)', 'competencySubmitted')
            .where('appraisal.appraisalId = :appraisalId', { appraisalId })
            .addGroupBy('appraisalUser.appraisalUserId')
            .addGroupBy('owner.userId')
            .addGroupBy('appraisal.appraisalId')
            .addGroupBy('hramsUserDepartments.id')
            .addGroupBy('department.departmentId');

        const res = await queryBuilder.getRawAndEntities();
        console.log(res);
    } catch (err) {
        console.error("SQL ERROR:", err);
    } finally {
        process.exit(0);
    }
}

run();
