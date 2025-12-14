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

      // 👤 user grouping
      let userObj = appraisalObj.user.find(
        (u) => u.userId === row.owner_userId,
      );
      if (!userObj && row.owner_userId) {
        userObj = {
          userId: row.owner_userId,
          koreanName: row.owner_koreanName,
          goals: [],
        };
        appraisalObj.user.push(userObj);
      }

      // 🎯 goal grouping
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
