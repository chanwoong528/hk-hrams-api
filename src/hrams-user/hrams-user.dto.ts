import { HramsUser } from './hrams-user.entity';
import { Department } from 'src/department/department.entity';

export interface CreateHramsUserPayload {
  koreanName: string;
  email: string;
  departments?: string[];
  pw?: string;
}

export interface HramsUserWithDepartments extends HramsUser {
  departments: Department[];
}

export interface UpdateHramsUserPayload {
  koreanName?: string;
  email?: string;
  tobeDeletedDepartments?: string[];
  tobeAddedDepartments?: string[];
  userStatus?: string;
  lv?: string;
}
