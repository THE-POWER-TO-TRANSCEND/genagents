import { LLMProvider, ResponseGenerationParams } from './llm-provider';
import { ConversationHistory } from '../types/conversation';
import { Memory, Plan } from '../types/agent';
import Anthropic from '@anthropic-ai/sdk';

export interface ClaudeConfig {
  apiKey?: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export class ClaudeLLMProvider implements LLMProvider {
  private client: Anthropic;
  private config: ClaudeConfig;
  
  constructor(config: ClaudeConfig) {
    // Get API key from environment if not provided in config
    const apiKey = config.apiKey || process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    this.config = {
      model: 'claude-3-5-sonnet-20240620',
      maxTokens: 1024,
      temperature: 0.7,
      ...config
    };
    
    if (!apiKey) {
      throw new Error('Claude API key is required. Set CLAUDE_API_KEY or ANTHROPIC_API_KEY in your environment.');
    }
    
    console.log("Creating Claude provider with API key:", apiKey.substring(0, 10) + "...");
    
    this.client = new Anthropic({
      apiKey: apiKey
    });
    
    console.log(`Initialized Claude provider with model: ${this.config.model}`);
  }
  
  async generateResponse(params: ResponseGenerationParams): Promise<string> {
    console.log("Claude provider: generateResponse called");
    const { profile, conversationHistory, relevantMemories, currentPlans } = params;
    
    // Format conversation history for Claude
    const formattedConversation = this.formatConversationHistory(conversationHistory);
    
    // Format relevant memories
    const formattedMemories = this.formatMemories(relevantMemories);
    
    // Format current plans
    const formattedPlans = this.formatPlans(currentPlans);
    
    // Create system prompt
    const systemPrompt = this.createAgentSystemPrompt(profile, formattedMemories, formattedPlans);
    
    console.log("Generating response with Claude...");
    
    // Call Claude API
    const response = await this.callClaudeAPI(systemPrompt, formattedConversation);
    console.log("Claude response received:", response.substring(0, 50) + "...");
    
    return response;
  }
  
  async evaluateImportance(content: string): Promise<number> {
    const systemPrompt = `
      You are an AI assistant helping to evaluate the importance of a piece of information.
      On a scale of 1-10, where 1 is completely trivial and 10 is extremely important, 
      rate the following information. Return only a number between 1 and 10.
    `;
    
    const response = await this.callClaudeAPI(systemPrompt, content);
    
    // Parse the response to get a number
    const importance = parseInt(response.trim());
    
    // Ensure the result is a valid number between 1-10
    if (isNaN(importance) || importance < 1 || importance > 10) {
      // Default to medium importance if parsing fails
      return 5;
    }
    
    return importance;
  }
  
  async extractSemanticKnowledge(conversationHistory: ConversationHistory): Promise<string | null> {
    if (conversationHistory.length === 0) {
      return null;
    }
    
    const systemPrompt = `
      You are an AI assistant helping to extract semantic knowledge from a conversation.
      Analyze the conversation and identify any important facts, beliefs, or knowledge that should be remembered.
      If there is no significant semantic knowledge to extract, respond with "None".
      Otherwise, provide a concise statement of the knowledge in third person.
    `;
    
    const formattedConversation = this.formatConversationHistory(conversationHistory);
    const response = await this.callClaudeAPI(systemPrompt, formattedConversation);
    
    if (response.trim().toLowerCase() === 'none') {
      return null;
    }
    
    return response;
  }
  
  async generatePlanSteps(goal: string): Promise<string[]> {
    const systemPrompt = `
      You are an AI assistant helping to break down a goal into actionable steps.
      For the following goal, provide 3-5 concrete steps to achieve it.
      Return only the steps as a numbered list, with no additional text.
    `;
    
    const response = await this.callClaudeAPI(systemPrompt, goal);
    
    // Parse the response into individual steps
    const steps = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line)) // Only keep lines that start with a number and period
      .map(line => line.replace(/^\d+\.\s*/, '')); // Remove the numbering
    
