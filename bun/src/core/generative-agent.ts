import { v4 as uuidv4 } from 'uuid';
import { Memory } from './memory';
import { Planning } from './planning';
import { Reflection } from './reflection';
import { SocialInteraction } from './social-interaction';
import { LLMProvider } from '../providers/llm-provider';
import { DefaultLLMProvider } from '../providers/default-llm-provider';
import { ConversationHistory } from '../types/conversation';
import { AgentProfile } from '../types/agent';

export class GenerativeAgent {
  private id: string;
  private memory: Memory;
  private planning: Planning;
  private reflection: Reflection;
  private socialInteraction: SocialInteraction;
  private llmProvider: LLMProvider;
  
  constructor(
    private profile: AgentProfile,
    llmProvider?: LLMProvider
  ) {
    this.id = profile.id || uuidv4();
    
    // Ensure we have a valid LLM provider
    if (!llmProvider) {
      console.warn("No LLM provider specified, using default mock provider");
      this.llmProvider = new DefaultLLMProvider();
    } else {
      console.log(`Using provided LLM provider: ${llmProvider.constructor.name}`);
      this.llmProvider = llmProvider;
    }
    
    // Initialize agent components
    this.memory = new Memory(this.id, this.llmProvider);
    this.planning = new Planning(this.memory, this.llmProvider);
    this.reflection = new Reflection(this.memory, this.llmProvider);
    this.socialInteraction = new SocialInteraction(this.memory, this.planning, this.llmProvider);
  }
  
  public getFullName(): string {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  
  public getId(): string {
    return this.id;
  }
  
  public getProfile(): AgentProfile {
    return this.profile;
  }
  
  public async generateUtterance(conversationHistory: ConversationHistory): Promise<string> {
    console.log(`${this.getFullName()} is generating a response using ${this.llmProvider.constructor.name}...`);
    
    // Store conversation in memory
    await this.memory.storeConversation(conversationHistory);
    
    // Retrieve relevant memories
    const relevantMemories = await this.memory.retrieveRelevantMemories(conversationHistory);
    
    // Generate response using the LLM
    const response = await this.llmProvider.generateResponse({
      profile: this.profile,
      conversationHistory,
      relevantMemories,
      currentPlans: this.planning.getCurrentPlans()
    });
    
    // Schedule reflection if needed
    this.scheduleReflection();
    
    return response;
  }
  
  private scheduleReflection(): void {
    // Determine if reflection is needed based on conversation length or importance
    const shouldReflect = this.reflection.shouldReflect();
    
    if (shouldReflect) {
      // Schedule reflection to happen asynchronously
      setTimeout(async () => {
        await this.reflection.reflect();
      }, 0);
    }
  }
  
  // Save agent state to disk
  public async save(path: string): Promise<void> {
    // Implementation to save agent state
  }
  
  // Static method to load agent from disk
  public static async load(path: string, llmProvider?: LLMProvider): Promise<GenerativeAgent> {
    // Implementation to load agent state
    return new GenerativeAgent({ id: "placeholder", firstName: "Placeholder", lastName: "Agent" });
  }
} 