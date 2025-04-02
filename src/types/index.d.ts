export interface AIModel {
    name: string;
    generateSuggestion(input: string): Promise<string>;
    generateResponse(input: string): Promise<string>;
}

export interface ModelConfig {
    name: string;
    apiKey?: string;
    endpoint?: string;
}

export interface Message {
    id: string;
    content: string;
    type: 'user' | 'assistant';
    timestamp: number;
}