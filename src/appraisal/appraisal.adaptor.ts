export function formatAppraisalNested(
  rawData: RawAppraisalRow[],
): FormattedAppraisalResponse {
  const departmentsMap = rawData.reduce(
    (acc, row) => {
      const deptName = row.department_departmentName;
      const deptId = row.department_departmentId;
      // 🏢 department grouping
      if (!acc[deptName]) {
        acc[deptName] = {
          departmentName: deptName,
          departmentId: deptId,
          appraisal: [],
        };
      }

      const department = acc[deptName];

      // 🧾 appraisal grouping
      let appraisalObj = department.appraisal.find(
        (a) => a.appraisalId === row.appraisal_appraisalId,
      );
      if (!appraisalObj) {
        appraisalObj = {
          appraisalId: row.appraisal_appraisalId,
          appraisalType: row.appraisal_appraisalType,
          title: row.appraisal_title,
          description: row.appraisal_description || '',
          endDate: row.appraisal_endDate.toISOString(),
          status: row.appraisal_status,
          user: [],
        };
        department.appraisal.push(appraisalObj);
      }

      // 2. Find or create User
      let userObj = appraisalObj.user.find(
        (u) => u.appraisalUserId === row.appraisalUser_appraisalUserId,
      );

      if (!userObj) {
        userObj = {
          userId: row.owner_userId,
          appraisalUserId: row.appraisalUser_appraisalUserId,
          status: row.appraisalUser_status,
          selfAssessment: undefined, // Initialize
          assessments: [], // Initialize
          koreanName: row.owner_koreanName,
          selfCompetencyTotal: parseInt(row.selfCompetencyTotal || '0', 10),
          selfCompetencyCompleted: parseInt(row.selfCompetencyCompleted || '0', 10),
          myCompetencyTotal: parseInt(row.myCompetencyTotal || '0', 10),
          myCompetencyCompleted: parseInt(row.myCompetencyCompleted || '0', 10),
          goals: [],
        };
        appraisalObj.user.push(userObj);
      }

      // Map Self Assessment if present in this row (and matches owner)
      if (
        row.appraisalBy_appraisalById
      ) {
        // Add to general assessments list
        const exists = userObj.assessments.find(a => a.assessedById === row.appraisalBy_assessedById);
        if (!exists && row.appraisalBy_assessedById) {
          userObj.assessments.push({
            grade: row.appraisalBy_grade || '',
            comment: row.appraisalBy_comment || '',
            assessedById: row.appraisalBy_assessedById,
            updated: row.appraisalBy_updated ? row.appraisalBy_updated.toISOString() : undefined
          });
        }

        // Add to explicit selfAssessment field if it's the owner
        if (row.appraisalBy_assessedById === row.owner_userId) {
          userObj.selfAssessment = {
            grade: row.appraisalBy_grade,
            comment: row.appraisalBy_comment,
            updated: row.appraisalBy_updated ? row.appraisalBy_updated.toISOString() : undefined
          };
        }
      }

      // 3. Find or create Goal
      if (
        row.goals_goalId &&
        row.goals_title &&
        row.goals_description &&
        row.goals_created &&
        row.goals_updated &&
        userObj
      ) {
        const goalExists = userObj.goals.find(
          (g) => g.goalId === row.goals_goalId,
        );

        let goalObj = goalExists;
        if (!goalObj) {
          goalObj = {
            goalId: row.goals_goalId,
            title: row.goals_title,
            description: row.goals_description,
            created: row.goals_created.toISOString(),
            updated: row.goals_updated.toISOString(),
            goalAssessmentBy: [],
          };
          userObj.goals.push(goalObj);
        }

        // 📝 Goal Assessment grouping
        if (row.goalAssessmentBy_goalAssessId) {
          if (!goalObj.goalAssessmentBy) {
            goalObj.goalAssessmentBy = [];
          }

          const assessmentExists = goalObj.goalAssessmentBy.find(
            (a) => a.goalAssessId === row.goalAssessmentBy_goalAssessId
          );

          if (!assessmentExists) {
            goalObj.goalAssessmentBy.push({
              goalAssessId: row.goalAssessmentBy_goalAssessId,
              grade: row.goalAssessmentBy_grade,
              comment: row.goalAssessmentBy_comment,
              gradedBy: row.goalAssessmentBy_gradedBy,
              gradedByUser: row.gradedByUser_userId ? {
                userId: row.gradedByUser_userId,
                koreanName: row.gradedByUser_koreanName
              } : undefined,
            });
          }
        }
      }

      return acc;
    },
    {} as Record<string, DepartmentAppraisal>,
  );

  return Object.values(departmentsMap);
}
