export interface CreateHramsUserDepartmentPayload {
  userId: string;
  departmentId: string;
  isLeader?: boolean;
}

export interface UpdateHramsUserDepartmentByIdPayload {
  hramsUserDepartmentId: string;
  isLeader?: boolean;
  userId?: string;
  departmentId?: string;
}

export interface DeleteHramsUserDepartmentPayload {
  userId: string;
  departmentId: string;
}
