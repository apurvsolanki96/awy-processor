// NOTAM AI Processor with Microsoft Copilot Integration

class NOTAMProcessor {
    constructor() {
        // Microsoft Authentication Configuration
        this.msalConfig = {
            auth: {
                clientId: "your_microsoft_client_id",
                authority: "https://login.microsoftonline.com/common",
                redirectUri: window.location.origin + "/auth/callback"
            }
        };

        // API Endpoints
        this.apiEndpoints = {
            authenticate: "/api/copilot/authenticate",
            processNotam: "/api/notams/process", 
            storeCorrection: "/api/corrections/store",
            learningStats: "/api/learning/stats"
        };

        // Application State
        this.isAuthenticated = false;
        this.accessToken = null;
        this.userEmail = "apurv.140410101003@gmail.com";
        this.currentNotamResult = null;
        
        // Learning Statistics
        this.learningStats = {
            totalProcessed: 0,
            correctionsStored: 0,
            accuracyImprovement: 0,
            datasetSize: 0,
            lastUpdated: null,
            learningTrend: [65, 72, 78, 82, 87]
        };

        // Chart instance
        this.learningChart = null;

        // Initialize application
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.bindEvents();
        this.initializeChart();
        this.updateDashboard();
        this.addActivity('System initialized', 'Ready to connect to Microsoft Copilot');
        
        // Check for existing authentication
        this.checkExistingAuth();
    }

