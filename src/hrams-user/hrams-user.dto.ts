import { HramsUser } from './hrams-user.entity';
import { Department } from 'src/department/department.entity';

export interface CreateHramsUserPayload {
  koreanName: string;
  email: string;
}

export interface HramsUserWithDepartments extends HramsUser {
  departments: Department[];
}
