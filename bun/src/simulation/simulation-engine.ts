import { GenerativeAgent } from '../core/generative-agent';
import { Environment } from './environment';
import { TimeSystem } from './time-system';
import { EventSystem } from './event-system';

export class SimulationEngine {
  private agents: Map<string, GenerativeAgent> = new Map();
  private environment: Environment;
  private timeSystem: TimeSystem;
  private eventSystem: EventSystem;
  private isRunning: boolean = false;
  
  constructor() {
    this.environment = new Environment();
    this.timeSystem = new TimeSystem();
    this.eventSystem = new EventSystem(this.timeSystem);
  }
  
  public addAgent(agent: GenerativeAgent): void {
    this.agents.set(agent.getId(), agent);
  }
  
  public getAgent(agentId: string): GenerativeAgent | undefined {
    return this.agents.get(agentId);
  }
  
  public getAllAgents(): GenerativeAgent[] {
    return Array.from(this.agents.values());
  }
  
  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    
    while (this.isRunning) {
      // Advance time
      this.timeSystem.advanceTime();
      
      // Process scheduled events
      await this.eventSystem.processEvents();
      
      // Update agent states
      for (const agent of this.agents.values()) {
        // Update agent based on current time and environment
      }
      
      // Pause to prevent CPU overuse
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  public stop(): void {
    this.isRunning = false;
  }
} 