    return steps.length > 0 ? steps : [`Work towards: ${goal}`];
  }
  
  async evaluatePriority(goal: string): Promise<number> {
    const systemPrompt = `
      You are an AI assistant helping to evaluate the priority of a goal.
      On a scale of 1-10, where 1 is lowest priority and 10 is highest priority, 
      rate the following goal. Return only a number between 1 and 10.
    `;
    
    const response = await this.callClaudeAPI(systemPrompt, goal);
    
    // Parse the response to get a number
    const priority = parseInt(response.trim());
    
    // Ensure the result is a valid number between 1-10
    if (isNaN(priority) || priority < 1 || priority > 10) {
      // Default to medium priority if parsing fails
      return 5;
    }
    
    return priority;
  }
  
  async generateReflectionInsights(memories: Memory[]): Promise<string[]> {
    if (memories.length === 0) {
      return [];
    }
    
    const formattedMemories = memories
      .map(memory => `- ${memory.content} (${new Date(memory.timestamp).toLocaleString()})`)
      .join('\n');
    
    const systemPrompt = `
      You are an AI assistant helping to generate insights from a set of memories.
      Analyze the following memories and identify 2-3 meaningful insights or patterns.
      Return each insight as a separate paragraph.
    `;
    
    const response = await this.callClaudeAPI(systemPrompt, formattedMemories);
    
    // Split the response into separate insights
    const insights = response
      .split('\n\n')
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
    
    return insights;
  }
  
  async evaluateInteractionQuality(interaction: string): Promise<number> {
    const systemPrompt = `
      You are an AI assistant helping to evaluate the quality of a social interaction.
      On a scale of 1-10, where 1 is very negative and 10 is very positive, 
      rate the following interaction. Return only a number between 1 and 10.
    `;
    
    const response = await this.callClaudeAPI(systemPrompt, interaction);
    
    // Parse the response to get a number
    const quality = parseInt(response.trim());
    
    // Ensure the result is a valid number between 1-10
    if (isNaN(quality) || quality < 1 || quality > 10) {
      // Default to neutral if parsing fails
      return 5;
    }
    
    return quality;
  }
  
  private formatConversationHistory(conversationHistory: ConversationHistory): string {
    if (conversationHistory.length === 0) {
      return "No conversation history.";
    }
    
    return conversationHistory
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n');
  }
  
  private formatMemories(memories: Memory[]): string {
    if (memories.length === 0) {
      return "No relevant memories.";
    }
    
    return memories
      .map(memory => `- ${memory.content} (${new Date(memory.timestamp).toLocaleString()})`)
      .join('\n');
  }
  
  private formatPlans(plans: Plan[]): string {
    if (plans.length === 0) {
      return "No active plans.";
    }
    
    return plans
      .map(plan => {
        const stepsText = plan.steps.map(step => `  - ${step}`).join('\n');
        return `- Goal: ${plan.goal} (Priority: ${plan.priority}/10)\n${stepsText}`;
      })
      .join('\n\n');
  }
  
  private createAgentSystemPrompt(
    profile: any,
    memories: string,
    plans: string
  ): string {
    const traits = profile.traits ? profile.traits.join(', ') : '';
    const values = profile.values ? profile.values.join(', ') : '';
    
    return `
      You are roleplaying as ${profile.firstName} ${profile.lastName}, a ${profile.age}-year-old ${profile.occupation || 'person'}.
      
      ## Your Character
      ${
        JSON.stringify(profile)
      }
      
      Traits: ${traits}
      Values: ${values}
      
      ## Your Memories
      ${memories}
      
      ## Your Current Plans
      ${plans}
      
      Respond as this character would, maintaining their personality, values, and knowledge.
      Keep responses concise and natural, as if in a real conversation.
      Do not mention that you are an AI or that you're roleplaying.
    `;
  }
  
  private async callClaudeAPI(systemPrompt: string, userMessage: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      });
      
      return response.content[0].text;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      
      // Fallback response in case of API failure
      return "I'm having trouble processing that right now. Let's continue our conversation.";
    }
  }
} 