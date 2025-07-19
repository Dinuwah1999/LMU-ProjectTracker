// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');
const phaseCards = document.querySelectorAll('.phase-card');
const phaseHeaders = document.querySelectorAll('.phase-header');
const taskCheckboxes = document.querySelectorAll('.task-checkbox');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const dashboardProgress = document.getElementById('dashboardProgress');
const tasksCompleted = document.getElementById('tasksCompleted');
const currentPhase = document.getElementById('currentPhase');
const phaseProgressElements = {
    1: document.getElementById('phase1Progress'),
    2: document.getElementById('phase2Progress'),
    3: document.getElementById('phase3Progress'),
    4: document.getElementById('phase4Progress')
};
const phasePercentElements = {
    1: document.getElementById('phase1Percent'),
    2: document.getElementById('phase2Percent'),
    3: document.getElementById('phase3Percent'),
    4: document.getElementById('phase4Percent')
};

// Tracking variables
let totalTasks = 32; // Total number of tasks across all phases
let completedTasks = 0;
let phaseTaskCounts = {
    1: 10, // Phase 1 has 10 tasks
    2: 8,  // Phase 2 has 8 tasks
    3: 8,  // Phase 3 has 8 tasks
    4: 8   // Phase 4 has 8 tasks
};
let completedPhaseTaskCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
};

// Tab navigation
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        navTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all tab content
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Show corresponding tab content
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Phase card toggling
phaseHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const phaseCard = header.parentElement;
        phaseCard.classList.toggle('expanded');
    });
});

// Expand first phase by default
phaseCards[0].classList.add('expanded');

// Task checkbox handling
taskCheckboxes.forEach(checkbox => {
    // Setup event listener for each checkbox
    checkbox.addEventListener('change', () => {
        const taskItem = checkbox.parentElement;
        
        if (checkbox.checked) {
            taskItem.classList.add('completed');
            completedTasks++;
        } else {
            taskItem.classList.remove('completed');
            completedTasks--;
        }
        
        // Update progress
        updateProgress();
        
        // Update phase-specific progress
        updatePhaseProgress();
    });
});

// Function to update overall progress
function updateProgress() {
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    
    // Update main progress bar
    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `${progressPercentage}% Complete`;
    
    // Update dashboard progress
    dashboardProgress.textContent = `${progressPercentage}%`;
    tasksCompleted.textContent = `${completedTasks}/${totalTasks}`;
    
    // Update current phase
    updateCurrentPhase();
}

// Function to determine and update current phase based on progress
function updateCurrentPhase() {
    let phase = 1;
    
    if (completedTasks >= 26) {
        phase = 4; // 26-32 tasks (Phase 4)
    } else if (completedTasks >= 18) {
        phase = 3; // 18-25 tasks (Phase 3)
    } else if (completedTasks >= 10) {
        phase = 2; // 10-17 tasks (Phase 2)
    }
    
    currentPhase.textContent = `Phase ${phase}: ${getPhaseTitle(phase)}`;
}

// Helper function to get phase title
function getPhaseTitle(phase) {
    const phaseTitles = {
        1: 'Environment Setup',
        2: 'Network Configuration',
        3: 'Security Implementation',
        4: 'Monitoring & Documentation'
    };
    
    return phaseTitles[phase];
}

// Function to update phase-specific progress
function updatePhaseProgress() {
    // Reset phase task counts
    completedPhaseTaskCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0
    };
    
    // Count completed tasks by phase
    phaseCards.forEach((card, index) => {
        const phaseId = index + 1;
        const checkboxes = card.querySelectorAll('.task-checkbox');
        
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                completedPhaseTaskCounts[phaseId]++;
            }
        });
    });
    
    // Update phase progress bars and percentages
    for (let phaseId = 1; phaseId <= 4; phaseId++) {
        const phasePercentage = Math.round((completedPhaseTaskCounts[phaseId] / phaseTaskCounts[phaseId]) * 100);
        
        phaseProgressElements[phaseId].style.width = `${phasePercentage}%`;
        phasePercentElements[phaseId].textContent = `${phasePercentage}%`;
    }
}

// Function to set up the software requirement status indicators
function setupSoftwareStatus() {
    const softwareItems = document.querySelectorAll('.software-item');
    
    softwareItems.forEach(item => {
        item.addEventListener('click', () => {
            // Toggle between status--error/status--warning and status--success
            const statusElement = item.querySelector('.status');
            
            if (statusElement.classList.contains('status--error') || 
                statusElement.classList.contains('status--warning')) {
                // Change to installed/success
                statusElement.classList.remove('status--error', 'status--warning');
                statusElement.classList.add('status--success');
                statusElement.textContent = 'Installed';
            } else {
                // Change back to required/recommended
                statusElement.classList.remove('status--success');
                
                if (item.classList.contains('required')) {
                    statusElement.classList.add('status--error');
                    statusElement.textContent = 'Required';
                } else {
                    statusElement.classList.add('status--warning');
                    statusElement.textContent = 'Recommended';
                }
            }
        });
    });
}

// Function to handle topology status updates
function setupTopologyStatus() {
    const topologyItems = document.querySelectorAll('.topology-item');
    
    topologyItems.forEach(item => {
        item.addEventListener('click', () => {
            const statusElement = item.querySelector('.status');
            
            // Cycle through statuses
            if (statusElement.classList.contains('status--warning')) {
                // Pending -> In Progress
                statusElement.classList.remove('status--warning');
                statusElement.classList.add('status--info');
                statusElement.textContent = 'In Progress';
            } else if (statusElement.classList.contains('status--info')) {
                // In Progress -> Complete
                statusElement.classList.remove('status--info');
                statusElement.classList.add('status--success');
                statusElement.textContent = 'Complete';
            } else {
                // Complete -> Pending
                statusElement.classList.remove('status--success');
                statusElement.classList.add('status--warning');
                statusElement.textContent = 'Pending';
            }
        });
    });
}

// Function to handle documentation progress updates
function setupDocProgress() {
    const docItems = document.querySelectorAll('.doc-item');
    
    docItems.forEach(item => {
        item.addEventListener('click', () => {
            const statusElement = item.querySelector('.status');
            
            // Cycle through statuses
            if (statusElement.classList.contains('status--warning')) {
                // Pending -> In Progress
                statusElement.classList.remove('status--warning');
                statusElement.classList.add('status--info');
                statusElement.textContent = 'In Progress';
            } else if (statusElement.classList.contains('status--info')) {
                // In Progress -> Complete
                statusElement.classList.remove('status--info');
                statusElement.classList.add('status--success');
                statusElement.textContent = 'Complete';
            } else {
                // Complete -> Pending
                statusElement.classList.remove('status--success');
                statusElement.classList.add('status--warning');
                statusElement.textContent = 'Pending';
            }
        });
    });
}

// Initialize the application
function initApp() {
    // Set up software status indicators
    setupSoftwareStatus();
    
    // Set up topology status indicators
    setupTopologyStatus();
    
    // Set up documentation progress indicators
    setupDocProgress();
    
    // Initial progress update
    updateProgress();
    updatePhaseProgress();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);