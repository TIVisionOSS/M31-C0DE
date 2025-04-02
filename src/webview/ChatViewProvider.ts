import * as vscode from 'vscode';
import { AIService } from '../services/AIService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _aiService: AIService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    try {
                        const response = await this._aiService.chat(data.message);
                        webviewView.webview.postMessage({ type: 'response', message: response });
                    } catch (error) {
                        webviewView.webview.postMessage({ 
                            type: 'error', 
                            message: 'Failed to get response' 
                        });
                    }
                    break;
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>M31 Code Chat</title>
                <style>
                    body { padding: 10px; }
                    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
                    .user { background: #2d2d2d; }
                    .assistant { background: #1e1e1e; }
                    #input { width: 100%; padding: 8px; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div id="messages"></div>
                <input type="text" id="input" placeholder="Type your message...">
                <script>
                    const vscode = acquireVsCodeApi();
                    const messagesDiv = document.getElementById('messages');
                    const input = document.getElementById('input');

                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            const message = input.value;
                            input.value = '';
                            
                            // Add user message
                            addMessage('user', message);
                            
                            // Send to extension
                            vscode.postMessage({
                                type: 'sendMessage',
                                message: message
                            });
                        }
                    });

                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'response':
                                addMessage('assistant', message.message);
                                break;
                            case 'error':
                                addMessage('error', message.message);
                                break;
                        }
                    });

                    function addMessage(type, content) {
                        const div = document.createElement('div');
                        div.className = 'message ' + type;
                        div.textContent = content;
                        messagesDiv.appendChild(div);
                        messagesDiv.scrollTop = messagesDiv.scrollHeight;
                    }
                </script>
            </body>
            </html>
        `;
    }
}