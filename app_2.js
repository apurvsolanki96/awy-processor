// NOTAM Parser - Self-Training System
class NOTAMParser {
    constructor() {
        this.parsingRules = this.loadParsingRules();
        this.notamLog = this.loadNotamLog();
        this.currentNotam = null;
        this.currentOutput = null;
        
        this.init();
    }

    init() {
        console.log('Initializing NOTAM Parser...');
        this.setupEventListeners();
        this.loadTheme();
        console.log('NOTAM Parser initialized successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
            console.log('Theme toggle event listener added');
        }

        // Process button
        const processBtn = document.getElementById('process-btn');
        if (processBtn) {
            processBtn.addEventListener('click', () => {
                this.processNotam();
            });
            console.log('Process button event listener added');
        }

        // Copy button
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyOutput();
            });
            console.log('Copy button event listener added');
        }

        // Teach parser button
        const teachBtn = document.getElementById('teach-btn');
        if (teachBtn) {
            teachBtn.addEventListener('click', () => {
                this.openTeachModal();
            });
            console.log('Teach button event listener added');
        }

        // Download log button
        const downloadBtn = document.getElementById('download-log-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadLog();
            });
            console.log('Download button event listener added');
        }

        // Modal controls
        const closeModal = document.getElementById('close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeTeachModal();
            });
            console.log('Close modal event listener added');
        }

        const saveCorrection = document.getElementById('save-correction');
        if (saveCorrection) {
            saveCorrection.addEventListener('click', () => {
                this.saveCorrection();
            });
            console.log('Save correction event listener added');
        }

        // Close modal on background click
        const teachModal = document.getElementById('teach-modal');
        if (teachModal) {
            teachModal.addEventListener('click', (e) => {
                if (e.target.id === 'teach-modal') {
                    this.closeTeachModal();
                }
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTeachModal();
            }
        });
        
        console.log('All event listeners set up successfully');
    }

    loadParsingRules() {
        try {
            const saved = localStorage.getItem('notam-parsing-rules');
            if (saved) {
                const rules = JSON.parse(saved);
                console.log('Loaded parsing rules from storage:', rules.length);
                return rules;
            }
        } catch (error) {
            console.warn('Error loading parsing rules from storage:', error);
        }

        // Default parsing rules
        const defaultRules = [
            {
                id: 'default-1',
                pattern: '(\\w\\d+):\\s*([A-Z]{3,5}(?:\\s+VOR)?(?:\\s+\'[A-Z]+\')?(?:\\s+[A-Z]+)?)\\s*[-–]\\s*([A-Z]{3,5})',
                flags: 'gi',
                description: 'Standard airway format: W213: URBEB - IDSUD'
            },
            {
                id: 'default-2', 
                pattern: '(\\w\\d+)\\s+([A-Z]{3,5})\\s*[-–]\\s*([A-Z]{3,5})',
                flags: 'gi',
                description: 'Simple airway format: W213 URBEB-IDSUD'
            },
            {
                id: 'default-3',
                pattern: '([A-Z]{3,5})\\s*[-–]\\s*([A-Z]{3,5})',
                flags: 'g',
                description: 'Route without airway: URBEB-IDSUD'
            }
        ];
        
        console.log('Using default parsing rules:', defaultRules.length);
        return defaultRules;
    }

    saveParsingRules() {
        try {
            localStorage.setItem('notam-parsing-rules', JSON.stringify(this.parsingRules));
            console.log('Parsing rules saved to storage');
        } catch (error) {
            console.warn('Error saving parsing rules:', error);
        }
    }

    loadNotamLog() {
        try {
            const saved = localStorage.getItem('notam-log');
            return saved || '';
        } catch (error) {
            console.warn('Error loading notam log:', error);
            return '';
        }
    }

    saveNotamLog() {
        try {
            localStorage.setItem('notam-log', this.notamLog);
        } catch (error) {
            console.warn('Error saving notam log:', error);
        }
    }

    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            this.updateThemeButton(savedTheme);
            console.log('Theme loaded:', savedTheme);
        } catch (error) {
            console.warn('Error loading theme:', error);
            // Default to dark theme
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            this.updateThemeButton('dark');
        }
    }

    toggleTheme() {
        console.log('Toggling theme...');
        const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('Changing theme from', currentTheme, 'to', newTheme);
        
        document.documentElement.setAttribute('data-color-scheme', newTheme);
        
        try {
            localStorage.setItem('theme', newTheme);
        } catch (error) {
            console.warn('Error saving theme:', error);
        }
        
        this.updateThemeButton(newTheme);
    }

    updateThemeButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (button) {
            button.textContent = theme === 'dark' ? '☀️' : '🌙';
            button.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
            console.log('Theme button updated for', theme, 'mode');
        }
    }

    processNotam() {
        console.log('Processing NOTAM...');
        
        const input = document.getElementById('notam-input');
        if (!input) {
            console.error('NOTAM input element not found');
            return;
        }
        
        const notamText = input.value.trim();

        if (!notamText) {
            alert('Please enter NOTAM text to process');
            return;
        }

        console.log('NOTAM text length:', notamText.length);
        this.currentNotam = notamText;
        
        const processBtn = document.getElementById('process-btn');
        
        // Show processing state
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.textContent = 'Processing...';
        }

        // Process immediately (no delay for better UX)
        try {
            const result = this.parseNotam(notamText);
            console.log('Parse result:', result);
            this.displayOutput(result);
        } catch (error) {
            console.error('Error processing NOTAM:', error);
            alert('Error processing NOTAM. Please check the console for details.');
        } finally {
            // Reset button
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = 'Process';
            }
        }
    }

    parseNotam(notamText) {
        console.log('Parsing NOTAM text...');

        // Extract Q-code flight levels (highest priority)
        const qCodeFLs = this.extractQCodeFlightLevels(notamText);
        
        // Extract flight levels from text
        const textFLs = this.extractTextFlightLevels(notamText);
        
        // Use Q-code FLs if available, otherwise text FLs
        const flightLevels = qCodeFLs || textFLs || 'GND-UNL';
        console.log('Flight levels determined:', flightLevels);

        // Extract routes using parsing rules
        const routes = this.extractRoutes(notamText, flightLevels);
        console.log('Extracted routes:', routes);

        return {
            routes: routes,
            flightLevels: flightLevels,
            hasResults: routes.length > 0
        };
    }

    extractQCodeFlightLevels(notamText) {
        // Q-code pattern: Q)ZLHW/QARLC/IV/NBO/E/187/217/...
        const qPattern = /Q\)[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/[^\/]*\/(\d{3})\/(\d{3})/;
        const match = notamText.match(qPattern);
        
        if (match) {
            const lowerFL = match[1];
            const upperFL = match[2];
            console.log('Found Q-code flight levels:', lowerFL, upperFL);
            return `FL${lowerFL}-FL${upperFL}`;
        }
        
        return null;
    }

    extractTextFlightLevels(notamText) {
        // Look for FL patterns in text
        const flPattern = /FL\s*(\d{3})\s*[-–]\s*FL\s*(\d{3})/i;
        const match = notamText.match(flPattern);
        
        if (match) {
            return `FL${match[1]}-FL${match[2]}`;
        }

        // Look for altitude in meters/feet
        const altPattern = /(\d{1,2},?\d{3})M.*?(\d{1,2},?\d{3})M/;
        const altMatch = notamText.match(altPattern);
        
        if (altMatch) {
            // Convert meters to flight level (rough approximation)
            const lower = parseInt(altMatch[1].replace(',', ''));
            const upper = parseInt(altMatch[2].replace(',', ''));
            const lowerFL = String(Math.round(lower * 3.28 / 100)).padStart(3, '0');
            const upperFL = String(Math.round(upper * 3.28 / 100)).padStart(3, '0');
            return `FL${lowerFL}-FL${upperFL}`;
        }

        return null;
    }

    extractRoutes(notamText, flightLevels) {
        console.log('Extracting routes from NOTAM...');
        const routes = [];
        const seenRoutes = new Set();

        for (const rule of this.parsingRules) {
            try {
                const regex = new RegExp(rule.pattern, rule.flags || 'gi');
                const matches = [...notamText.matchAll(regex)];
                console.log(`Rule ${rule.id} found ${matches.length} matches`);
                
                for (const match of matches) {
                    let airway = '';
                    let fromPoint = '';
                    let toPoint = '';

                    if (match.length >= 4) {
                        // Pattern with airway: W213: URBEB - IDSUD
                        airway = match[1];
                        fromPoint = this.cleanWaypoint(match[2]);
                        toPoint = this.cleanWaypoint(match[3]);
                    } else if (match.length >= 3) {
                        // Pattern without explicit airway or simple route
                        if (rule.id === 'default-3') {
                            // Route without airway
                            fromPoint = this.cleanWaypoint(match[1]);
                            toPoint = this.cleanWaypoint(match[2]);
                        } else {
                            // Simple airway format
                            airway = match[1];
                            fromPoint = this.cleanWaypoint(match[2]);
                        }
                    }

                    if (fromPoint && toPoint) {
                        const routeKey = `${airway}-${fromPoint}-${toPoint}`;
                        if (!seenRoutes.has(routeKey)) {
                            seenRoutes.add(routeKey);
                            
                            const flDisplay = flightLevels || 'GND-UNL';
                            const routeLine = airway 
                                ? `${airway} ${fromPoint}-${toPoint} ${flDisplay}`
                                : `${fromPoint}-${toPoint} ${flDisplay}`;
                            
                            routes.push(routeLine);
                            console.log('Added route:', routeLine);
                        }
                    }
                }
            } catch (error) {
                console.warn(`Error processing rule ${rule.id}:`, error);
            }
        }

        return routes;
    }

    cleanWaypoint(waypoint) {
        if (!waypoint) return '';
        
        return waypoint
            .replace(/\s+VOR\s*'[A-Z]+'/g, '')  // Remove "VOR 'JIG'"
            .replace(/JINGNING VOR/g, 'JIG')     // Replace specific VOR
            .replace(/'/g, '')                   // Remove quotes
            .trim();
    }

    displayOutput(result) {
        console.log('Displaying output...');
        
        const outputSection = document.getElementById('output-section');
        const outputContent = document.getElementById('output-content');
        
        if (!outputSection || !outputContent) {
            console.error('Output elements not found');
            return;
        }
        
        outputSection.classList.remove('hidden');
        
        if (result.hasResults) {
            this.currentOutput = result.routes.join('\n');
            outputContent.textContent = this.currentOutput;
            outputContent.classList.remove('empty');
            console.log('Output displayed successfully');
        } else {
            this.currentOutput = 'No matching routes found.';
            outputContent.textContent = this.currentOutput;
            outputContent.classList.add('empty');
            console.log('No routes found, displayed empty message');
        }

        // Log the processing
        this.logNotamProcessing(this.currentNotam, this.currentOutput);
        
        // Scroll to output
        outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    logNotamProcessing(notam, output) {
        const timestamp = new Date().toISOString();
        const compressedNotam = notam.replace(/\s+/g, ' ').trim();
        const logEntry = `[${timestamp}] RAW: ${compressedNotam} => OUT: ${output}\n`;
        
        this.notamLog += logEntry;
        this.saveNotamLog();
        
        // Update hidden log textarea for download
        const logTextarea = document.getElementById('notam-log');
        if (logTextarea) {
            logTextarea.value = this.notamLog;
        }
        
        console.log('NOTAM processing logged');
    }

    copyOutput() {
        console.log('Copying output...');
        
        if (!this.currentOutput) {
            alert('No output to copy');
            return;
        }

        const copyBtn = document.getElementById('copy-btn');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.currentOutput).then(() => {
                this.handleCopySuccess(copyBtn);
            }).catch(() => {
                this.fallbackCopy(this.currentOutput, copyBtn);
            });
        } else {
            this.fallbackCopy(this.currentOutput, copyBtn);
        }
    }

    handleCopySuccess(copyBtn) {
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.classList.add('copied');
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
        console.log('Output copied successfully');
    }

    fallbackCopy(text, copyBtn) {
        // Fallback copy method for older browsers
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            this.handleCopySuccess(copyBtn);
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Failed to copy to clipboard');
        }
    }

    openTeachModal() {
        console.log('Opening teach modal...');
        
        const modal = document.getElementById('teach-modal');
        const correctOutput = document.getElementById('correct-output');
        
        if (!modal || !correctOutput) {
            console.error('Modal elements not found');
            return;
        }
        
        // Pre-populate with current output for easy editing
        if (this.currentOutput && this.currentOutput !== 'No matching routes found.') {
            correctOutput.value = this.currentOutput;
        } else {
            correctOutput.value = '';
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('show');
        
        // Focus the textarea after a short delay to ensure modal is visible
        setTimeout(() => {
            correctOutput.focus();
        }, 100);
        
        console.log('Teach modal opened');
    }

    closeTeachModal() {
        console.log('Closing teach modal...');
        
        const modal = document.getElementById('teach-modal');
        if (modal) {
            modal.classList.remove('show');
            // Add hidden class after animation
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    saveCorrection() {
        console.log('Saving correction...');
        
        const correctOutput = document.getElementById('correct-output');
        if (!correctOutput) {
            console.error('Correct output element not found');
            return;
        }
        
        const correctionText = correctOutput.value.trim();
        
        if (!correctionText) {
            alert('Please enter the correct output');
            return;
        }

        if (!this.currentNotam) {
            alert('No current NOTAM to learn from');
            return;
        }

        const saveBtn = document.getElementById('save-correction');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
        }

        // Create new parsing rule from the correction
        this.createNewParsingRule(this.currentNotam, correctionText);
        
        // Log the correction
        this.logCorrection(this.currentNotam, correctionText);
        
        // Update current output
        this.currentOutput = correctionText;
        const outputContent = document.getElementById('output-content');
        if (outputContent) {
            outputContent.textContent = correctionText;
            outputContent.classList.remove('empty');
        }

        // Reset and close
        setTimeout(() => {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save & Learn';
            }
            this.closeTeachModal();
            alert('Parser updated successfully! New rule added.');
        }, 1000);
    }

    createNewParsingRule(notam, correctOutput) {
        console.log('Creating new parsing rule...');
        
        // Analyze the correct output to create a new parsing rule
        const lines = correctOutput.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
                const airway = parts[0];
                const routePart = parts[1];
                
                if (routePart.includes('-')) {
                    const [from, to] = routePart.split('-');
                    
                    // Create a simple string pattern for the new rule
                    const newRule = {
                        id: `learned-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        pattern: `(${this.escapeRegex(airway)})[:.]?\\s*([A-Z]{3,5}(?:\\s+VOR)?(?:\\s+'[A-Z]+')?(?:\\s+${this.escapeRegex(from)})?)\\s*[-–]\\s*([A-Z]{3,5}(?:\\s+${this.escapeRegex(to)})?)`,
                        flags: 'gi',
                        description: `Learned from correction: ${airway} ${from}-${to}`,
                        learned: true,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Add rule (never delete existing ones)
                    this.parsingRules.push(newRule);
                    console.log('New rule created:', newRule);
                }
            }
        }
        
        this.saveParsingRules();
        console.log('Total parsing rules:', this.parsingRules.length);
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    logCorrection(notam, correction) {
        const timestamp = new Date().toISOString();
        const compressedNotam = notam.replace(/\s+/g, ' ').trim();
        const correctionEntry = `[${timestamp}] CORRECTION - RAW: ${compressedNotam} => CORRECTED: ${correction}\n`;
        
        this.notamLog += correctionEntry;
        this.saveNotamLog();
        
        // Update hidden log textarea
        const logTextarea = document.getElementById('notam-log');
        if (logTextarea) {
            logTextarea.value = this.notamLog;
        }
        
        console.log('Correction logged');
    }

    downloadLog() {
        console.log('Downloading log...');
        
        if (!this.notamLog.trim()) {
            alert('No log data to download');
            return;
        }

        try {
            const blob = new Blob([this.notamLog], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = 'notamparsed.txt';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('Log file download initiated');
        } catch (error) {
            console.error('Error downloading log:', error);
            alert('Error downloading log file');
        }
    }
}

// Initialize the parser when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing NOTAM Parser...');
    window.notamParser = new NOTAMParser();
});

// Also initialize immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('DOM already ready, initializing NOTAM Parser...');
    window.notamParser = new NOTAMParser();
}