import { LLMProvider } from '../providers/llm-provider';
import { Memory } from './memory';
import { Planning } from './planning';

export class SocialInteraction {
  private relationships: Map<string, number> = new Map(); // Agent ID to relationship score (0-10)
  
  constructor(
    private memory: Memory,
    private planning: Planning,
    private llmProvider: LLMProvider
  ) {}
  
  public async updateRelationship(agentId: string, interactionQuality: number): Promise<void> {
    // Get current relationship score or default to neutral (5)
    const currentScore = this.relationships.get(agentId) || 5;
    
    // Update score based on interaction quality
    // Use a weighted average to prevent wild swings
    const newScore = (currentScore * 0.8) + (interactionQuality * 0.2);
    
    // Ensure score stays within bounds
    const boundedScore = Math.max(0, Math.min(10, newScore));
    
    // Update relationship map
    this.relationships.set(agentId, boundedScore);
  }
  
  public getRelationshipScore(agentId: string): number {
    return this.relationships.get(agentId) || 5;
  }
  
  public getAllRelationships(): Map<string, number> {
    return new Map(this.relationships);
  }
  
  public async evaluateInteraction(agentId: string, interaction: string): Promise<number> {
    // Use LLM to evaluate the quality of an interaction
    return await this.llmProvider.evaluateInteractionQuality(interaction);
  }
} 