    bindEvents() {
        // Connect to Microsoft Copilot
        const connectBtn = document.getElementById('connectButton');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.authenticateWithCopilot());
        }

        // Process NOTAM button
        const processBtn = document.getElementById('processButton');
        if (processBtn) {
            processBtn.addEventListener('click', () => this.processNotam());
        }

        // Clear input button
        const clearBtn = document.getElementById('clearButton');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInput());
        }

        // Store correction button
        const storeCorrectionBtn = document.getElementById('storeCorrectionButton');
        if (storeCorrectionBtn) {
            storeCorrectionBtn.addEventListener('click', () => this.storeCorrection());
        }
    }

    async checkExistingAuth() {
        // Check if user was previously authenticated
        const savedToken = localStorage.getItem('copilot_access_token');
        const savedEmail = localStorage.getItem('copilot_user_email');
        
        if (savedToken && savedEmail) {
            try {
                // Validate token with backend
                const isValid = await this.validateToken(savedToken);
                if (isValid) {
                    this.setAuthenticatedState(savedToken, savedEmail);
                    this.addActivity('Authentication restored', 'Connected to Microsoft Copilot');
                } else {
                    localStorage.removeItem('copilot_access_token');
                    localStorage.removeItem('copilot_user_email');
                }
            } catch (error) {
                console.error('Token validation failed:', error);
            }
        }
    }

    async validateToken(token) {
        // Simulate token validation
        await new Promise(resolve => setTimeout(resolve, 500));
        return Math.random() > 0.2; // 80% chance token is valid
    }

    async authenticateWithCopilot() {
        const connectBtn = document.getElementById('connectButton');
        if (connectBtn) {
            connectBtn.textContent = 'Connecting...';
            connectBtn.disabled = true;
        }

        try {
            this.showNotification('Redirecting to Microsoft authentication...', 'info');
            
            // Simulate Microsoft OAuth flow
            await this.simulateMicrosoftOAuth();
            
            // Simulate getting access token
            const authResult = await this.getAccessToken();
            
            if (authResult.success) {
                this.setAuthenticatedState(authResult.accessToken, this.userEmail);
                this.showNotification('Successfully connected to Microsoft Copilot!', 'success');
                this.addActivity('Authentication successful', `Connected as ${this.userEmail}`);
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            this.showNotification('Failed to connect to Microsoft Copilot. Please try again.', 'error');
            this.addActivity('Authentication failed', 'Please check credentials and try again');
            
            // Reset button state
            if (connectBtn) {
                connectBtn.textContent = 'Connect to Microsoft Copilot';
                connectBtn.disabled = false;
            }
        }
    }

    async simulateMicrosoftOAuth() {
        // Simulate OAuth redirect and authorization
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
    }

    async getAccessToken() {
        // Simulate backend API call to get access token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true, // Force success for demo
            accessToken: 'simulated_copilot_access_token_' + Date.now(),
            expiresIn: 3600
        };
    }

    setAuthenticatedState(token, email) {
        this.isAuthenticated = true;
        this.accessToken = token;
        this.userEmail = email;
        
        // Store in localStorage
        localStorage.setItem('copilot_access_token', token);
        localStorage.setItem('copilot_user_email', email);
        
        // Update UI
        this.updateConnectionStatus(true);
        this.updateUserAccount(email);
        
        // Enable processing button
        const processBtn = document.getElementById('processButton');
        if (processBtn) {
            processBtn.disabled = false;
        }

        // Update connect button
        const connectBtn = document.getElementById('connectButton');
        if (connectBtn) {
            connectBtn.textContent = 'Connected ✓';
            connectBtn.classList.add('btn--primary');
            connectBtn.classList.remove('btn--outline');
            connectBtn.disabled = true;
        }
    }

    updateConnectionStatus(isConnected) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.querySelector('.connection-status .status-text');
        const apiStatus = document.getElementById('apiStatus');
        
        if (indicator) {
            indicator.className = isConnected ? 'status-indicator online' : 'status-indicator offline';
        }
        
        if (statusText) {
            statusText.textContent = isConnected ? 'Microsoft Copilot: Connected' : 'Microsoft Copilot: Disconnected';
        }
        
        if (apiStatus) {
            apiStatus.textContent = isConnected ? 'Online' : 'Offline';
        }
    }

    updateUserAccount(email) {
        const userAccount = document.getElementById('userAccount');
        if (userAccount) {
            userAccount.textContent = email;
        }
    }

    clearInput() {
        const input = document.getElementById('notam-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        
        // Hide results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.add('hidden');
        }
        
        // Clear current result
        this.currentNotamResult = null;
        
        this.showNotification('Input cleared successfully', 'success');
    }

    async processNotam() {
        if (!this.isAuthenticated) {
            this.showNotification('Please connect to Microsoft Copilot first', 'warning');
            return;
        }

        const input = document.getElementById('notam-input');
        if (!input) return;
        
        const notamText = input.value.trim();
        if (!notamText) {
            this.showNotification('Please enter NOTAM text to process', 'warning');
            return;
        }

        this.showProcessingStatus();
        
        try {
            const startTime = Date.now();
            const result = await this.callCopilotAPI(notamText);
            const processingTime = Date.now() - startTime;
            
            result.processingTime = processingTime;
            this.currentNotamResult = result;
            
            this.displayProcessingResult(result);
            this.updateProcessingStats();
            this.addActivity('NOTAM processed', `Confidence: ${Math.round(result.confidence * 100)}%`);
            
            // Update last process time
            const lastProcess = document.getElementById('lastProcess');
            if (lastProcess) {
                lastProcess.textContent = new Date().toLocaleTimeString();
            }
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showNotification('Error processing NOTAM with Copilot', 'error');
            this.addActivity('Processing failed', 'Error connecting to Copilot API');
        } finally {
            this.hideProcessingStatus();
        }
    }

    async callCopilotAPI(notamText) {
        // Simulate Microsoft Copilot API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Enhanced NOTAM parsing simulation
        const airwayPattern = /([ABGW]\d+|[A-Z]\d+)/;
        const routePattern = /([A-Z]{3,}(?:\s+VOR)?(?:\s+'[A-Z]+')?)[-\s]+([A-Z]{3,})/i;
        const altitudePattern = /(FL\d+[-\s]*FL\d+|\d+M?\s+AND\s+BELOW|FL\d+|SURFACE\s+TO\s+FL\d+|ALL\s+LEVELS)/i;
        const statusPattern = /(CLOSED|CLSD|OPEN|RESTRICTED|ACTIVE|INACTIVE)/i;
        
        // Extract components
        const airwayMatch = notamText.match(airwayPattern);
        const routeMatch = notamText.match(routePattern);
        const altitudeMatch = notamText.match(altitudePattern);
        const statusMatch = notamText.match(statusPattern);
        
        // Calculate confidence based on successful extractions
        let confidence = 0.5;
        if (airwayMatch) confidence += 0.2;
        if (routeMatch) confidence += 0.2;
        if (altitudeMatch) confidence += 0.1;
        if (statusMatch) confidence += 0.2;
        
        // Add some randomness to simulate real AI uncertainty
        confidence = Math.max(0.3, Math.min(0.95, confidence + (Math.random() - 0.5) * 0.3));
        
        // Determine priority
        let priority = 'MEDIUM';
        if (notamText.toLowerCase().includes('emergency') || notamText.toLowerCase().includes('critical')) {
            priority = 'CRITICAL';
        } else if (notamText.toLowerCase().includes('clsd') || notamText.toLowerCase().includes('closed')) {
            priority = 'HIGH';
        } else if (notamText.toLowerCase().includes('restricted')) {
            priority = 'HIGH';
        } else if (notamText.toLowerCase().includes('caution') || notamText.toLowerCase().includes('notice')) {
            priority = 'LOW';
        }
        
        return {
            airway: airwayMatch ? airwayMatch[1] : 'UNKNOWN',
            route: routeMatch ? `${routeMatch[1]} - ${routeMatch[2]}` : 'Route extraction failed',
            status: statusMatch ? statusMatch[1].toUpperCase() : 'UNKNOWN',
            altitude: altitudeMatch ? altitudeMatch[1] : 'Not specified',
            priority: priority,
            confidence: confidence,
            rawText: notamText,
            needsReview: confidence < 0.7
        };
    }

    showProcessingStatus() {
        const status = document.getElementById('processingStatus');
        const processBtn = document.getElementById('processButton');
        
        if (status) {
            status.classList.remove('hidden');
            
            // Update status text dynamically
            const statusText = status.querySelector('.status-text');
            if (statusText) {
                const steps = [
                    'Connecting to Microsoft Copilot API...',
                    'Authenticating with Copilot services...',
                    'Parsing NOTAM text structure...',
                    'Extracting airways and navigation points...',
                    'Analyzing altitudes and restrictions...',
                    'Determining priority classifications...',
                    'Validating extracted data...',
                    'Finalizing results...'
                ];
                
                let stepIndex = 0;
                const stepInterval = setInterval(() => {
                    if (stepIndex < steps.length) {
                        statusText.textContent = steps[stepIndex];
                        stepIndex++;
                    } else {
                        clearInterval(stepInterval);
                    }
                }, 400);
                
                // Store interval for cleanup
                this.processingInterval = stepInterval;
            }
        }
        
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.innerHTML = '<span class="button-icon">⏳</span>Processing...';
        }
    }

    hideProcessingStatus() {
        const status = document.getElementById('processingStatus');
        const processBtn = document.getElementById('processButton');
        
        // Clear processing interval
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        
        if (status) {
            status.classList.add('hidden');
        }
        
        if (processBtn) {
            processBtn.disabled = false;
            processBtn.innerHTML = '<span class="button-icon">🤖</span>Process with Microsoft Copilot';
        }
    }

    displayProcessingResult(result) {
        const resultsSection = document.getElementById('resultsSection');
        const confidenceScore = document.getElementById('confidenceScore');
        const processingTime = document.getElementById('processingTime');
        const parsedResults = document.getElementById('parsedResults');
        const correctionInterface = document.getElementById('correctionInterface');
        
        if (!resultsSection) return;
        
        // Update confidence score display
        if (confidenceScore) {
            const confidencePercent = Math.round(result.confidence * 100);
            confidenceScore.textContent = `Confidence: ${confidencePercent}%`;
            
            // Set confidence class
            confidenceScore.className = 'confidence-score';
            if (result.confidence >= 0.8) {
                confidenceScore.classList.add('high');
            } else if (result.confidence >= 0.6) {
                confidenceScore.classList.add('medium');
            } else {
                confidenceScore.classList.add('low');
            }
        }
        
        // Update processing time
        if (processingTime) {
            processingTime.textContent = `${result.processingTime}ms`;
        }
        
        // Display parsed results
        if (parsedResults) {
            parsedResults.innerHTML = `
                <div class="parsed-item">
                    <span class="parsed-label">Airway</span>
                    <span class="parsed-value">${result.airway}</span>
                </div>
                <div class="parsed-item">
                    <span class="parsed-label">Route</span>
                    <span class="parsed-value">${result.route}</span>
                </div>
                <div class="parsed-item">
                    <span class="parsed-label">Status</span>
                    <span class="parsed-value">${result.status}</span>
                </div>
                <div class="parsed-item">
                    <span class="parsed-label">Altitude</span>
                    <span class="parsed-value">${result.altitude}</span>
                </div>
                <div class="parsed-item">
                    <span class="parsed-label">Priority</span>
                    <span class="parsed-value priority-badge priority-${result.priority.toLowerCase()}">${result.priority}</span>
                </div>
                <div class="parsed-item">
                    <span class="parsed-label">Raw NOTAM</span>
                    <span class="parsed-value" style="font-family: var(--font-family-mono); color: var(--color-text-secondary);">${result.rawText}</span>
                </div>
            `;
        }
        
        // Show correction interface if confidence is low
        if (correctionInterface) {
            if (result.needsReview) {
                correctionInterface.classList.remove('hidden');
                this.prepopulateCorrectionForm(result);
            } else {
                correctionInterface.classList.add('hidden');
            }
        }
        
        resultsSection.classList.remove('hidden');
        resultsSection.classList.add('fade-in');
        
        const message = result.needsReview 
            ? `NOTAM processed but needs expert review (${Math.round(result.confidence * 100)}% confidence)`
            : `NOTAM successfully processed with high confidence!`;
            
        this.showNotification(message, result.needsReview ? 'warning' : 'success');
    }

    prepopulateCorrectionForm(result) {
        // Pre-populate correction form with AI results for easier editing
        const expectedAirway = document.getElementById('expectedAirway');
        const expectedRoute = document.getElementById('expectedRoute');
        const expectedStatus = document.getElementById('expectedStatus');
        const expectedAltitude = document.getElementById('expectedAltitude');
        const expectedPriority = document.getElementById('expectedPriority');
        
        if (expectedAirway && result.airway !== 'UNKNOWN') {
            expectedAirway.value = result.airway;
        }
        if (expectedRoute && !result.route.includes('failed')) {
            expectedRoute.value = result.route;
        }
        if (expectedStatus && result.status !== 'UNKNOWN') {
            expectedStatus.value = result.status;
        }
        if (expectedAltitude && result.altitude !== 'Not specified') {
            expectedAltitude.value = result.altitude;
        }
        if (expectedPriority) {
            expectedPriority.value = result.priority;
        }
    }

    async storeCorrection() {
        if (!this.currentNotamResult) {
            this.showNotification('No NOTAM result to correct', 'warning');
            return;
        }
        
        // Get correction values
        const expectedAirway = document.getElementById('expectedAirway')?.value.trim();
        const expectedRoute = document.getElementById('expectedRoute')?.value.trim();
        const expectedStatus = document.getElementById('expectedStatus')?.value;
        const expectedAltitude = document.getElementById('expectedAltitude')?.value.trim();
        const expectedPriority = document.getElementById('expectedPriority')?.value;
        
        if (!expectedAirway || !expectedRoute || !expectedStatus || !expectedAltitude || !expectedPriority) {
            this.showNotification('Please fill in all expected output fields', 'warning');
            return;
        }
        
        const correction = {
            notamId: `notam_${Date.now()}`,
            originalResult: this.currentNotamResult,
            expectedOutput: {
                airway: expectedAirway,
                route: expectedRoute,
                status: expectedStatus,
                altitude: expectedAltitude,
                priority: expectedPriority
            },
            correctedBy: this.userEmail,
            correctionDate: new Date().toISOString(),
            rawText: this.currentNotamResult.rawText
        };
        
        try {
            // Show storing status
            const storeBtn = document.getElementById('storeCorrectionButton');
            if (storeBtn) {
                storeBtn.textContent = 'Storing...';
                storeBtn.disabled = true;
            }
            
            await this.saveCorrectionToBackend(correction);
            
            // Update statistics
            this.learningStats.correctionsStored++;
            this.learningStats.datasetSize++;
            this.learningStats.accuracyImprovement += 0.5;
            
            // Update learning trend
            const currentAccuracy = this.learningStats.learningTrend[this.learningStats.learningTrend.length - 1];
            const newAccuracy = Math.min(95, currentAccuracy + Math.random() * 3 + 1);
            this.learningStats.learningTrend.push(Math.round(newAccuracy));
            
            if (this.learningStats.learningTrend.length > 5) {
                this.learningStats.learningTrend.shift();
            }
            
            this.updateDashboard();
            this.updateChart();
            
            // Hide correction interface
            const correctionInterface = document.getElementById('correctionInterface');
            if (correctionInterface) {
                correctionInterface.classList.add('hidden');
            }
            
            this.showNotification('Correction stored successfully! AI learning updated.', 'success');
            this.addActivity('Correction stored', 'Expert feedback saved for AI training');
            
            // Reset button
            if (storeBtn) {
                storeBtn.textContent = 'Store Correction';
                storeBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Failed to store correction:', error);
            this.showNotification('Failed to store correction. Please try again.', 'error');
            
            // Reset button
            const storeBtn = document.getElementById('storeCorrectionButton');
            if (storeBtn) {
                storeBtn.textContent = 'Store Correction';
                storeBtn.disabled = false;
            }
        }
    }

    async saveCorrectionToBackend(correction) {
        // Simulate backend API call to store correction
        console.log('Storing correction:', correction);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Store in localStorage for demo purposes
        const corrections = JSON.parse(localStorage.getItem('notam_corrections') || '[]');
        corrections.push(correction);
        localStorage.setItem('notam_corrections', JSON.stringify(corrections));
        
        return { success: true };
    }

    updateProcessingStats() {
        this.learningStats.totalProcessed++;
        this.updateDashboard();
    }

    updateDashboard() {
        const totalProcessed = document.getElementById('totalProcessed');
        const correctionsStored = document.getElementById('correctionsStored');
        const accuracyImprovement = document.getElementById('accuracyImprovement');
        const datasetSize = document.getElementById('datasetSize');
        
        if (totalProcessed) {
            totalProcessed.textContent = this.learningStats.totalProcessed;
        }
        if (correctionsStored) {
            correctionsStored.textContent = this.learningStats.correctionsStored;
        }
        if (accuracyImprovement) {
            accuracyImprovement.textContent = `+${this.learningStats.accuracyImprovement.toFixed(1)}%`;
        }
        if (datasetSize) {
            datasetSize.textContent = this.learningStats.datasetSize;
        }
    }

    initializeChart() {
        const canvas = document.getElementById('learningChart');
        if (!canvas) {
            setTimeout(() => this.initializeChart(), 100);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        this.learningChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Session 1', 'Session 2', 'Session 3', 'Session 4', 'Current'],
                datasets: [{
                    label: 'Accuracy %',
                    data: this.learningStats.learningTrend,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 50,
                        max: 100,
                        grid: {
                            color: 'rgba(119, 124, 124, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(119, 124, 124, 0.8)',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(119, 124, 124, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(119, 124, 124, 0.8)'
                        }
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.learningChart) return;
        
        this.learningChart.data.datasets[0].data = [...this.learningStats.learningTrend];
        this.learningChart.update('none'); // No animation for real-time updates
    }

    addActivity(action, details) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <span class="activity-time">${timeString}</span>
            <span class="activity-text">${action}: ${details}</span>
        `;
        
        // Add to top of feed
        activityFeed.insertBefore(activityItem, activityFeed.firstChild);
        
        // Keep only last 5 activities
        while (activityFeed.children.length > 5) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        const textElement = notification.querySelector('.notification-text');
        const iconElement = notification.querySelector('.notification-icon');
        
        if (textElement) textElement.textContent = message;
        
        // Reset classes
        notification.className = 'notification';
        
        // Set icon and styling based on type
        if (iconElement) {
            switch (type) {
                case 'error':
                    iconElement.textContent = '❌';
                    notification.classList.add('error');
                    break;
                case 'warning':
                    iconElement.textContent = '⚠️';
                    notification.classList.add('warning');
                    break;
                case 'info':
                    iconElement.textContent = 'ℹ️';
                    break;
                default:
                    iconElement.textContent = '✅';
            }
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Initialize the application
const notamProcessor = new NOTAMProcessor();

// Export for global access
window.notamProcessor = notamProcessor;