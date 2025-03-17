import { SimulationManager } from './simulation/simulation-manager';
import { SimulationAnalyzer } from './analysis/simulation-analyzer';
import { LLMProviderOptions } from './providers/llm-provider-factory';

// Load environment variables for API keys
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

async function runLargeScaleSimulation() {
  console.log("Starting large-scale generative agent simulation...");
  
  // Configure LLM provider
  const llmOptions: LLMProviderOptions = {
    type: 'claude',
    config: {
      apiKey: CLAUDE_API_KEY,
      model: 'claude-3-5-sonnet-20240620',
      temperature: 0.7
    }
  };
  
  // Create simulation manager with Claude provider
  const simulationManager = new SimulationManager(llmOptions);
  
  // Create a simulation with 1,000 agents
  await simulationManager.createLargeScaleSimulation(1000);
  console.log(`Created simulation with ${simulationManager.getAgentCount()} agents`);
  
  // Start the simulation
  console.log("Starting simulation...");
  await simulationManager.startSimulation();
  
  // The simulation will run in the background
  // We can periodically analyze the simulation
  
  // Set up analyzer
  const analyzer = new SimulationAnalyzer(simulationManager['simulationEngine']);
  
  // Schedule periodic analysis
  const analysisInterval = setInterval(() => {
    console.log("\n--- Simulation Analysis ---");
    
    // Identify communities
    const communities = analyzer.identifyCommunities();
    console.log(`Detected ${communities.length} communities`);
    
    for (const community of communities) {
      console.log(`Community ${community.id}: ${community.members.length} members`);
      console.log(`Common traits: ${community.commonTraits.join(', ')}`);
    }
    
    // Generate activity data
    const activityData = analyzer.generateActivityHeatmap();
    console.log(`Collected ${activityData.length} activity data points`);
    
    // Most active hour
    const hourCounts = new Map<number, number>();
    for (const data of activityData) {
      hourCounts.set(data.hour, (hourCounts.get(data.hour) || 0) + data.activityCount);
    }
    
    const mostActiveHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    console.log(`Most active hour: ${mostActiveHour[0]}:00 with ${mostActiveHour[1]} activities`);
    
    console.log("---------------------------\n");
  }, 60000); // Run analysis every minute
  
  // Allow the simulation to run for a set time
  setTimeout(() => {
    clearInterval(analysisInterval);
    simulationManager.stopSimulation();
    console.log("Simulation completed.");
  }, 3600000); // Run for 1 hour
}

// Run the simulation
runLargeScaleSimulation().catch(console.error); 