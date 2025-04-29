// Snake Resume - JavaScript Implementation

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileElem');
const fileInfo = document.getElementById('file-info');
const uploadActions = document.getElementById('upload-actions');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsSection = document.getElementById('results-section');
const closeResults = document.getElementById('close-results');
const resultsContent = document.getElementById('results-content');
const processingIndicator = document.querySelector('.processing-indicator');

// Snake Animation
const snakeAnimation = document.getElementById('snake-animation');

// Global variable to store CSV data
let csvData = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    initDragAndDrop();
    initButtons();
    initSnakeAnimation();
});

// Scroll to upload section
function scrollToUpload() {
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Initialize drag and drop functionality
function initDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
}

// Initialize button functionality
function initButtons() {
    analyzeBtn.addEventListener('click', analyzeResumes);
    closeResults.addEventListener('click', () => {
        resultsSection.style.display = 'none';
    });
}

// Initialize snake animation
function initSnakeAnimation() {
    // Create snake animation using anime.js
    const snakePathData = [];
    const pathLength = 20;
    const snakeLength = 10;
    
    // Initialize snake path
    for (let i = 0; i < pathLength; i++) {
        snakePathData.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
        });
    }
    
    // Create snake elements
    for (let i = 0; i < snakeLength; i++) {
        const snakeSegment = document.createElement('div');
        snakeSegment.classList.add('snake-segment');
        snakeSegment.style.width = '10px';
        snakeSegment.style.height = '10px';
        snakeSegment.style.backgroundColor = i === 0 ? '#388e3c' : '#4caf50';
        snakeSegment.style.borderRadius = '50%';
        snakeSegment.style.position = 'absolute';
        snakeSegment.style.zIndex = '1000';
        snakeAnimation.appendChild(snakeSegment);
        
        // Animate each segment with delay
        animateSnakeSegment(snakeSegment, i);
    }
}

// Animate individual snake segment
function animateSnakeSegment(element, index) {
    const delay = index * 100;
    
    anime({
        targets: element,
        translateX: function() {
            return anime.random(0, window.innerWidth);
        },
        translateY: function() {
            return anime.random(0, window.innerHeight);
        },
        easing: 'easeInOutQuad',
        duration: 10000,
        delay: delay,
        complete: function() {
            animateSnakeSegment(element, index);
        }
    });
}

// Prevent default behavior for drag and drop events
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area
function highlight() {
    dropArea.classList.add('highlight');
}

// Remove highlight from drop area
function unhighlight() {
    dropArea.classList.remove('highlight');
}

// Handle file drop
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// Handle selected files
function handleFiles(files) {
    if (files.length) {
        const file = files[0];
        
        if (validateFile(file)) {
            parseCSV(file);
        } else {
            showFileError("Please upload a valid CSV file");
        }
    }
}

// Validate file type
function validateFile(file) {
    const validTypes = ['text/csv', 'application/vnd.ms-excel'];
    return validTypes.includes(file.type) || file.name.endsWith('.csv');
}

// Show file error
function showFileError(message) {
    fileInfo.className = 'file-info error';
    fileInfo.textContent = message;
    fileInfo.style.display = 'block';
    uploadActions.style.display = 'none';
}

