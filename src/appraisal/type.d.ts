interface FormattedAppraisal {
  appraisalId: string;
  appraisalType: string;
  title: string;
  description: string | null;
  endDate: Date;
  status: string;
  // created: Date;
  // updated: Date;
  departmentName: string;
  users: FormattedAppraisalUser[];
}
interface FormattedAppraisalUser {
  appraisalUserId: string;
  status: string | null;
  userId: string;
  koreanName: string;
  goals: {
    goalId: string;
    title: string;
    description: string;
    created: Date;
    updated: Date;
  }[];
}
interface FormattedAppraisal {
  appraisalId: string;
  appraisalType: string;
  title: string;
  description: string | null;
  endDate: Date;
  status: string;
  // created: Date;
  // updated: Date;
  departmentName: string;
  users: FormattedAppraisalUser[];
}
interface RawAppraisalRow {
  appraisal_appraisalId: string;
  appraisal_appraisalType: string;
  appraisal_title: string;
  appraisal_description: string | null;
  appraisal_endDate: Date;
  appraisal_status: string;
  appraisal_created: Date;
  appraisal_updated: Date;
  department_departmentName: string;
  appraisalUser_appraisalUserId: string;
  appraisalUser_status: string | null;
  owner_userId: string;
  owner_koreanName: string;
  goals_goalId: string | null;
  goals_title: string | null;
  goals_description: string | null;
  goals_created: Date | null;
  goals_updated: Date | null;
}
