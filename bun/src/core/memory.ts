import { LLMProvider } from '../providers/llm-provider';
import { Memory as MemoryType } from '../types/agent';
import { ConversationHistory } from '../types/conversation';
import { v4 as uuidv4 } from 'uuid';

export class Memory {
  private episodicMemories: MemoryType[] = [];
  private semanticMemories: MemoryType[] = [];
  private proceduralMemories: MemoryType[] = [];
  
  constructor(
    private agentId: string,
    private llmProvider: LLMProvider
  ) {}
  
  public async storeConversation(conversationHistory: ConversationHistory): Promise<void> {
    // Convert conversation to episodic memory
    const lastEntry = conversationHistory[conversationHistory.length - 1];
    
    if (!lastEntry) return;
    
    const memory: MemoryType = {
      id: uuidv4(),
      type: 'episodic',
      content: `${lastEntry.speaker} said: "${lastEntry.text}"`,
      timestamp: Date.now(),
      importance: await this.calculateImportance(lastEntry.text),
    };
    
    this.episodicMemories.push(memory);
    
    // Potentially extract semantic knowledge from conversation
    await this.extractSemanticKnowledge(conversationHistory);
  }
  
  public async retrieveRelevantMemories(conversationHistory: ConversationHistory): Promise<MemoryType[]> {
    // Get the last few conversation entries
    const recentContext = conversationHistory.slice(-3);
    
    // Create a query from the recent context
    const query = recentContext.map(entry => `${entry.speaker}: ${entry.text}`).join('\n');
    
    // Use the LLM provider to find relevant memories
    const relevantMemories = await this.searchMemories(query);
    
    return relevantMemories;
  }
  
  private async calculateImportance(content: string): Promise<number> {
    // Use LLM to determine importance on a scale of 0-10
    const importance = await this.llmProvider.evaluateImportance(content);
    return importance;
  }
  
  private async extractSemanticKnowledge(conversationHistory: ConversationHistory): Promise<void> {
    // Use LLM to extract semantic knowledge from conversation
    const semanticKnowledge = await this.llmProvider.extractSemanticKnowledge(conversationHistory);
    
    if (semanticKnowledge) {
      const memory: MemoryType = {
        id: uuidv4(),
        type: 'semantic',
        content: semanticKnowledge,
        timestamp: Date.now(),
        importance: 7, // Semantic knowledge is generally important
      };
      
      this.semanticMemories.push(memory);
    }
  }
  
  private async searchMemories(query: string): Promise<MemoryType[]> {
    // Combine all memories
    const allMemories = [
      ...this.episodicMemories,
      ...this.semanticMemories,
      ...this.proceduralMemories
    ];
    
    // Sort by recency and importance
    const sortedMemories = allMemories.sort((a, b) => {
      // Combine recency and importance factors
      const recencyA = (Date.now() - a.timestamp) / (24 * 60 * 60 * 1000); // Days
      const recencyB = (Date.now() - b.timestamp) / (24 * 60 * 60 * 1000); // Days
      
      const scoreA = a.importance / (1 + recencyA);
      const scoreB = b.importance / (1 + recencyB);
      
      return scoreB - scoreA;
    });
    
    // Return top memories
    return sortedMemories.slice(0, 10);
  }
  
  // Additional methods for memory management
  public getAllMemories(): MemoryType[] {
    return [
      ...this.episodicMemories,
      ...this.semanticMemories,
      ...this.proceduralMemories
    ];
  }
  
  public getEpisodicMemories(): MemoryType[] {
    return [...this.episodicMemories];
  }
  
  public getSemanticMemories(): MemoryType[] {
    return [...this.semanticMemories];
  }
  
  public getProceduralMemories(): MemoryType[] {
    return [...this.proceduralMemories];
  }
} 