// Parse CSV file
function parseCSV(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Parse CSV data
            const csvContent = e.target.result;
            csvData = parseCSVContent(csvContent);
            
            // Show file info and action panel
            fileInfo.className = 'file-info success';
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)}) - ${csvData.length} resumes loaded`;
            fileInfo.style.display = 'block';
            uploadActions.style.display = 'block';
        } catch (error) {
            showFileError("Error parsing CSV file. Please check the format.");
            console.error("CSV parsing error:", error);
        }
    };
    
    reader.onerror = function() {
        showFileError("Error reading file");
    };
    
    reader.readAsText(file);
}

// Parse CSV content to array of objects
function parseCSVContent(csvContent) {
    // Split by lines
    const lines = csvContent.split(/\r\n|\n/);
    const result = [];
    
    // Extract headers (first line)
    const headers = lines[0].split(',').map(header => header.trim());
    
    // Process each line
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = parseCSVLine(lines[i]);
        
        if (values.length === headers.length) {
            const entry = {};
            
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            
            result.push(entry);
        }
    }
    
    return result;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
    const result = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // Add the last value
    result.push(currentValue.trim());
    
    return result;
}

// Format file size to readable format
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
}

// Analyze resumes based on job requirements
function analyzeResumes() {
    // Get job requirements
    const jobTitle = document.getElementById('jobTitle').value.trim();
    const requiredSkills = document.getElementById('requiredSkills').value
        .split(',')
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill !== '');
    const minExperience = parseInt(document.getElementById('experienceYears').value) || 0;
    
    // Validate inputs
    if (!jobTitle) {
        alert('Please enter a job title');
        return;
    }
    
    if (requiredSkills.length === 0) {
        alert('Please enter at least one required skill');
        return;
    }
    
    // Show results section and processing indicator
    resultsSection.style.display = 'flex';
    processingIndicator.style.display = 'flex';
    resultsContent.style.display = 'none';
    
    // Simulate processing delay for demonstration
    setTimeout(() => {
        // Process each resume
        const results = processResumes(csvData, jobTitle, requiredSkills, minExperience);
        
        // Display results
        displayResults(results);
        
        // Hide processing indicator and show results
        processingIndicator.style.display = 'none';
        resultsContent.style.display = 'block';
    }, 2000);
}

// Process resumes with NLP techniques
function processResumes(resumes, jobTitle, requiredSkills, minExperience) {
    return resumes.map(resume => {
        // Extract skills from resume using NLP
        const skills = extractSkills(resume);
        
        // Calculate skill match
        const matchedSkills = requiredSkills.filter(skill => 
            skills.some(resumeSkill => resumeSkill.toLowerCase().includes(skill))
        );
        
        const skillMatchScore = requiredSkills.length > 0 
            ? (matchedSkills.length / requiredSkills.length) * 100 
            : 0;
        
        // Extract experience using NLP
        const experience = extractExperience(resume);
        
        // Calculate experience match
        const experienceYears = calculateTotalExperience(experience);
        const experienceMatchScore = experienceYears >= minExperience ? 100 : 
            (experienceYears / minExperience) * 100;
        
        // Generate overall match score
        const overallScore = Math.round((skillMatchScore * 0.7) + (experienceMatchScore * 0.3));
        
        // Determine match level
        let matchLevel;
        if (overallScore >= 80) matchLevel = 'high-match';
        else if (overallScore >= 50) matchLevel = 'medium-match';
        else matchLevel = 'low-match';
        
        return {
            name: resume.Name || resume.name || 'Unknown Candidate',
            email: resume.Email || resume.email || 'No email provided',
            skills: skills,
            matchedSkills: matchedSkills,
            missingSkills: requiredSkills.filter(skill => 
                !matchedSkills.includes(skill)
            ),
            experience: experience,
            experienceYears: experienceYears,
            skillMatchScore: Math.round(skillMatchScore),
            experienceMatchScore: Math.round(experienceMatchScore),
            overallScore: overallScore,
            matchLevel: matchLevel
        };
    }).sort((a, b) => b.overallScore - a.overallScore); // Sort by score descending
}

// Extract skills from resume using NLP
function extractSkills(resume) {
    // Combine relevant fields that might contain skills
    const skillText = [
        resume.Skills || resume.skills || '',
        resume.Technologies || resume.technologies || '',
        resume.Tools || resume.tools || ''
    ].join(' ');
    
    // Simple extraction (in a real app, use more advanced NLP)
    return skillText
        .split(/,|;|\n|\.|\//)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1);
}

// Extract experience from resume
function extractExperience(resume) {
    // In a real application, this would use more sophisticated NLP techniques
    const experienceField = resume.Experience || resume.experience || '';
    
    if (!experienceField) return [];
    
    // Very simplified parsing - in reality, this would use NLP
    return experienceField.split(';').map(exp => {
        const parts = exp.split('|');
        return {
            title: parts[0] || 'Unknown Position',
            company: parts[1] || 'Unknown Company',
            duration: parts[2] || 'Unknown Duration',
            years: extractYearsFromDuration(parts[2] || '')
        };
    });
}

// Extract years from duration string using NLP techniques
function extractYearsFromDuration(duration) {
    // Simple regex to find years in text
    const yearMatch = duration.match(/(\d+)(?:\s*(?:year|yr)s?)/i);
    if (yearMatch) return parseInt(yearMatch[1]);
    
    // If no years mentioned but months are, convert to fraction of year
    const monthMatch = duration.match(/(\d+)(?:\s*month)s?/i);
    if (monthMatch) return Math.round((parseInt(monthMatch[1]) / 12) * 10) / 10;
    
    return 0;
}

// Calculate total experience years
function calculateTotalExperience(experiences) {
    return experiences.reduce((total, exp) => total + exp.years, 0);
}

// Display analysis results in the UI
function displayResults(results) {
    // Create results HTML
    resultsContent.innerHTML = `
        <div class="results-summary">
            <h3>Found ${results.length} potential candidates for ${document.getElementById('jobTitle').value}</h3>
            <p>Candidates are ranked by match score based on skills and experience</p>
        </div>
        <div class="candidate-grid">
            ${results.map(candidate => createCandidateCard(candidate)).join('')}
        </div>
    `;
}

// Create HTML for a candidate card
function createCandidateCard(candidate) {
    const initials = candidate.name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    
    return `
        <div class="candidate-card ${candidate.matchLevel}">
            <div class="candidate-header">
                <div class="candidate-avatar">${initials}</div>
                <div class="candidate-name">
                    <h3>${candidate.name}</h3>
                    <p>${candidate.email}</p>
                </div>
            </div>
            
            <div class="match-score">
                <span class="score">${candidate.overallScore}%</span>
                <span class="label">Match</span>
            </div>
            
            <div class="candidate-skills">
                <h4>Skills (${candidate.skillMatchScore}% match)</h4>
                <div class="skill-tags">
                    ${candidate.skills.slice(0, 5).map(skill => 
                        `<span class="skill-tag ${candidate.matchedSkills.includes(skill.toLowerCase()) ? 'match' : ''}">${skill}</span>`
                    ).join('')}
                    ${candidate.skills.length > 5 ? `<span class="skill-tag">+${candidate.skills.length - 5} more</span>` : ''}
                </div>
                ${candidate.missingSkills.length > 0 ? 
                    `<p class="missing-skills">Missing: ${candidate.missingSkills.join(', ')}</p>` : ''}
            </div>
            
            <div class="candidate-experience">
                <h4>Experience (${candidate.experienceMatchScore}% match)</h4>
                ${candidate.experience.slice(0, 2).map(exp => `
                    <div class="experience-item">
                        <h5>${exp.title}</h5>
                        <p>${exp.company} | ${exp.duration}</p>
                    </div>
                `).join('')}
                ${candidate.experience.length > 2 ? `<p>+ ${candidate.experience.length - 2} more positions</p>` : ''}
                <p>Total: ${candidate.experienceYears} years</p>
            </div>
            
            <div class="candidate-actions">
                <button class="btn secondary-btn">View Full Resume</button>
                <button class="btn primary-btn">Contact</button>
            </div>
        </div>
    `;
}

// Function to animate snake when new content is loaded
function animateSnakeOnContent() {
    // Create a temporary snake animation on content load
    const contentSnake = document.createElement('div');
    contentSnake.classList.add('content-snake');
    document.body.appendChild(contentSnake);
    
    anime({
        targets: contentSnake,
        translateX: [
            { value: window.innerWidth, duration: 1000 },
            { value: 0, duration: 1000 }
        ],
        translateY: [
            { value: 100, duration: 500 },
            { value: 0, duration: 500 }
        ],
        opacity: [
            { value: 1, duration: 100 },
            { value: 0.5, duration: 900 },
            { value: 0, duration: 1000 }
        ],
        easing: 'easeInOutSine',
        complete: function() {
            document.body.removeChild(contentSnake);
        }
    });
}

// Add event listeners for smooth scrolling navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});