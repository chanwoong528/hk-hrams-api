export interface CreateGoalPayload {
  appraisalId: string;
  goals: Goal[];
}

export interface CreateCommonGoalPayload {
  appraisalId: string;
  departmentId: string;
  goals: Goal[];
}

export interface Goal {
  title: string;
  description: string;
}
