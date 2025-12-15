import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderReviewTemplate } from '../leader-review-template/leader-review-template.entity';
import { LeaderReviewCycle } from '../leader-review-cycle/leader-review-cycle.entity';
import { LeaderReviewQuestion } from '../leader-review-question/leader-review-question.entity';
import { LeaderReview } from '../leader-review/leader-review.entity';
import { ReviewAssignment } from '../leader-review-assignment/review-assignment.entity';
import { HramsUser } from '../hrams-user/hrams-user.entity';
import { In, Not, IsNull } from 'typeorm';
import { HramsUserService } from '../hrams-user/hrams-user.service';

@Injectable()
export class LeaderReviewService {
  constructor(
    @InjectRepository(LeaderReviewTemplate)
    private templateRepo: Repository<LeaderReviewTemplate>,
    @InjectRepository(LeaderReviewQuestion)
    private questionRepo: Repository<LeaderReviewQuestion>,
    @InjectRepository(LeaderReview)
    private reviewRepo: Repository<LeaderReview>,
    @InjectRepository(ReviewAssignment)
    private assignmentRepo: Repository<ReviewAssignment>,
    @InjectRepository(HramsUser)
    private userRepo: Repository<HramsUser>, // Inject User Repository
    private hrUserService: HramsUserService, // Inject User Service
    @InjectRepository(LeaderReviewCycle)
    private cycleRepo: Repository<LeaderReviewCycle>,
  ) {}

  // --- Template Management ---

  async createGlobalTemplate(data: { title: string; description: string; questions: any[] }) {
    const template = this.templateRepo.create({
      title: data.title,
      description: data.description,
      leaderReview: null, // Global
      isActive: true,
      questions: data.questions?.map((q, index) => ({
        questionId: q.questionId || crypto.randomUUID(),
        questionText: q.questionText,
        questionType: q.questionType || 'LIKERT_5',
        order: q.order ?? index,
      }))
    });
    return this.templateRepo.save(template);
  }

  async updateTemplate(templateId: string, data: { title?: string; description?: string; questions?: any[] }) {
    const template = await this.templateRepo.findOne({
      where: { templateId },
      relations: ['questions'],
    });
    if (!template) throw new NotFoundException('Template not found');

    if (data.title) template.title = data.title;
    if (data.description) template.description = data.description;

    // Full replacement of questions for simplicity in MVP
    if (data.questions) {
      // Delete existing questions? 
      // TypeORM cascade update is tricky with full replacement.
      // Easiest strategies: 
      // 1. Remove all old questions, insert new. 
      // 2. Diff and update.
      // For now, simpler: delete old, save new.
      await this.questionRepo.delete({ templateId }); 
      
      template.questions = data.questions.map((q, index) => ({
        questionId: q.questionId || crypto.randomUUID(),
        questionText: q.questionText,
        questionType: q.questionType || 'LIKERT_5',
        order: q.order ?? index,
        template: template // Link back
      })) as LeaderReviewQuestion[]; 
      // Note: mapping might need strict entity creation if passing to repo.save(template)
    }

    return this.templateRepo.save(template);
  }

  async getTemplate(templateId: string) {
    return this.templateRepo.findOne({
      where: { templateId },
      relations: ['questions'],
      order: {
        questions: { order: 'ASC' }
      }
    });
  }

  async getAllGlobalTemplates() {
    return this.templateRepo.find({
      where: { leaderReviewId: IsNull() }, // Global templates only
      order: { created: 'DESC' },
      relations: ['questions'] // Optional: might be heavy if lists are long
    });
  }

  // --- Review Management ---

  async startBatchLeaderReview(data: {
    templateId: string;
    reviewTitle: string; // New: Batch Title
    reviewDescription?: string; // New: Batch Description
    excludedUserIds?: string[];
    deadline?: Date;
  }) {
    // 1. Fetch All Eligible Leaders (using Department structure)
    // We delegate this to HramsUserService which checks HramsUserDepartment.isLeader
    const leaders = await this.hrUserService.getAllLeaders();

    const excludedSet = new Set(data.excludedUserIds || []);
    const targetLeaders = leaders.filter(u => !excludedSet.has(u.userId));

    if (targetLeaders.length === 0) {
      return { message: 'No eligible leaders found to review.' };
    }

    // 2. Load Source Template
    const sourceTemplate = await this.getTemplate(data.templateId);
    if (!sourceTemplate) throw new NotFoundException('Template not found');

    const createdReviews = [];

    // 3. Create Review Cycle (Batch)
    const cycle = this.cycleRepo.create({
      title: data.reviewTitle,
      description: data.reviewDescription,
      deadline: data.deadline,
      isActive: true,
    });
    const savedCycle = await this.cycleRepo.save(cycle);

    // 4. Loop and Create Reviews
    // Transactional implementation would be better for batch, but doing loop for MVP simplicity
    for (const leader of targetLeaders) {
       // Create Review
       const review = this.reviewRepo.create({
         userId: leader.userId,
         status: 'IN_PROGRESS',
         cycle: savedCycle,
         // deadline: data.deadline
       });
       const savedReview = await this.reviewRepo.save(review);

       // Clone Template
       const clonedTemplate = this.templateRepo.create({
         title: sourceTemplate.title,
         description: sourceTemplate.description,
         leaderReview: savedReview,
         isActive: true,
         questions: sourceTemplate.questions.map(q => ({
            questionId: crypto.randomUUID(),
            questionText: q.questionText,
            questionType: q.questionType,
            order: q.order
          }))
       });
       await this.templateRepo.save(clonedTemplate);
       
       createdReviews.push(savedReview);

       // Create Review Assignments for Team Members
       const teamMembers = await this.hrUserService.getTeamMembersOfLeader(leader.userId);
       
       if (teamMembers.length > 0) {
           const assignments = teamMembers.map(member => 
                this.assignmentRepo.create({
                    leaderReview: savedReview,
                    reviewer: member,
                    status: 'NOT_STARTED'
                })
           );
           await this.assignmentRepo.save(assignments);
       }
    }
    
    return { 
        message: `Successfully started ${createdReviews.length} reviews.`,
        param: {
            totalLeaders: leaders.length,
            excluded: excludedSet.size,
            started: createdReviews.length
        }
    };
  }

  async getAllReviews() {
    return this.reviewRepo.find({
      relations: ['target', 'assignments', 'assignments.reviewer'],
      order: { createdAt: 'DESC' }
    });
  }
}
