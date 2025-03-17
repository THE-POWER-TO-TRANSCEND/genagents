import { Conversation } from './interfaces/conversation';
import { loadAgent } from './utils/agent-loader';
import { join } from 'path';

// Load environment variables

async function main() {
  // Check if Claude API key is available
  if (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY) {
    console.log("Claude API key found. Using Claude 3.5 Sonnet as the LLM provider.");
  } else {
    console.log("No Claude API key found. Using default mock LLM provider.");
    console.log("To use Claude, set the CLAUDE_API_KEY or ANTHROPIC_API_KEY environment variable in .env file.");
  }

  
  const agentId = process.argv[2];
  
  // Get current directory
  const currentDir = process.cwd();
  
  // Create path in a platform-independent way
  const agentPath = join(currentDir, 'src', 'agent_bank', 'populations', 'gss_agents', agentId);
  
  console.log(`Loading agent from: ${agentPath}`);
  const agent = await loadAgent(agentPath);
  
  const conversation = new Conversation(agent, "User");
  await conversation.start();
}

main().catch(console.error); 