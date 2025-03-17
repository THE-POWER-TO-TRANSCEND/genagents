import { LLMProvider } from './llm-provider';
import { DefaultLLMProvider } from './default-llm-provider';
import { ClaudeLLMProvider, ClaudeConfig } from './claude-llm-provider';

export type LLMProviderType = 'default' | 'claude';

export interface LLMProviderOptions {
  type: LLMProviderType;
  config?: any;
}

export class LLMProviderFactory {
  static createProvider(options: LLMProviderOptions): LLMProvider {
    console.log(`Creating LLM provider of type: ${options.type}`);
    
    switch (options.type) {
      case 'claude':
        console.log("Initializing Claude provider...");
        return new ClaudeLLMProvider(options.config as ClaudeConfig);
      case 'default':
      default:
        console.log("Initializing default mock provider...");
        return new DefaultLLMProvider();
    }
  }
} 