export interface CreateGoalPayload {
  appraisalId: string;
  goals: Goal[];
}

export interface CreateCommonGoalPayload {
  appraisalId: string;
  departmentId: string;
  goals: Goal[];
}

export interface UpdateCommonGoalPayload {
  appraisalId: string;
  departmentId: string;
  oldTitle: string;
  newTitle: string;
  newDescription: string;
}

export interface DeleteCommonGoalPayload {
  appraisalId: string;
  departmentId: string;
  title: string;
}

export interface Goal {
  title: string;
  description: string;
  goalType?: string;
}
