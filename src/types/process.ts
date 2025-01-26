import type { BaseEntity } from './index'

export interface Process extends BaseEntity {
  name: string;
  processCode: string;
  ct: number | null;
  setupTime: number | null;
  isInternal: boolean;
  description: string;
  selectedFactory: number;
  selectedDepartment: number;
  selectedLine: number;
  selectedSubLine: number | null;
}

export interface ProcessFormData {
  name: string;
  processCode: string;
  ct: number | null;
  setupTime: number | null;
  isInternal: boolean;
  description: string;
  selectedFactory: number;
  selectedDepartment: number;
  selectedLine: number;
  selectedSubLine: number | null;
} 