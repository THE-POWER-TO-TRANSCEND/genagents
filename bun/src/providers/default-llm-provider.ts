import { LLMProvider, ResponseGenerationParams } from './llm-provider';
import { ConversationHistory } from '../types/conversation';
import { Memory, Plan } from '../types/agent';

export class DefaultLLMProvider implements LLMProvider {
  async generateResponse(params: ResponseGenerationParams): Promise<string> {
    // In a real implementation, this would call an actual LLM API
    // For this abstracted version, we'll return a placeholder response
    const { profile, conversationHistory } = params;
    
    if (conversationHistory.length === 0) {
      return `Hello, I'm ${profile.firstName}. How can I help you?`;
    }
    
    const lastUserMessage = conversationHistory
      .filter(entry => entry.speaker !== profile.firstName + " " + profile.lastName)
      .pop();
      
    if (!lastUserMessage) {
      return "I'm not sure what you're asking. Could you please clarify?";
    }
    
    // Simple response generation based on user input
    if (lastUserMessage.text.toLowerCase().includes("hello") || 
        lastUserMessage.text.toLowerCase().includes("hi")) {
      return `Hello! Nice to meet you. I'm ${profile.firstName}, a ${profile.occupation || 'person'} with interests in ${profile.traits?.join(', ') || 'various things'}.`;
    }
    
    if (lastUserMessage.text.toLowerCase().includes("how are you")) {
      return "I'm doing well, thank you for asking! How about yourself?";
    }
    
    if (lastUserMessage.text.toLowerCase().includes("?")) {
      return `That's an interesting question. As someone who ${profile.background || 'has my background'}, I would say it depends on the context.`;
    }
    
    return `I understand what you're saying. From my perspective as ${profile.firstName}, I think it's important to consider different viewpoints.`;
  }
  
  async evaluateImportance(content: string): Promise<number> {
    // Simplified importance evaluation
    // In a real implementation, this would use an LLM to evaluate
    const importantKeywords = [
      "critical", "important", "urgent", "significant", "essential",
      "remember", "don't forget", "must", "need", "should"
    ];
    
    let importance = 5; // Default medium importance
    
    for (const keyword of importantKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        importance += 1;
      }
    }
    
    return Math.min(10, importance);
  }
  
  async extractSemanticKnowledge(conversationHistory: ConversationHistory): Promise<string | null> {
    // Simplified semantic knowledge extraction
    if (conversationHistory.length < 3) {
      return null;
    }
    
    const lastThreeMessages = conversationHistory.slice(-3).map(entry => entry.text).join(" ");
    
    // Check if there's any factual information worth extracting
    if (lastThreeMessages.includes("is") || 
        lastThreeMessages.includes("are") || 
        lastThreeMessages.includes("was") || 
        lastThreeMessages.includes("were")) {
      return `Learned from conversation: ${lastThreeMessages.substring(0, 100)}...`;
    }
    
    return null;
  }
  
  async generatePlanSteps(goal: string): Promise<string[]> {
    // Simplified plan generation
    // In a real implementation, this would use an LLM to generate steps
    return [
      "Research and gather information",
      "Analyze available options",
      "Make a decision based on analysis",
      "Implement the chosen solution",
      "Evaluate results and adjust if needed"
    ];
  }
  
  async evaluatePriority(goal: string): Promise<number> {
    // Simplified priority evaluation
    const priorityKeywords = [
      "urgent", "important", "critical", "essential", "immediate",
      "high priority", "asap", "deadline", "crucial", "vital"
    ];
    
    let priority = 5; // Default medium priority
    
    for (const keyword of priorityKeywords) {
      if (goal.toLowerCase().includes(keyword)) {
        priority += 1;
      }
    }
    
    return Math.min(10, priority);
  }
  
  async generateReflectionInsights(memories: Memory[]): Promise<string[]> {
    // Simplified insight generation
    if (memories.length === 0) {
      return [];
    }
    
    return [
      "I should pay more attention to details in conversations",
      "It seems I have recurring interests in certain topics",
      "I notice patterns in how I respond to questions"
    ];
  }
  
  async evaluateInteractionQuality(interaction: string): Promise<number> {
    // Simplified interaction quality evaluation
    const positiveKeywords = ["thank", "appreciate", "good", "great", "excellent", "helpful"];
    const negativeKeywords = ["bad", "unhelpful", "confusing", "wrong", "incorrect", "misunderstood"];
    
    let quality = 5; // Default neutral quality
    
    for (const keyword of positiveKeywords) {
      if (interaction.toLowerCase().includes(keyword)) {
        quality += 1;
      }
    }
    
    for (const keyword of negativeKeywords) {
      if (interaction.toLowerCase().includes(keyword)) {
        quality -= 1;
      }
    }
    
    return Math.max(1, Math.min(10, quality));
  }
} 