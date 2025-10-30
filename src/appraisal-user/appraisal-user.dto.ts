export interface CreateAppraisalUserPayload {
  appraisalId: string;
  exceptionUserList?: string[]; // users that are not part of the appraisal and not being assessed
}
