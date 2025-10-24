export interface CreatePerformanceAppraisalByPayload {
  appraisalId: string;

  assessType: string;
  assessTerm: string;
  grade: string;
  comment: string;

  assessedById: string; //whos grading
}
