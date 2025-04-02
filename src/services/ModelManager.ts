import { AIModel, ModelConfig } from '../types';

export class ModelManager {
    private models: Map<string, AIModel>;
    private currentModel: string;
    private availableModels: string[];

    constructor() {
        this.models = new Map();
        this.currentModel = 'gpt4';
        this.availableModels = ['gpt4', 'codellama', 'mistral'];
    }

    async initializeModels(configs: ModelConfig[]) {
        for (const config of configs) {
            const model = await this.createModel(config);
            this.models.set(config.name, model);
        }
    }

    async getCurrentModel(): Promise<AIModel> {
        const model = this.models.get(this.currentModel);
        if (!model) {
            throw new Error('No model available');
        }
        return model;
    }

    async getAvailableModels(): Promise<string[]> {
        return this.availableModels;
    }

    async switchModel(modelName: string): Promise<void> {
        if (!this.models.has(modelName)) {
            throw new Error('Model not found');
        }
        this.currentModel = modelName;
    }

    private async createModel(config: ModelConfig): Promise<AIModel> {
        // Implementation for model creation based on config
        return {
            name: config.name,
            async generateSuggestion(input: string): Promise<string> {
                // Mock implementation
                return `Suggestion for: ${input}`;
            },
            async generateResponse(input: string): Promise<string> {
                // Mock implementation
                return `Response to: ${input}`;
            }
        };
    }
}