import * as vscode from 'vscode';
import { AIService } from './services/AIService';
import { ModelManager } from './services/ModelManager';
import { SecurityManager } from './services/SecurityManager';
import { ChatViewProvider } from './webview/ChatViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Initialize core services
    const modelManager = new ModelManager();
    const securityManager = new SecurityManager();
    const aiService = new AIService(modelManager, securityManager);

    // Register chat webview provider
    const chatViewProvider = new ChatViewProvider(context.extensionUri, aiService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'm31-code.chatView',
            chatViewProvider
        )
    );

    // Register commands
    let suggestCommand = vscode.commands.registerCommand('m31-code.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const text = document.getText(selection);
            
            try {
                const suggestion = await aiService.getSuggestion(text);
                editor.edit(editBuilder => {
                    editBuilder.replace(selection, suggestion);
                });
            } catch (error) {
                vscode.window.showErrorMessage('Error getting suggestion');
            }
        }
    });

    let openChatCommand = vscode.commands.registerCommand('m31-code.openChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.m31-code-chat');
    });

    let switchModelCommand = vscode.commands.registerCommand('m31-code.switchModel', async () => {
        const models = await modelManager.getAvailableModels();
        const selected = await vscode.window.showQuickPick(models, {
            placeHolder: 'Select AI Model'
        });

        if (selected) {
            try {
                await modelManager.switchModel(selected);
                vscode.window.showInformationMessage(`Switched to ${selected} model`);
            } catch (error) {
                vscode.window.showErrorMessage('Failed to switch model');
            }
        }
    });

    context.subscriptions.push(suggestCommand, openChatCommand, switchModelCommand);
}

export function deactivate() {}