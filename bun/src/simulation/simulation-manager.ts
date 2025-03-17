import { SimulationEngine } from './simulation-engine';
import { GenerativeAgent } from '../core/generative-agent';
import { AgentProfile } from '../types/agent';
import { LLMProvider } from '../providers/llm-provider';
import { LLMProviderFactory, LLMProviderOptions } from '../providers/llm-provider-factory';
import { v4 as uuidv4 } from 'uuid';

export class SimulationManager {
  private simulationEngine: SimulationEngine;
  private llmProvider: LLMProvider;
  
  constructor(llmOptions?: LLMProviderOptions) {
    this.simulationEngine = new SimulationEngine();
    this.llmProvider = llmOptions 
      ? LLMProviderFactory.createProvider(llmOptions)
      : LLMProviderFactory.createProvider({ type: 'default' });
  }
  
  public async createLargeScaleSimulation(agentCount: number = 1000): Promise<void> {
    console.log(`Creating large-scale simulation with ${agentCount} agents...`);
    
    // Generate diverse agent profiles
    const profiles = this.generateDiverseProfiles(agentCount);
    
    // Create and add agents to the simulation
    for (const profile of profiles) {
      const agent = new GenerativeAgent(profile, this.llmProvider);
      this.simulationEngine.addAgent(agent);
    }
    
    console.log(`Created ${agentCount} agents successfully.`);
  }
  
  private generateDiverseProfiles(count: number): AgentProfile[] {
    const profiles: AgentProfile[] = [];
    
    // Sample data for generating diverse profiles
    const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Susan", "Richard", "Jessica", "Joseph", "Sarah", "Thomas", "Karen", "Charles", "Nancy"];
    const lastNames = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson"];
    const occupations = ["Teacher", "Doctor", "Engineer", "Artist", "Writer", "Chef", "Programmer", "Scientist", "Lawyer", "Accountant", "Nurse", "Architect", "Musician", "Journalist", "Entrepreneur", "Farmer", "Mechanic", "Electrician", "Plumber", "Retail Worker"];
    const traits = ["creative", "analytical", "outgoing", "reserved", "optimistic", "pessimistic", "adventurous", "cautious", "organized", "spontaneous", "empathetic", "logical", "ambitious", "relaxed", "confident", "humble", "curious", "traditional", "innovative", "practical"];
    const values = ["Family", "Knowledge", "Success", "Freedom", "Creativity", "Security", "Adventure", "Spirituality", "Honesty", "Kindness", "Loyalty", "Independence", "Wisdom", "Harmony", "Courage", "Respect", "Responsibility", "Compassion", "Integrity", "Balance"];
    
    for (let i = 0; i < count; i++) {
      // Generate random profile with diverse attributes
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = Math.floor(Math.random() * 60) + 18; // 18-78
      const occupation = occupations[Math.floor(Math.random() * occupations.length)];
      
      // Select 2-4 random traits
      const traitCount = Math.floor(Math.random() * 3) + 2;
      const selectedTraits: string[] = [];
      for (let j = 0; j < traitCount; j++) {
        const trait = traits[Math.floor(Math.random() * traits.length)];
        if (!selectedTraits.includes(trait)) {
          selectedTraits.push(trait);
        }
      }
      
      // Select 2-3 random values
      const valueCount = Math.floor(Math.random() * 2) + 2;
      const selectedValues: string[] = [];
      for (let j = 0; j < valueCount; j++) {
        const value = values[Math.floor(Math.random() * values.length)];
        if (!selectedValues.includes(value)) {
          selectedValues.push(value);
        }
      }
      
      // Create background based on traits and occupation
      const background = `${firstName} is a ${age}-year-old ${occupation.toLowerCase()} who values ${selectedValues.join(' and ')}. They are known for being ${selectedTraits.join(' and ')}.`;
      
      // Create goals based on traits and values
      const goals = [
        `Become a respected ${occupation}`,
        `Build meaningful relationships`,
        `Learn new skills related to ${occupation}`
      ];
      
      profiles.push({
        id: uuidv4(),
        firstName,
        lastName,
        age,
        occupation,
        traits: selectedTraits,
        values: selectedValues,
        background,
        goals
      });
    }
    
    return profiles;
  }
  
  public async startSimulation(): Promise<void> {
    await this.simulationEngine.start();
  }
  
  public stopSimulation(): void {
    this.simulationEngine.stop();
  }
  
  public getAgentCount(): number {
    return this.simulationEngine.getAllAgents().length;
  }
} 