export interface AgentProfile {
  id?: string;
  firstName: string;
  lastName: string;
  age?: number;
  occupation?: string;
  traits?: string[];
  background?: string;
  goals?: string[];
  values?: string[];
  relationships?: Record<string, string>;
}

export interface Memory {
  id: string;
  type: 'episodic' | 'semantic' | 'procedural';
  content: string;
  timestamp: number;
  importance: number;
  embedding?: number[];
  relatedMemories?: string[];
}

export interface Plan {
  id: string;
  goal: string;
  steps: string[];
  status: 'active' | 'completed' | 'abandoned';
  priority: number;
  createdAt: number;
  updatedAt: number;
} 