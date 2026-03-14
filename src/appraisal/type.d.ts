interface RawAppraisalRow {
  appraisal_appraisalId: string;
  appraisal_appraisalType: string;
  appraisal_title: string;
  appraisal_description: string | null;
  appraisal_endDate: Date;
  appraisal_status: string;
  appraisal_created: Date;
  appraisal_updated: Date;
  appraisal_minGradeRank: number | null;
  appraisal_maxGradeRank: number | null;
  department_departmentName: string;
  department_departmentId: string;
  department_rank: number;
  appraisalUser_appraisalUserId: string;
  appraisalUser_status: string | null;
  // Flattened AppraisalBy fields
  appraisalBy_appraisalById: string | null;
  appraisalBy_grade: string | null;
  appraisalBy_comment: string | null;
  appraisalBy_assessType: string | null;
  appraisalBy_assessTerm: string | null;
  appraisalBy_assessedById: string | null;
  finalAssessedBy_userId: string | null;
  finalAssessedBy_koreanName: string | null;
  appraisalBy_updated: Date | null;
  owner_userId: string;
  owner_koreanName: string;
  supervisor_userId: string | null;
  supervisor_koreanName: string | null;
  selfCompetencyTotal: string;
  selfCompetencyCompleted: string;
  myCompetencyTotal: string;
  myCompetencyCompleted: string;
  goals_goalId: string | null;
  goals_title: string | null;
  goals_description: string | null;
  goals_created: Date | null;
  goals_updated: Date | null;
  goalAssessmentBy_goalAssessId: string | null;
  goalAssessmentBy_grade: string | null;
  goalAssessmentBy_comment: string | null;
  goalAssessmentBy_gradedBy: string | null;
  gradedByUser_userId: string | null;
  gradedByUser_koreanName: string | null;
}

interface Goal {
  goalId: string;
  title: string;
  description: string;
  created: string;
  updated: string;
  goalAssessmentBy?: {
    goalAssessId: string;
    grade: string;
    comment: string;
    gradedBy: string;
    gradedByUser?: {
      userId: string;
      koreanName: string;
    };
  }[];
}

interface User {
  userId: string;
  appraisalUserId?: string;
  status?: string;
  selfAssessment?: {
    grade: string;
    comment: string;
    updated?: string;
  };
  assessments: {
    grade: string;
    comment: string;
    assessedById: string;
    assessedByUser?: {
      userId: string;
      koreanName: string;
    };
    updated?: string;
  }[];
  koreanName: string;
  selfCompetencyTotal?: number;
  selfCompetencyCompleted?: number;
  myCompetencyTotal?: number;
  myCompetencyCompleted?: number;
  goals: Goal[];
}

interface Appraisal {
  appraisalId: string;
  appraisalType: string;
  title: string;
  description: string;
  endDate: string;
  status: string;
  minGradeRank?: number;
  maxGradeRank?: number;
  user: User[];
}

interface DepartmentAppraisal {
  departmentName: string;
  departmentId: string;
  appraisal: Appraisal[];
}

// 전체 결과 타입
type FormattedAppraisalResponse = DepartmentAppraisal[];
