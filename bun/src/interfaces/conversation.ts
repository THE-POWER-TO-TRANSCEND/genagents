import { GenerativeAgent } from '../core/generative-agent';
import { ConversationHistory, ConversationEntry } from '../types/conversation';
import { readline } from '../utils/io';

export class Conversation {
  private history: ConversationHistory = [];
  
  constructor(
    private agent: GenerativeAgent,
    private userName: string = "User"
  ) {}
  
  async start(): Promise<void> {
    console.log(`Starting conversation with ${this.agent.getFullName()}.`);
    console.log(`Type 'exit' to end the conversation.\n`);
    
    while (true) {
      // Get user input
      const userInput = await readline(`${this.userName}: `);
      
      if (userInput.toLowerCase() === 'exit') {
        console.log("Conversation ended.");
        break;
      }
      
      // Add user input to history
      this.addToHistory(this.userName, userInput);
      
      // Get agent response
      const agentResponse = await this.agent.generateUtterance(this.history);
      console.log(`${this.agent.getFullName()}: ${agentResponse}`);
      
      // Add agent response to history
      this.addToHistory(this.agent.getFullName(), agentResponse);
    }
  }
  
  private addToHistory(speaker: string, text: string): void {
    this.history.push({ speaker, text });
  }
} 