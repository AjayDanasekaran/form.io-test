import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormAssignment, FormAssignmentDocument } from './schemas/form-assignment.schema';
import { CreateFormAssignmentDto } from './dto/create-form-assignment.dto';

@Injectable()
export class FormAssignmentService {
  constructor(
    @InjectModel(FormAssignment.name) private formAssignmentModel: Model<FormAssignmentDocument>,
  ) {}

  async create(createFormAssignmentDto: CreateFormAssignmentDto): Promise<FormAssignment> {
    const createdAssignment = new this.formAssignmentModel(createFormAssignmentDto);
    return createdAssignment.save();
  }

  async findAll(){
    return this.formAssignmentModel.find().exec();
  }

  async findFormAssignments(
    context: string,
    serviceId?: string,
    centerId?: string
  ): Promise<FormAssignment[]> {
  
    const query: any = { context };
  
    // If both serviceId and centerId are undefined/null, just return all assignments for the context
    if (!serviceId && !centerId) {
      return this.formAssignmentModel.find(query).exec();
    }
  
    const orConditions = [];
  
    // 1. Exact match (service + center)
    if (serviceId && centerId) {
      orConditions.push({ serviceId, centerId });
    }
  
    // 2. Service match only
    if (serviceId) {
      orConditions.push({ serviceId, centerId: null });
    }
  
    // 3. Center match only
    if (centerId) {
      orConditions.push({ serviceId: null, centerId });
    }
  
    // 4. Global default (no serviceId, no centerId)
    orConditions.push({ serviceId: null, centerId: null });
  
    query.$or = orConditions;
  
    return this.formAssignmentModel.find(query).exec();
  }
  

  async getFormAssignments(context: string, serviceId?: string, centerId?: string): Promise<FormAssignment[]> {
    const assignments = await this.findFormAssignments(context, serviceId, centerId);
    
    // Sort by priority: exact match > service match > center match > global
    return assignments.sort((a, b) => {
      const aScore = this.getAssignmentScore(a, serviceId, centerId);
      const bScore = this.getAssignmentScore(b, serviceId, centerId);
      return bScore - aScore;
    });
  }

  private getAssignmentScore(assignment: FormAssignment, serviceId?: string, centerId?: string): number {
    let score = 0;
    
    // Exact match gets highest score
    if (assignment.serviceId === serviceId && assignment.centerId === centerId) {
      score += 100;
    }
    // Service match
    else if (assignment.serviceId === serviceId && assignment.centerId === null) {
      score += 50;
    }
    // Center match
    else if (assignment.serviceId === null && assignment.centerId === centerId) {
      score += 25;
    }
    // Global default
    else if (assignment.serviceId === null && assignment.centerId === null) {
      score += 0;
    }

    return score;
  }
} 