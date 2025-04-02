# M31-Code VS Code Extension Architecture Guide

## 1. Project Structure

```
m31-code/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── components/              # React UI components
│   │   ├── ChatWindow.tsx
│   │   ├── Sidebar.tsx
│   │   └── ConfigPanel.tsx
│   ├── services/               # Core services
│   │   ├── AIService.ts
│   │   ├── ModelManager.ts
│   │   └── SecurityManager.ts
│   ├── features/              # Feature implementations
│   │   ├── CodeSuggestions.ts
│   │   ├── ContextAnalysis.ts
│   │   └── CommandPalette.ts
│   ├── utils/                # Utility functions
│   │   ├── DockerExec.ts
│   │   └── APIClient.ts
│   └── types/               # TypeScript type definitions
│       └── index.d.ts
├── webview/                # React UI source
├── test/                  # Test files
└── package.json
```

## 2. Core Components Implementation

### 2.1 Extension Entry Point (src/extension.ts)

```typescript
import * as vscode from 'vscode';
import { AIService } from './services/AIService';
import { ModelManager } from './services/ModelManager';
import { SecurityManager } from './services/SecurityManager';

export function activate(context: vscode.ExtensionContext) {
    // Initialize core services
    const modelManager = new ModelManager();
    const securityManager = new SecurityManager();
    const aiService = new AIService(modelManager, securityManager);

    // Register commands
    let disposable = vscode.commands.registerCommand('m31-code.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            
            try {
                const suggestion = await aiService.getSuggestion(text);
                // Handle suggestion
            } catch (error) {
                vscode.window.showErrorMessage('Error getting suggestion');
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
```

### 2.2 AI Service (src/services/AIService.ts)

```typescript
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
}
```

### 2.3 Model Manager (src/services/ModelManager.ts)

```typescript
import { AIModel, ModelConfig } from '../types';

export class ModelManager {
    private models: Map<string, AIModel>;
    private currentModel: string;

    constructor() {
        this.models = new Map();
        this.currentModel = 'gpt4'; // Default model
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

    async switchModel(modelName: string): Promise<void> {
        if (!this.models.has(modelName)) {
            throw new Error('Model not found');
        }
        this.currentModel = modelName;
    }

    private async createModel(config: ModelConfig): Promise<AIModel> {
        // Implementation for model creation based on config
        // This would include API setup, authentication, etc.
        throw new Error('Not implemented');
    }
}
```

### 2.4 Security Manager (src/services/SecurityManager.ts)

```typescript
export class SecurityManager {
    constructor() {
        // Initialize security configurations
    }

    sanitizeInput(input: string): string {
        // Implement input sanitization
        return input;
    }

    validateOutput(output: string): string {
        // Implement output validation
        return output;
    }

    async createSandbox(): Promise<void> {
        // Set up Docker container for code execution
    }

    async executeSandboxed(code: string): Promise<string> {
        // Execute code in sandbox
        return '';
    }
}
```

## 3. UI Components (src/components)

### 3.1 Chat Window (src/components/ChatWindow.tsx)

```typescript
import * as React from 'react';
import { useState, useEffect } from 'react';

export const ChatWindow: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        // Implementation
    };

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.type}`}>
                        {msg.content}
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for assistance..."
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};
```

## 4. Testing Strategy

### 4.1 Unit Tests

```typescript
import * as assert from 'assert';
import { AIService } from '../../src/services/AIService';

suite('AIService Test Suite', () => {
    test('getSuggestion returns valid suggestion', async () => {
        const service = new AIService(/* mocked dependencies */);
        const suggestion = await service.getSuggestion('function test() {}');
        assert.strictEqual(typeof suggestion, 'string');
        assert.ok(suggestion.length > 0);
    });
});
```

## 5. Configuration (package.json)

```json
{
    "name": "m31-code",
    "displayName": "M31-Code",
    "description": "AI-powered coding assistance",
    "version": "0.1.0",
    "engines": {
        "vscode": "^1.60.0"
    },
    "categories": [
        "Programming Languages",
        "Machine Learning",
        "Other"
    ],
    "activationEvents": [
        "onCommand:m31-code.suggest"
    ],
    "main": "./dist/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "m31-code.suggest",
                "title": "M31: Get Code Suggestion"
            }
        ],
        "configuration": {
            "title": "M31-Code",
            "properties": {
                "m31-code.defaultModel": {
                    "type": "string",
                    "default": "gpt4",
                    "description": "Default AI model to use"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./",
        "test": "node ./out/test/runTest.js"
    },
    "devDependencies": {
        "@types/vscode": "^1.60.0",
        "@types/node": "^16.x",
        "@types/mocha": "^9.0.0",
        "typescript": "^4.5.5",
        "mocha": "^9.1.3"
    }
}
```

## 6. Development Workflow

1. Initial Setup:
```bash
npm install -g yo generator-code
yo code
```

2. Development:
```bash
npm install
npm run watch
```

3. Testing:
```bash
npm run test
```

4. Packaging:
```bash
vsce package
```

## 7. Security Considerations

1. API Key Management:
   - Use VS Code's secret storage API
   - Never store keys in plain text
   - Implement key rotation

2. Code Execution:
   - Always use sandboxed environments
   - Implement resource limits
   - Validate all inputs and outputs

3. Data Privacy:
   - Implement data minimization
   - Add user consent mechanisms
   - Provide clear privacy policies

## 8. Deployment Checklist

1. Pre-deployment:
   - Run all tests
   - Check for security vulnerabilities
   - Update documentation

2. Packaging:
   - Update version number
   - Generate changelog
   - Create release notes

3. Publishing:
   - Submit to VS Code Marketplace
   - Monitor initial feedback
   - Prepare for rapid updates

## 9. Future Enhancements

1. Additional AI Models:
   - Add support for Claude
   - Implement local models
   - Create model performance metrics

2. Advanced Features:
   - Real-time pair programming
   - Code review automation
   - Test generation

3. Performance Optimizations:
   - Implement caching
   - Add request batching
   - Optimize model switching