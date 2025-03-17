import { GenerativeAgent } from '../core/generative-agent';
import { SimulationEngine } from '../simulation/simulation-engine';
import { Memory as MemoryType } from '../types/agent';

export class SimulationAnalyzer {
  constructor(
    private simulationEngine: SimulationEngine
  ) {}
  
  public generateSocialNetworkGraph(): SocialNetworkGraph {
    const agents = this.simulationEngine.getAllAgents();
    const nodes: SocialNetworkNode[] = [];
    const edges: SocialNetworkEdge[] = [];
    
    // Create nodes for each agent
    for (const agent of agents) {
      nodes.push({
        id: agent.getId(),
        label: agent.getFullName(),
        attributes: {
          occupation: agent.getProfile().occupation || 'Unknown',
          age: agent.getProfile().age || 0
        }
      });
    }
    
    // Create edges based on relationships
    for (const agent of agents) {
      const relationships = agent['socialInteraction']?.getAllRelationships();
      
      if (relationships) {
        for (const [targetId, score] of relationships.entries()) {
          if (score > 5) { // Only include positive relationships
            edges.push({
              source: agent.getId(),
              target: targetId,
              weight: score / 10, // Normalize to 0-1
              attributes: {
                type: score > 8 ? 'strong' : 'moderate'
              }
            });
          }
        }
      }
    }
    
    return { nodes, edges };
  }
  
  public generateActivityHeatmap(): ActivityData[] {
    const agents = this.simulationEngine.getAllAgents();
    const activityData: ActivityData[] = [];
    
    // Analyze agent activities over time
    for (const agent of agents) {
      const memories = agent['memory']?.getEpisodicMemories() || [];
      
      // Group memories by hour
      const hourlyActivity = new Map<number, number>();
      
      for (const memory of memories) {
        const hour = new Date(memory.timestamp).getHours();
        hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
      }
      
      // Convert to activity data
      for (const [hour, count] of hourlyActivity.entries()) {
        activityData.push({
          agentId: agent.getId(),
          hour,
          activityCount: count
        });
      }
    }
    
    return activityData;
  }
  
  public identifyCommunities(): Community[] {
    // Simple community detection based on shared locations and interactions
    const socialGraph = this.generateSocialNetworkGraph();
    const communities: Community[] = [];
    
    // This is a simplified implementation
    // In a real system, we would use more sophisticated community detection algorithms
    
    // For now, just group agents with strong connections
    const processedAgents = new Set<string>();
    
    for (const node of socialGraph.nodes) {
      if (processedAgents.has(node.id)) continue;
      
      const communityMembers = [node.id];
      processedAgents.add(node.id);
      
      // Find all strongly connected agents
      const strongConnections = socialGraph.edges
        .filter(edge => edge.source === node.id && edge.attributes.type === 'strong')
        .map(edge => edge.target);
      
      for (const connectedAgent of strongConnections) {
        if (!processedAgents.has(connectedAgent)) {
          communityMembers.push(connectedAgent);
          processedAgents.add(connectedAgent);
        }
      }
      
      if (communityMembers.length > 1) {
        communities.push({
          id: `community-${communities.length + 1}`,
          members: communityMembers,
          commonTraits: this.findCommonTraits(communityMembers)
        });
      }
    }
    
    return communities;
  }
  
  private findCommonTraits(agentIds: string[]): string[] {
    const agents = agentIds.map(id => this.simulationEngine.getAgent(id))
      .filter((agent): agent is GenerativeAgent => agent !== undefined);
    
    if (agents.length <= 1) return [];
    
    // Find traits that appear in multiple agents
    const traitCounts = new Map<string, number>();
    
    for (const agent of agents) {
      const traits = agent.getProfile().traits || [];
      for (const trait of traits) {
        traitCounts.set(trait, (traitCounts.get(trait) || 0) + 1);
      }
    }
    
    // Return traits that appear in at least half of the community members
    const threshold = Math.ceil(agents.length / 2);
    return Array.from(traitCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([trait, _]) => trait);
  }
}

interface SocialNetworkNode {
  id: string;
  label: string;
  attributes: Record<string, any>;
}

interface SocialNetworkEdge {
  source: string;
  target: string;
  weight: number;
  attributes: Record<string, any>;
}

interface SocialNetworkGraph {
  nodes: SocialNetworkNode[];
  edges: SocialNetworkEdge[];
}

interface ActivityData {
  agentId: string;
  hour: number;
  activityCount: number;
}

interface Community {
  id: string;
  members: string[];
  commonTraits: string[];
} 