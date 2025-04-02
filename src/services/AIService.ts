import { ModelManager } from './ModelManager';
import { SecurityManager } from './SecurityManager';

export class AIService {
    private modelManager: ModelManager;
    private securityManager: SecurityManager;

    constructor(modelManager: ModelManager, securityManager: SecurityManager) {
        this.modelManager = modelManager;
        this.securityManager = securityManager;
    }

    async getSuggestion(code: string): Promise<string> {
        // Validate and sanitize input
        const sanitizedCode = this.securityManager.sanitizeInput(code);

        // Get appropriate model
        const model = await this.modelManager.getCurrentModel();

        // Generate suggestion
        try {
            const suggestion = await model.generateSuggestion(sanitizedCode);
            return this.securityManager.validateOutput(suggestion);
        } catch (error) {
            throw new Error('Failed to generate suggestion');
        }
    }

    async chat(message: string): Promise<string> {
        const sanitizedMessage = this.securityManager.sanitizeInput(message);
        const model = await this.modelManager.getCurrentModel();

        try {
            const response = await model.generateResponse(sanitizedMessage);
            return this.securityManager.validateOutput(response);
        } catch (error) {
            throw new Error('Failed to generate response');
        }
    }
}