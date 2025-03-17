import { AgentProfile, Memory as MemoryType, Plan } from '../types/agent';
import { ConversationHistory } from '../types/conversation';

export interface ResponseGenerationParams {
  profile: AgentProfile;
  conversationHistory: ConversationHistory;
  relevantMemories: MemoryType[];
  currentPlans: Plan[];
}

export interface LLMProvider {
  generateResponse(params: ResponseGenerationParams): Promise<string>;
  evaluateImportance(content: string): Promise<number>;
  extractSemanticKnowledge(conversationHistory: ConversationHistory): Promise<string | null>;
  generatePlanSteps(goal: string): Promise<string[]>;
  evaluatePriority(goal: string): Promise<number>;
  generateReflectionInsights(memories: MemoryType[]): Promise<string[]>;
  evaluateInteractionQuality(interaction: string): Promise<number>;
} 