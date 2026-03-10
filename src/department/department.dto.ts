export interface CreateDepartmentPayload {
  departmentName: string;
  parentId?: string; // Changed from parentDepartmentId
  leaderId?: string;
  rank?: number;
}

export interface UpdateDepartmentPayload {
  departmentName?: string;
  parentId?: string; // Changed from parentDepartmentId
  leaderId?: string;
  rank?: number;
}
export interface UpdateManyDepartmentsPayload {
  departmentId: string;
  parentId: string;
}

// Response DTOs for nested structure
export interface DepartmentTreeResponse {
  departmentId: string;
  departmentName: string;
  rank: number;
  parentId?: string; // Changed from parentDepartmentId
  leaderId?: string;
  leader?: {
    userId: string;
    koreanName: string;
    email: string;
  };
  childrenDepartments?: DepartmentTreeResponse[]; // Changed from subDepartments
  created: Date;
  updated: Date;
}

// DTO for moving department to different parent
export interface MoveDepartmentPayload {
  newParentId?: string; // Changed from newParentDepartmentId
}
