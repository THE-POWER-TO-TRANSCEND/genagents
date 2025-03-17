import { LLMProvider } from '../providers/llm-provider';
import { Memory } from './memory';
import { Plan } from '../types/agent';
import { v4 as uuidv4 } from 'uuid';

export class Planning {
  private plans: Plan[] = [];
  
  constructor(
    private memory: Memory,
    private llmProvider: LLMProvider
  ) {}
  
  public async createPlan(goal: string): Promise<Plan> {
    // Use LLM to generate steps for the goal
    const steps = await this.llmProvider.generatePlanSteps(goal);
    
    const plan: Plan = {
      id: uuidv4(),
      goal,
      steps,
      status: 'active',
      priority: await this.calculatePriority(goal),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.plans.push(plan);
    return plan;
  }
  
  public getCurrentPlans(): Plan[] {
    return this.plans.filter(plan => plan.status === 'active')
      .sort((a, b) => b.priority - a.priority);
  }
  
  public async updatePlanStatus(planId: string, status: 'active' | 'completed' | 'abandoned'): Promise<void> {
    const plan = this.plans.find(p => p.id === planId);
    
    if (plan) {
      plan.status = status;
      plan.updatedAt = Date.now();
    }
  }
  
  private async calculatePriority(goal: string): Promise<number> {
    // Use LLM to determine priority on a scale of 0-10
    return await this.llmProvider.evaluatePriority(goal);
  }
  
  public async reprioritizePlans(): Promise<void> {
    // Reprioritize all active plans based on current context
    const activePlans = this.getCurrentPlans();
    
    for (const plan of activePlans) {
      plan.priority = await this.calculatePriority(plan.goal);
      plan.updatedAt = Date.now();
    }
  }
} 