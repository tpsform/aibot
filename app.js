class AIChat {
    constructor() {
        this.currentChatId = null;
        this.conversations = [];
        this.settings = {
            theme: 'auto',
            streamingEnabled: true,
            showTimestamps: true,
            autoScroll: true
        };
        this.isStreaming = false;
        this.currentStreamId = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.initializeElements();
        this.attachEventListeners();
        this.initializeTheme();
        this.loadConversations();
        this.createNewChat();
        this.hideLoadingOverlay();
        
        console.log('AI Chat Pro initialized successfully');
    }

    initializeElements() {
        // Main elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.modelSelect = document.getElementById('modelSelect');
        
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.chatList = document.getElementById('chatList');
        this.searchInput = document.getElementById('searchInput');
        
        // Settings elements
        this.settingsPanel = document.getElementById('settingsPanel');
        this.settingsToggle = document.getElementById('settingsToggle');
        this.closeSettings = document.getElementById('closeSettings');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeSelect = document.getElementById('themeSelect');
        this.streamingEnabled = document.getElementById('streamingEnabled');
        this.showTimestamps = document.getElementById('showTimestamps');
        this.autoScroll = document.getElementById('autoScroll');
        
        // Other elements
        this.scrollToBottom = document.getElementById('scrollToBottom');
        this.toastContainer = document.getElementById('toastContainer');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.exportBtns = document.querySelectorAll('.export-btn');
        
        console.log('Elements initialized');
    }

    attachEventListeners() {
        // Chat functionality
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        if (this.messageInput) {
            this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
            this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        }
        
        // Model selection
        if (this.modelSelect) {
            this.modelSelect.addEventListener('change', () => this.handleModelChange());
        }
        
        // Sidebar
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', () => this.createNewChat());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.searchChats(e.target.value));
        }
        
        // Settings
        if (this.settingsToggle) {
            this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        }
        if (this.closeSettings) {
            this.closeSettings.addEventListener('click', () => this.toggleSettings());
        }
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        }
        if (this.streamingEnabled) {
            this.streamingEnabled.addEventListener('change', (e) => this.updateSetting('streamingEnabled', e.target.checked));
        }
        if (this.showTimestamps) {
            this.showTimestamps.addEventListener('change', (e) => this.updateSetting('showTimestamps', e.target.checked));
        }
        if (this.autoScroll) {
            this.autoScroll.addEventListener('change', (e) => this.updateSetting('autoScroll', e.target.checked));
        }
        
        // Export buttons
        this.exportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.exportChat(e.target.dataset.format));
        });
        
        // Scroll to bottom
        if (this.scrollToBottom) {
            this.scrollToBottom.addEventListener('click', () => this.scrollMessagesToBottom());
        }
        if (this.chatMessages) {
            this.chatMessages.addEventListener('scroll', () => this.handleScroll());
        }
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e));
        
        // Click outside to close panels
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        console.log('Event listeners attached');
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isStreaming) return;

        const model = this.modelSelect.value;
        
        // Clear input and add user message
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.addMessage(message, 'user');
        
        // Show typing indicator
        const typingIndicator = this.showTypingIndicator();
        
        try {
            this.isStreaming = true;
            this.currentStreamId = Date.now().toString();
            
            // For now, simulate AI response since we might not have Puter.js available
            if (typeof puter !== 'undefined' && puter.ai) {
                if (this.settings.streamingEnabled) {
                    await this.handleStreamingResponse(message, model, typingIndicator);
                } else {
                    await this.handleRegularResponse(message, model, typingIndicator);
                }
            } else {
                // Fallback simulation
                await this.simulateResponse(message, model, typingIndicator);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator(typingIndicator);
            this.addMessage(`❌ Error: ${error.message || 'Something went wrong. Please try again.'}`, 'assistant');
            this.showToast('Error sending message', error.message, 'error');
        } finally {
            this.isStreaming = false;
            this.currentStreamId = null;
        }
        
        this.saveCurrentConversation();
        this.updateChatListItem();
    }

    async simulateResponse(message, model, typingIndicator) {
        // Simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        this.hideTypingIndicator(typingIndicator);
        
        // Generate a mock response
        const responses = [
            `I understand you're asking about "${message}". This is a demonstration response from the AI Chat Pro interface.`,
            `That's an interesting question about "${message}". In a real implementation, this would connect to AI services like GPT-4, Claude, or Llama.`,
            `Thanks for your message: "${message}". The chat interface is working correctly and would normally process this through the selected AI model (${this.getModelDisplayName(model)}).`,
            `I see you mentioned "${message}". This advanced chat interface supports streaming responses, conversation history, and multiple AI models.`
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage(response, 'assistant', false, model);
    }

    async handleStreamingResponse(message, model, typingIndicator) {
        this.hideTypingIndicator(typingIndicator);
        
        // Create message bubble for streaming
        const messageElement = this.addMessage('', 'assistant', true);
        const contentElement = messageElement.querySelector('.message-content');
        
        let fullResponse = '';
        
        try {
            // Use Puter.js streaming
            const stream = await puter.ai.chat(message, { 
                model: model,
                stream: true,
                conversation_id: this.currentChatId
            });
            
            for await (const chunk of stream) {
                if (this.currentStreamId !== messageElement.dataset.streamId) {
                    break; // Stream was cancelled
                }
                
                fullResponse += chunk;
                contentElement.innerHTML = marked.parse(fullResponse);
                
                if (this.settings.autoScroll) {
                    this.scrollMessagesToBottom();
                }
            }
        } catch (error) {
            throw error;
        }
        
        // Update message with final content
        this.updateMessageContent(messageElement, fullResponse, model);
    }

    async handleRegularResponse(message, model, typingIndicator) {
        try {
            const response = await puter.ai.chat(message, { 
                model: model,
                conversation_id: this.currentChatId
            });
            
            this.hideTypingIndicator(typingIndicator);
            this.addMessage(response, 'assistant', false, model);
        } catch (error) {
            throw error;
        }
    }

    addMessage(content, role, isStreaming = false, model = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}`;
        
        if (isStreaming) {
            messageElement.dataset.streamId = this.currentStreamId;
        }
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const modelName = model ? this.getModelDisplayName(model) : this.getModelDisplayName(this.modelSelect.value);
        
        const processedContent = role === 'user' ? this.escapeHtml(content) : (typeof marked !== 'undefined' ? marked.parse(content) : content);
        
        messageElement.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">${processedContent}</div>
                ${this.settings.showTimestamps ? `
                    <div class="message-meta">
                        <span class="message-timestamp">${timestamp}</span>
                        ${role === 'assistant' ? `<span class="message-model">${modelName}</span>` : ''}
                    </div>
                ` : ''}
                ${role === 'assistant' && !isStreaming ? `
                    <div class="message-actions">
                        <button class="message-action-btn copy-btn" title="Copy message">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="message-action-btn regenerate-btn" title="Regenerate response">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Remove welcome message if it exists
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        this.chatMessages.appendChild(messageElement);
        
        // Add event listeners for action buttons
        if (role === 'assistant' && !isStreaming) {
            const copyBtn = messageElement.querySelector('.copy-btn');
            const regenerateBtn = messageElement.querySelector('.regenerate-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', () => this.copyMessage(content));
            }
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => this.regenerateMessage(messageElement));
            }
        }
        
        if (this.settings.autoScroll) {
            this.scrollMessagesToBottom();
        }
        
        // Add to current conversation
        if (this.currentChatId) {
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            if (currentChat) {
                currentChat.messages.push({
                    id: Date.now().toString(),
                    role: role,
                    content: content,
                    timestamp: new Date().toISOString(),
                    model: role === 'assistant' ? (model || this.modelSelect.value) : null
                });
            }
        }
        
        return messageElement;
    }

    updateMessageContent(messageElement, content, model) {
        const contentElement = messageElement.querySelector('.message-content');
        contentElement.innerHTML = typeof marked !== 'undefined' ? marked.parse(content) : content;
        
        // Add action buttons if not already present
        if (!messageElement.querySelector('.message-actions')) {
            const bubble = messageElement.querySelector('.message-bubble');
            const actionsHtml = `
                <div class="message-actions">
                    <button class="message-action-btn copy-btn" title="Copy message">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action-btn regenerate-btn" title="Regenerate response">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;
            bubble.insertAdjacentHTML('beforeend', actionsHtml);
            
            const copyBtn = messageElement.querySelector('.copy-btn');
            const regenerateBtn = messageElement.querySelector('.regenerate-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', () => this.copyMessage(content));
            }
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => this.regenerateMessage(messageElement));
            }
        }
        
        // Update conversation
        if (this.currentChatId) {
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            if (currentChat && currentChat.messages.length > 0) {
                const lastMessage = currentChat.messages[currentChat.messages.length - 1];
                if (lastMessage.role === 'assistant') {
                    lastMessage.content = content;
                    lastMessage.model = model || this.modelSelect.value;
                }
            }
        }
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>AI is thinking...</span>
        `;
        
        this.chatMessages.appendChild(indicator);
        
        if (this.settings.autoScroll) {
            this.scrollMessagesToBottom();
        }
        
        return indicator;
    }

    hideTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.remove();
        }
    }

    createNewChat() {
        const chatId = Date.now().toString();
        const newChat = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString(),
            model: this.modelSelect.value
        };
        
        this.conversations.unshift(newChat);
        this.currentChatId = chatId;
        
        // Clear chat messages
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-content">
                    <h2>Welcome to AI Chat Pro</h2>
                    <p>Choose an AI model and start your conversation. Use <kbd>Ctrl+Enter</kbd> to send messages quickly.</p>
                </div>
            </div>
        `;
        
        this.updateChatList();
        this.saveConversations();
        if (this.messageInput) {
            this.messageInput.focus();
        }
        
        this.showToast('New Chat Created', 'Started a new conversation', 'success');
        
        console.log('New chat created:', chatId);
    }

    loadConversations() {
        try {
            const saved = localStorage.getItem('aiChatConversations');
            if (saved) {
                this.conversations = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            this.conversations = [];
        }
        this.updateChatList();
    }

    saveConversations() {
        try {
            localStorage.setItem('aiChatConversations', JSON.stringify(this.conversations));
        } catch (error) {
            console.error('Error saving conversations:', error);
            this.showToast('Save Error', 'Failed to save conversations', 'error');
        }
    }

    saveCurrentConversation() {
        if (this.currentChatId) {
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            if (currentChat && currentChat.messages.length > 0) {
                // Update title based on first user message
                const firstUserMessage = currentChat.messages.find(msg => msg.role === 'user');
                if (firstUserMessage && currentChat.title === 'New Chat') {
                    currentChat.title = firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
                }
            }
        }
        this.saveConversations();
    }

    updateChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        this.conversations.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            const preview = chat.messages.length > 0 
                ? chat.messages[chat.messages.length - 1].content.substring(0, 60) + '...'
                : 'No messages yet';
            
            chatItem.innerHTML = `
                <h5 class="chat-item-title">${this.escapeHtml(chat.title)}</h5>
                <p class="chat-item-preview">${this.escapeHtml(preview)}</p>
            `;
            
            chatItem.addEventListener('click', () => this.loadChat(chat.id));
            this.chatList.appendChild(chatItem);
        });
    }

    updateChatListItem() {
        if (this.currentChatId && this.chatList) {
            const chatItem = this.chatList.querySelector(`[data-chat-id="${this.currentChatId}"]`);
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            
            if (chatItem && currentChat) {
                const titleElement = chatItem.querySelector('.chat-item-title');
                const previewElement = chatItem.querySelector('.chat-item-preview');
                
                if (titleElement) {
                    titleElement.textContent = currentChat.title;
                }
                
                if (previewElement && currentChat.messages.length > 0) {
                    const lastMessage = currentChat.messages[currentChat.messages.length - 1];
                    previewElement.textContent = lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '');
                }
            }
        }
    }

    loadChat(chatId) {
        const chat = this.conversations.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.chatMessages.innerHTML = '';
        
        if (chat.messages.length === 0) {
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h2>Welcome to AI Chat Pro</h2>
                        <p>Choose an AI model and start your conversation. Use <kbd>Ctrl+Enter</kbd> to send messages quickly.</p>
                    </div>
                </div>
            `;
        } else {
            chat.messages.forEach(msg => {
                this.addMessageFromHistory(msg);
            });
        }
        
        this.updateChatList();
        this.scrollMessagesToBottom();
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
        
        console.log('Loaded chat:', chatId);
    }

    addMessageFromHistory(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.role}`;
        
        const timestamp = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const modelName = message.model ? this.getModelDisplayName(message.model) : '';
        
        const processedContent = message.role === 'user' ? this.escapeHtml(message.content) : (typeof marked !== 'undefined' ? marked.parse(message.content) : message.content);
        
        messageElement.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">${processedContent}</div>
                ${this.settings.showTimestamps ? `
                    <div class="message-meta">
                        <span class="message-timestamp">${timestamp}</span>
                        ${message.role === 'assistant' && modelName ? `<span class="message-model">${modelName}</span>` : ''}
                    </div>
                ` : ''}
                ${message.role === 'assistant' ? `
                    <div class="message-actions">
                        <button class="message-action-btn copy-btn" title="Copy message">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="message-action-btn regenerate-btn" title="Regenerate response">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        if (message.role === 'assistant') {
            const copyBtn = messageElement.querySelector('.copy-btn');
            const regenerateBtn = messageElement.querySelector('.regenerate-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', () => this.copyMessage(message.content));
            }
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => this.regenerateMessage(messageElement));
            }
        }
        
        this.chatMessages.appendChild(messageElement);
    }

    searchChats(query) {
        if (!this.chatList) return;
        
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-item-title')?.textContent.toLowerCase() || '';
            const preview = item.querySelector('.chat-item-preview')?.textContent.toLowerCase() || '';
            const matches = title.includes(query.toLowerCase()) || preview.includes(query.toLowerCase());
            
            item.style.display = matches ? 'block' : 'none';
        });
    }

    exportChat(format) {
        if (!this.currentChatId) {
            this.showToast('Export Failed', 'No active chat to export', 'error');
            return;
        }
        
        const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
        if (!currentChat || currentChat.messages.length === 0) {
            this.showToast('Export Failed', 'No messages to export', 'error');
            return;
        }
        
        let content = '';
        let filename = `chat_${currentChat.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`;
        let mimeType = 'text/plain';
        
        switch (format) {
            case 'markdown':
                content = this.exportToMarkdown(currentChat);
                filename += '.md';
                mimeType = 'text/markdown';
                break;
            case 'json':
                content = JSON.stringify(currentChat, null, 2);
                filename += '.json';
                mimeType = 'application/json';
                break;
            case 'txt':
                content = this.exportToText(currentChat);
                filename += '.txt';
                mimeType = 'text/plain';
                break;
        }
        
        this.downloadFile(content, filename, mimeType);
        this.showToast('Export Complete', `Chat exported as ${format.toUpperCase()}`, 'success');
    }

    exportToMarkdown(chat) {
        let markdown = `# ${chat.title}\n\n`;
        markdown += `**Created:** ${new Date(chat.createdAt).toLocaleString()}\n\n---\n\n`;
        
        chat.messages.forEach(msg => {
            const role = msg.role === 'user' ? '**You**' : '**AI Assistant**';
            const timestamp = new Date(msg.timestamp).toLocaleString();
            const model = msg.model ? ` (${this.getModelDisplayName(msg.model)})` : '';
            
            markdown += `${role}${model} - *${timestamp}*\n\n`;
            markdown += `${msg.content}\n\n---\n\n`;
        });
        
        return markdown;
    }

    exportToText(chat) {
        let text = `${chat.title}\n`;
        text += `Created: ${new Date(chat.createdAt).toLocaleString()}\n`;
        text += '='.repeat(50) + '\n\n';
        
        chat.messages.forEach(msg => {
            const role = msg.role === 'user' ? 'You' : 'AI Assistant';
            const timestamp = new Date(msg.timestamp).toLocaleString();
            const model = msg.model ? ` (${this.getModelDisplayName(msg.model)})` : '';
            
            text += `${role}${model} - ${timestamp}\n`;
            text += '-'.repeat(30) + '\n';
            text += `${msg.content}\n\n`;
        });
        
        return text;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    copyMessage(content) {
        // Remove markdown formatting for cleaner copy
        const plainText = content.replace(/[*_`#>\-+]/g, '').replace(/\n+/g, '\n').trim();
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(plainText).then(() => {
                this.showToast('Copied', 'Message copied to clipboard', 'success');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.showToast('Copy Failed', 'Failed to copy message', 'error');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = plainText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showToast('Copied', 'Message copied to clipboard', 'success');
            } catch (err) {
                this.showToast('Copy Failed', 'Failed to copy message', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    async regenerateMessage(messageElement) {
        // Find the user message before this assistant message
        let prevElement = messageElement.previousElementSibling;
        while (prevElement && !prevElement.classList.contains('user')) {
            prevElement = prevElement.previousElementSibling;
        }
        
        if (!prevElement) {
            this.showToast('Regenerate Failed', 'No user message found', 'error');
            return;
        }
        
        const userMessage = prevElement.querySelector('.message-content').textContent;
        
        // Remove the assistant message
        messageElement.remove();
        
        // Remove from conversation history
        if (this.currentChatId) {
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            if (currentChat) {
                currentChat.messages = currentChat.messages.slice(0, -1);
            }
        }
        
        // Regenerate response
        const typingIndicator = this.showTypingIndicator();
        const model = this.modelSelect.value;
        
        try {
            this.isStreaming = true;
            this.currentStreamId = Date.now().toString();
            
            if (typeof puter !== 'undefined' && puter.ai) {
                if (this.settings.streamingEnabled) {
                    await this.handleStreamingResponse(userMessage, model, typingIndicator);
                } else {
                    await this.handleRegularResponse(userMessage, model, typingIndicator);
                }
            } else {
                await this.simulateResponse(userMessage, model, typingIndicator);
            }
        } catch (error) {
            console.error('Regenerate error:', error);
            this.hideTypingIndicator(typingIndicator);
            this.addMessage(`❌ Error: ${error.message || 'Failed to regenerate response.'}`, 'assistant');
            this.showToast('Regenerate Failed', error.message, 'error');
        } finally {
            this.isStreaming = false;
            this.currentStreamId = null;
        }
        
        this.saveCurrentConversation();
        this.updateChatListItem();
    }

    toggleSidebar() {
        console.log('Toggle sidebar called');
        if (window.innerWidth <= 768) {
            this.sidebar?.classList.toggle('open');
        } else {
            document.body.classList.toggle('sidebar-collapsed');
        }
    }

    closeSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar?.classList.remove('open');
        }
    }

    toggleSettings() {
        console.log('Toggle settings called');
        this.settingsPanel?.classList.toggle('open');
    }

    toggleTheme() {
        console.log('Toggle theme called');
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.changeTheme(newTheme);
    }

    changeTheme(theme) {
        console.log('Changing theme to:', theme);
        this.settings.theme = theme;
        
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-color-scheme');
        } else {
            document.documentElement.setAttribute('data-color-scheme', theme);
        }
        
        // Update theme toggle icon
        if (this.themeToggle) {
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        if (this.themeSelect) {
            this.themeSelect.value = theme;
        }
        this.saveSettings();
    }

    initializeTheme() {
        const savedTheme = this.settings.theme || 'light';
        this.changeTheme(savedTheme);
        console.log('Theme initialized to:', savedTheme);
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        // Apply setting immediately
        if (key === 'showTimestamps') {
            this.refreshMessages();
        }
        
        console.log('Setting updated:', key, value);
    }

    refreshMessages() {
        if (this.currentChatId) {
            const currentChat = this.conversations.find(chat => chat.id === this.currentChatId);
            if (currentChat) {
                this.loadChat(this.currentChatId);
            }
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('aiChatSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
        // Apply settings to UI
        if (this.streamingEnabled) this.streamingEnabled.checked = this.settings.streamingEnabled;
        if (this.showTimestamps) this.showTimestamps.checked = this.settings.showTimestamps;
        if (this.autoScroll) this.autoScroll.checked = this.settings.autoScroll;
        if (this.themeSelect) this.themeSelect.value = this.settings.theme;
    }

    saveSettings() {
        try {
            localStorage.setItem('aiChatSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    showToast(title, message, type = 'info') {
        if (!this.toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${iconMap[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.remove();
            });
        }
        
        this.toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    scrollMessagesToBottom() {
        if (this.chatMessages) {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }
    }

    handleScroll() {
        if (!this.chatMessages || !this.scrollToBottom) return;
        
        const isAtBottom = this.chatMessages.scrollTop + this.chatMessages.clientHeight >= this.chatMessages.scrollHeight - 10;
        this.scrollToBottom.classList.toggle('visible', !isAtBottom && this.chatMessages.scrollHeight > this.chatMessages.clientHeight);
    }

    autoResizeTextarea() {
        if (!this.messageInput) return;
        
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleGlobalKeyboard(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey && e.shiftKey) {
            switch (e.key) {
                case 'N':
                    e.preventDefault();
                    this.createNewChat();
                    break;
                case 'E':
                    e.preventDefault();
                    this.exportChat('markdown');
                    break;
                case 'D':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case 'S':
                    e.preventDefault();
                    this.toggleSidebar();
                    break;
            }
        } else if (e.key === 'Escape') {
            // Close open panels
            this.settingsPanel?.classList.remove('open');
            this.closeSidebar();
        } else if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.sendMessage();
        } else if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            this.toggleSettings();
        }
    }

    handleOutsideClick(e) {
        // Close settings if clicking outside
        if (this.settingsPanel?.classList.contains('open') && 
            !this.settingsPanel.contains(e.target) && 
            !this.settingsToggle?.contains(e.target)) {
            this.settingsPanel.classList.remove('open');
        }
        
        // Close sidebar on mobile if clicking outside
        if (window.innerWidth <= 768 && 
            this.sidebar?.classList.contains('open') && 
            !this.sidebar.contains(e.target) && 
            !this.menuToggle?.contains(e.target)) {
            this.closeSidebar();
        }
    }

    handleResize() {
        // Handle responsive behavior
        if (window.innerWidth > 768) {
            this.sidebar?.classList.remove('open');
        }
    }

    handleModelChange() {
        this.showToast('Model Changed', `Switched to ${this.getModelDisplayName(this.modelSelect.value)}`, 'info');
    }

    getModelDisplayName(modelId) {
        const modelMap = {
            'openrouter:openai/gpt-4o-mini': 'GPT-4o Mini',
            'openrouter:openai/gpt-4o': 'GPT-4o',
            'openrouter:openai/o1-mini': 'o1-mini',
            'openrouter:anthropic/claude-3-7-sonnet': 'Claude 3.7 Sonnet',
            'openrouter:meta-llama/llama-3.1-8b-instruct': 'Llama 3.1 8B'
        };
        return modelMap[modelId] || modelId;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            this.loadingOverlay?.classList.remove('show');
        }, 500);
    }

    showLoadingOverlay() {
        this.loadingOverlay?.classList.add('show');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AI Chat Pro...');
    window.aiChat = new AIChat();
});