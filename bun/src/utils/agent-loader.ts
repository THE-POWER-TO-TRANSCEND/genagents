import { GenerativeAgent } from '../core/generative-agent';
import { LLMProviderFactory } from '../providers/llm-provider-factory';
import { AgentProfile } from '../types/agent';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';


export async function loadAgent(agentPath: string): Promise<GenerativeAgent> {
  try {
    // First, create the LLM provider based on available API keys
    console.log("Checking for Claude API key...");
    const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    
    if (apiKey) {
      console.log(`Found API key: ${apiKey.substring(0, 10)}...`);
    } else {
      console.log("No API key found in environment variables");
      console.log("Environment variables:", Object.keys(process.env).join(", "));
    }
    
    const llmProvider = apiKey 
      ? LLMProviderFactory.createProvider({
          type: 'claude',
          config: {
            apiKey: apiKey,
            model: 'claude-3-5-sonnet-20240620'
          }
        })
      : LLMProviderFactory.createProvider({ type: 'default' });
    
    // Create the agent directory if it doesn't exist
    if (!existsSync(agentPath)) {
      console.log(`Creating agent directory: ${agentPath}`);
      await mkdir(agentPath, { recursive: true });
      
      // Create subdirectories
      await mkdir(join(agentPath, 'memories', 'episodic'), { recursive: true });
      await mkdir(join(agentPath, 'memories', 'semantic'), { recursive: true });
      await mkdir(join(agentPath, 'memories', 'procedural'), { recursive: true });
      await mkdir(join(agentPath, 'plans'), { recursive: true });
      await mkdir(join(agentPath, 'relationships'), { recursive: true });
      
      // Create a default profile
      const defaultProfile: AgentProfile = {
        firstName: "John",
        lastName: "Doe",
        age: 30,
        occupation: "Software Engineer",
        traits: ["curious", "analytical", "creative"],
        background: "Grew up in a small town, studied computer science, and now works at a tech company.",
        goals: ["Learn new technologies", "Build useful applications", "Help others"],
        values: ["Knowledge", "Innovation", "Kindness"]
      };
      
      // Save the profile
      const profilePath = join(agentPath, 'profile.json');
      await writeFile(profilePath, JSON.stringify(defaultProfile, null, 2));
      console.log(`Created default profile at: ${profilePath}`);
      
      return new GenerativeAgent(defaultProfile, llmProvider);
    }
    
    // Try to load profile.json if it exists
    const profilePath = join(agentPath, 'scratch.json');
    console.log(`profilePath`, profilePath);
    if (!existsSync(profilePath)) {
      console.log(`Profile doesn't exist, creating default profile at: ${profilePath}`);
      
      // Create a default profile
      const defaultProfile: AgentProfile = {
        firstName: "John",
        lastName: "Doe",
        age: 30,
        occupation: "Software Engineer",
        traits: ["curious", "analytical", "creative"],
        background: "Grew up in a small town, studied computer science, and now works at a tech company.",
        goals: ["Learn new technologies", "Build useful applications", "Help others"],
        values: ["Knowledge", "Innovation", "Kindness"]
      };
      
      // Save the profile
      await writeFile(profilePath, JSON.stringify(defaultProfile, null, 2));
      
      return new GenerativeAgent(defaultProfile, llmProvider);
    }
    
    // Load the profile
    try {
      const profileData = await readFile(profilePath, 'utf-8');
      const profile: AgentProfile = JSON.parse(profileData);
      // convert from snake_case to camelCase
      const camelCaseProfile = Object.fromEntries(
        Object.entries(profile).map(([key, value]) => [
          key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
          value
        ])
      );  
      
      console.log(`Loaded agent profile for: ${camelCaseProfile.firstName} ${camelCaseProfile.lastName}`);
      
      return new GenerativeAgent(camelCaseProfile as AgentProfile, llmProvider);
    } catch (error) {
      console.error(`Error parsing profile.json: ${error}`);
      throw error;
    }
  } catch (error) {
    console.error("Error loading agent:", error);
    throw error;
  }
} 