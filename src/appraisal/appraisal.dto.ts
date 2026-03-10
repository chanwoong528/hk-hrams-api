export interface CreateAppraisalPayload {
  title: string;
  appraisalType: string;
  description: string;
  endDate: Date;
  minGradeRank?: number;
  maxGradeRank?: number;
  // exceptionUserList?: string[]; // users that are not part of the appraisal and not being assessed
}

export interface UpdateAppraisalPayload {
  title?: string;
  appraisalType?: string;
  description?: string;
  endDate?: Date;
  status?: string;
  minGradeRank?: number;
  maxGradeRank?: number;
}
