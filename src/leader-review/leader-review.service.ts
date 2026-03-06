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
import { ReviewAnswer } from '../leader-review-answer/review-answer.entity';

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
    @InjectRepository(ReviewAnswer)
    private answerRepo: Repository<ReviewAnswer>,
  ) { }

  // --- Assignment Handling ---

  async getMyAssignments(userId: string) {
    // 1. Find Assignments where reviewer = userId
    const assignments = await this.assignmentRepo.find({
      where: { reviewerId: userId },
      relations: [
        'leaderReview',
        'leaderReview.target',
        'leaderReview.cycle',
        'leaderReview.templates', // Assuming 1 review has 1 template effectively
        'leaderReview.templates.questions'
      ],
      order: { createdAt: 'DESC' }
    });

    return assignments;
  }

  async getAssignmentDetail(assignmentId: string, userId: string) {
    const assignment = await this.assignmentRepo.findOne({
      where: { assignmentId },
      relations: [
        'leaderReview',
        'leaderReview.target',
        'leaderReview.templates',
        'leaderReview.templates.questions'
      ]
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.reviewerId !== userId) throw new NotFoundException('Unauthorized assignment access');

    // Sort questions
    if (assignment.leaderReview?.templates?.[0]?.questions) {
      assignment.leaderReview.templates[0].questions.sort((a, b) => a.order - b.order);
    }

    return assignment;
  }

  async submitAssignment(assignmentId: string, userId: string, answers: { questionId: string; answer: string }[]) {
    const assignment = await this.assignmentRepo.findOne({
      where: { assignmentId },
      relations: ['leaderReview']
    });

    if (!assignment) throw new NotFoundException('Assignment not found');
    if (assignment.reviewerId !== userId) throw new NotFoundException('Unauthorized');
    // Check if already submitted?
    // if (assignment.status === 'SUBMITTED') throw new BadRequestException('Already submitted');

    // 1. Save Answers
    const answerEntities = answers.map(a => this.answerRepo.create({
      questionId: a.questionId,
      answer: a.answer,
      createdBy: userId,
      // Link to assignment or review? 
      // Answers are linked to Question.
      // We might want to link to Assignment too if we want to separate who wrote what easily without filtering by createBy?
      // But Entity 'ReviewAnswer' has createdBy, so we are good.
    }));

    await this.answerRepo.save(answerEntities);

    // 2. Update Assignment Status
    assignment.status = 'SUBMITTED';
    await this.assignmentRepo.save(assignment);

    // 3. Check if all assignments for this review are submitted
    const allAssignments = await this.assignmentRepo.find({
      where: { leaderReviewId: assignment.leaderReviewId }
    });

    const allSubmitted = allAssignments.every(a => a.status === 'SUBMITTED');

    if (allSubmitted && assignment.leaderReview) {
      assignment.leaderReview.status = 'COMPLETED';
      await this.reviewRepo.save(assignment.leaderReview);
    }

    return { message: 'Review submitted successfully' };
  }

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
      } else {
        // Automatically mark as COMPLETED if no eligible reviewers
        savedReview.status = 'COMPLETED';
        await this.reviewRepo.save(savedReview);
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
    const reviews = await this.reviewRepo.find({
      relations: ['target', 'assignments', 'assignments.reviewer'],
      order: { createdAt: 'DESC' }
    });

    // Retroactive check for existing data
    return reviews.map(review => {
      if (review.status === 'IN_PROGRESS') {
        const total = review.assignments?.length || 0;
        const submitted = review.assignments?.filter(a => a.status === 'SUBMITTED').length || 0;
        if (total === submitted) {
          review.status = 'COMPLETED';
        }
      }
      return review;
    });
  }

  // --- Result View (Target Leader) ---

  async getMyResultReviews(userId: string) {
    const reviews = await this.reviewRepo.find({
      where: { userId },
      relations: ['cycle', 'assignments'], // Assignments count needed?
      order: { createdAt: 'DESC' }
    });

    // Retroactive check for existing data
    return reviews.map(review => {
      if (review.status === 'IN_PROGRESS') {
        const total = review.assignments?.length || 0;
        const submitted = review.assignments?.filter(a => a.status === 'SUBMITTED').length || 0;
        if (total === submitted) {
          review.status = 'COMPLETED';
        }
      }
      return review;
    });
  }

  async getReviewResult(leaderReviewId: string, userId: string) {
    const review = await this.reviewRepo.findOne({
      where: { leaderReviewId },
      relations: [
        'templates',
        'templates.questions',
        'templates.questions.answers',
        'cycle',
        'assignments' // Added relation
      ]
    });

    if (!review) throw new NotFoundException('Review not found');

    // Stats
    const totalReviewers = review.assignments?.length || 0;
    const submittedReviewers = review.assignments?.filter(a => a.status === 'SUBMITTED').length || 0;

    // Aggregate
    const template = review.templates?.[0];
    if (!template) return { review, stats: [] };

    const stats = template.questions.map(q => {
      const answers = q.answers || [];
      let stat: any = {
        questionId: q.questionId,
        questionText: q.questionText,
        questionType: q.questionType,
        responseCount: answers.length
      };

      if (q.questionType === 'LIKERT_5') {
        const validScores = answers.map(a => parseInt(a.answer)).filter(n => !isNaN(n));
        const total = validScores.reduce((a, b) => a + b, 0);
        const avg = validScores.length > 0 ? (total / validScores.length).toFixed(1) : 0;

        // Distribution
        const dist = [0, 0, 0, 0, 0]; // 1 to 5
        validScores.forEach(s => {
          if (s >= 1 && s <= 5) dist[s - 1]++;
        });

        stat.average = avg;
        stat.distribution = dist;
      } else {
        // Text
        stat.textAnswers = answers.map(a => a.answer).filter(a => !!a);
        // Shuffle text answers to ensure order doesn't reveal identity if strictly sequential key
        stat.textAnswers.sort(() => Math.random() - 0.5);
      }

      return stat;
    });

    // Sort by original order
    stats.sort((a, b) => {
      const orderA = template.questions.find(q => q.questionId === a.questionId)?.order || 0;
      const orderB = template.questions.find(q => q.questionId === b.questionId)?.order || 0;
      return orderA - orderB;
    });

    return {
      reviewId: review.leaderReviewId,
      title: review.cycle?.title || template.title,
      description: review.cycle?.description || template.description,
      createdAt: review.createdAt,
      totalReviewers,
      submittedReviewers,
      questions: stats
    };
  }
}
