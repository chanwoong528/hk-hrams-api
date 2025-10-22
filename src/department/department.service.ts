import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, TreeRepository } from 'typeorm';

import { Department } from './department.entity';
import {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from './department.dto';
import { CustomException } from 'src/common/exceptions/custom-exception';

@Injectable()
export class DepartmentService {
  private readonly customException = new CustomException('Department');

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: TreeRepository<Department>,
  ) {}

  async getAllDepartments(): Promise<Department[]> {
    try {
      const trees = await this.departmentRepository.manager
        .getTreeRepository(Department)
        .findTrees({ relations: ['leader'] });

      return trees;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async createDepartment(
    createDepartmentPayload: CreateDepartmentPayload,
  ): Promise<Department> {
    try {
      const treeRepository =
        this.departmentRepository.manager.getTreeRepository(Department);

      if (createDepartmentPayload.parentId) {
        const parentExists = await this.departmentRepository.findOne({
          where: { departmentId: createDepartmentPayload.parentId },
        });
        if (!parentExists) {
          throw new Error('Parent department does not exist');
        }
      }

      const department = this.departmentRepository.create({
        departmentName: createDepartmentPayload.departmentName,
        leaderId: createDepartmentPayload.leaderId,
      });

      // If parent is provided, set the parent relationship
      if (createDepartmentPayload.parentId) {
        const parent = await this.departmentRepository.findOne({
          where: { departmentId: createDepartmentPayload.parentId },
        });
        department.parent = parent;
      }

      return await treeRepository.save(department);
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }

  async updateDepartment(
    id: string,
    updateDepartmentPayload: UpdateDepartmentPayload,
  ): Promise<Department> {
    try {
      const treeRepository =
        this.departmentRepository.manager.getTreeRepository(Department);

      const department = await this.departmentRepository.findOne({
        where: { departmentId: id },
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      // Update basic fields
      if (updateDepartmentPayload.departmentName) {
        department.departmentName = updateDepartmentPayload.departmentName;
      }
      if (updateDepartmentPayload.leaderId) {
        department.leaderId = updateDepartmentPayload.leaderId;
      }

      // Handle parent change if provided
      if (updateDepartmentPayload.parentId) {
        const parent = await this.departmentRepository.findOne({
          where: { departmentId: updateDepartmentPayload.parentId },
        });
        if (!parent) {
          throw new NotFoundException('Parent department does not exist');
        }
        department.parent = parent;
      } else {
        department.parent = null; // Make it a root department
      }

      return await treeRepository.save(department);
    } catch (error: unknown) {
      this.customException.handleException(
        error as QueryFailedError | Error | NotFoundException,
      );
    }
  }

  async getDepartmentById(id: string): Promise<Department> {
    try {
      const treeRepository =
        this.departmentRepository.manager.getTreeRepository(Department);

      const department = await treeRepository.findOne({
        where: { departmentId: id },
        relations: ['leader', 'children'],
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      return department;
    } catch (error: unknown) {
      this.customException.handleException(error as QueryFailedError | Error);
    }
  }
}
