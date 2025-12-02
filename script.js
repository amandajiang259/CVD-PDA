// Page Management
let currentPage = 1;
const totalPages = 6;
let userScores = null;
let db = null;

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyB2yyp1Ool1-OGfEFRqDJuPnmmhPtLDIbo',
    authDomain: 'cvd-pda.firebaseapp.com',
    projectId: 'cvd-pda',
    storageBucket: 'cvd-pda.firebasestorage.app',
    messagingSenderId: '795028973612',
    appId: '1:795028973612:web:df1a9dbc1e66c6ebbc0989',
    measurementId: 'G-7LBV8W00ZM'
};

function showPage(pageNumber) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show current page
    const page = document.getElementById(`page${pageNumber}`);
    if (page) {
        page.classList.add('active');
    }
    
    // Update progress bar
    const progress = (pageNumber / totalPages) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('currentPage').textContent = pageNumber;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        showPage(currentPage);
        
        // If moving to page 5, initialize sliders
        if (currentPage === 5) {
            initializeSliders();
        }
        
        // If moving to page 6, generate final recommendation
        if (currentPage === 6) {
            generateFinalRecommendation();
        }
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        showPage(currentPage);
    }
}

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    showPage(1);
    initializeFirebase();
    attachAuthHandlers();
    attachVerificationHandler();
    initializeSliderKeyboardSupport();
    updateBeginJourneyButton(); // Set initial button state
    initializeScoreTooltips(); // Initialize interactive score icons
});

// Slider functionality for values assessment
function initializeSliders() {
    const riskSlider = document.getElementById('riskAvoidance');
    const interventionSlider = document.getElementById('interventionAvoidance');
    const riskValue = document.getElementById('riskValue');
    const interventionValue = document.getElementById('interventionValue');
    const recommendationPreview = document.getElementById('recommendationPreview');
    const recommendationText = document.getElementById('recommendationText');
    
    function updateRecommendation() {
        const riskScore = parseInt(riskSlider.value);
        const interventionScore = parseInt(interventionSlider.value);
        
        riskValue.textContent = riskScore;
        interventionValue.textContent = interventionScore;
        
        // Determine recommendation based on values
        let recommendation = '';
        let explanation = '';
        
        if (riskScore >= 7 && interventionScore <= 4) {
            // High risk avoidance, low intervention avoidance = Aggressive Intervention
            recommendation = 'Option 3: Aggressive Intervention';
            explanation = 'Your values show that minimizing your risk of a heart event is very important to you, and you\'re willing to accept medication and testing to achieve this. This suggests that Option 3 (Aggressive Intervention) may align best with your preferences.';
        } else if (riskScore <= 4 && interventionScore >= 7) {
            // Low risk avoidance, high intervention avoidance = Status Quo
            recommendation = 'Option 1: Continue Monitoring';
            explanation = 'Your values show that avoiding medication and proactive testing is very important to you. This suggests that Option 1 (Continue Monitoring) may align best with your preferences, as it avoids immediate intervention.';
        } else if (riskScore >= 6 && interventionScore >= 6) {
            // Both values are important = Lifestyle Changes
            recommendation = 'Option 2: Lifestyle Changes Only';
            explanation = 'Your values show that both minimizing risk and avoiding medication/proactive testing are important to you. This suggests that Option 2 (Lifestyle Changes Only) may be a good middle ground, as it reduces risk without medication or testing.';
        } else {
            // Mixed values - need more discussion
            recommendation = 'Discuss with Your Doctor';
            explanation = 'Your values show a mixed preference. It\'s important to discuss all three options with your doctor to determine which best fits your specific situation and concerns.';
        }
        
        recommendationText.innerHTML = `<strong>${recommendation}</strong><br><br>${explanation}`;
    }
    
    riskSlider.addEventListener('input', updateRecommendation);
    interventionSlider.addEventListener('input', updateRecommendation);
    
    // Initial update
    updateRecommendation();
}

// Generate final recommendation on summary page
function generateFinalRecommendation() {
    const riskSlider = document.getElementById('riskAvoidance');
    const interventionSlider = document.getElementById('interventionAvoidance');
    const finalRecommendation = document.getElementById('finalRecommendation');
    const recommendationExplanation = document.getElementById('recommendationExplanation');
    
    if (!riskSlider || !interventionSlider) {
        // If sliders aren't available (page refreshed), use default
        finalRecommendation.textContent = 'Option 2: Lifestyle Changes Only';
        recommendationExplanation.textContent = 'Based on a balanced approach, lifestyle changes offer a good middle ground between risk reduction and avoiding medication/testing. However, please discuss all options with your doctor to make the best decision for your situation.';
        return;
    }
    
    const riskScore = parseInt(riskSlider.value);
    const interventionScore = parseInt(interventionSlider.value);
    
    let recommendation = '';
    let explanation = '';
    let optionDetails = '';
    
    if (riskScore >= 7 && interventionScore <= 4) {
        recommendation = 'Option 3: Aggressive Intervention (Medication/Proactive Testing)';
        explanation = 'Based on your values, minimizing your risk of a cardiovascular event is very important to you, and you\'re willing to accept medication and testing.';
        optionDetails = 'This option involves starting statin medication, wearing a Holter monitor, and/or undergoing diagnostic testing to proactively address your cardiovascular risk.';
    } else if (riskScore <= 4 && interventionScore >= 7) {
        recommendation = 'Option 1: Continue Monitoring (Status Quo)';
        explanation = 'Based on your values, avoiding medication and proactive testing is very important to you.';
        optionDetails = 'This option involves continuing with your current routine monitoring schedule without immediate lifestyle changes or medication.';
    } else if (riskScore >= 6 && interventionScore >= 6) {
        recommendation = 'Option 2: Lifestyle Changes Only';
        explanation = 'Based on your values, both minimizing risk and avoiding medication/proactive testing are important to you.';
        optionDetails = 'This option involves making significant lifestyle changes (diet, exercise, sleep, etc.) to reduce your cardiovascular risk without medication or additional testing.';
    } else {
        recommendation = 'Discuss All Options with Your Doctor';
        explanation = 'Your values show a mixed preference. It\'s important to have a detailed discussion with your doctor about all three options.';
        optionDetails = 'Each option has different advantages and disadvantages. Your doctor can help you understand which option best fits your specific medical situation, risk tolerance, and lifestyle.';
    }
    
    finalRecommendation.textContent = recommendation;
    recommendationExplanation.innerHTML = `${explanation}<br><br>${optionDetails}<br><br><strong>Remember:</strong> This is a recommendation based on your stated values. The final decision should be made in partnership with your doctor, who can provide personalized medical advice based on your complete health profile.`;
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Allow arrow keys for navigation (when not in input fields)
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === 'ArrowLeft' && currentPage > 1) {
            prevPage();
        } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
            nextPage();
        }
    }
});

function initializeSliderKeyboardSupport() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        slider.addEventListener('keydown', function(e) {
            // Allow arrow keys to adjust slider values
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                if (this.value > this.min) {
                    this.value = parseInt(this.value) - 1;
                    this.dispatchEvent(new Event('input'));
                }
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                if (this.value < this.max) {
                    this.value = parseInt(this.value) + 1;
                    this.dispatchEvent(new Event('input'));
                }
            }
        });
    });
}

let isUserAuthenticated = false;
let isUserVerified = false;

// Firebase + Authentication + Score Retrieval
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase SDK not loaded. Authentication is unavailable.');
        return;
    }

    if (!firebase.apps.length) {
        if (!isFirebaseConfigPopulated()) {
            console.error('❌ Firebase config is still using placeholder values.');
            return;
        }
        try {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully!');
            console.log('   Project:', firebaseConfig.projectId);
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            return;
        }
    }

    db = firebase.firestore();
    firebase.auth().onAuthStateChanged(handleAuthStateChanged);
    console.log('✅ Firebase Auth and Firestore ready');
}

function isFirebaseConfigPopulated() {
    return Object.values(firebaseConfig).every(value => value && !String(value).startsWith('YOUR_'));
}

function handleAuthStateChanged(user) {
    isUserAuthenticated = Boolean(user);

    const signInButton = document.getElementById('signInButton');
    const signOutButton = document.getElementById('signOutButton');
    
    if (signInButton) {
        signInButton.classList.toggle('hidden', isUserAuthenticated);
    }
    if (signOutButton) {
        signOutButton.classList.toggle('hidden', !isUserAuthenticated);
    }

    toggleElementVisibility('verificationCard', isUserAuthenticated);

    if (!isUserAuthenticated) {
        isUserVerified = false;
        userScores = null;
        resetVerificationForm();
        clearScoreDisplays();
        setAuthStatus('Signed out. Please sign in to access your scores.', 'info');
        setVerificationStatus('Sign in first, then verify your ID and date of birth.', 'info');
    } else {
        const email = user.email || 'your account';
        setAuthStatus(`Signed in as ${email}.`, 'success');
    }
    
    updateBeginJourneyButton();
}

function attachAuthHandlers() {
    const form = document.getElementById('authForm');
    const signOutButton = document.getElementById('signOutButton');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!firebase.auth) {
                setAuthStatus('Authentication service unavailable. Check your Firebase setup.', 'error');
                return;
            }

            const emailInput = document.getElementById('authEmail');
            const passwordInput = document.getElementById('authPassword');
            const submitButton = document.getElementById('signInButton');

            if (!emailInput || !passwordInput || !submitButton) {
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                setAuthStatus('Enter both email and password.', 'error');
                return;
            }

            submitButton.disabled = true;
            setAuthStatus('Signing in...', 'info');

            try {
                await firebase.auth().signInWithEmailAndPassword(email, password);
                setAuthStatus('Signed in successfully.', 'success');
            } catch (error) {
                console.error(error);
                setAuthStatus(parseFirebaseError(error), 'error');
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    if (signOutButton) {
        signOutButton.addEventListener('click', async () => {
            if (!firebase.auth) {
                return;
            }
            try {
                await firebase.auth().signOut();
            } catch (error) {
                console.error(error);
                setAuthStatus(parseFirebaseError(error), 'error');
            }
        });
    }
}

function attachVerificationHandler() {
    const verificationForm = document.getElementById('verificationForm');
    if (!verificationForm) {
        return;
    }

    setVerificationStatus('Verify your patient ID and date of birth after signing in.', 'info');

    verificationForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!firebase.auth || !db) {
            setVerificationStatus('Verification service unavailable. Confirm Firebase configuration.', 'error');
            return;
        }

        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            setVerificationStatus('Please sign in before verifying your identity.', 'error');
            return;
        }

        const idInput = document.getElementById('patientId');
        const dobInput = document.getElementById('patientDob');
        const submitButton = document.getElementById('verifyButton');

        if (!idInput || !dobInput || !submitButton) {
            return;
        }

        const patientId = idInput.value.trim();
        const dob = formatDobInput(dobInput.value);

        if (!patientId || !dob) {
            setVerificationStatus('Enter both your patient ID and date of birth.', 'error');
            return;
        }

        submitButton.disabled = true;
        setVerificationStatus('Verifying your information...', 'info');

        try {
            let data = await fetchPatientRecord(currentUser.uid);
            
            // If document doesn't exist, create it with the entered ID and DOB
            if (!data) {
                console.log('Creating new patient record...');
                try {
                    await createPatientRecord(currentUser.uid, patientId, dob);
                    data = await fetchPatientRecord(currentUser.uid);
                    setVerificationStatus('Profile created. Note: Scores need to be added by your clinician.', 'info');
                } catch (createError) {
                    console.error('Error creating patient record:', createError);
                    if (createError.code === 'permission-denied') {
                        throw new Error('Permission denied. Please check Firestore security rules allow users to create their own documents.');
                    }
                    throw createError;
                }
            } else {
                // If document exists, verify the ID and DOB match
                confirmPatientDetails(data, patientId, dob);
            }
            
            userScores = data;
            isUserVerified = true;
            
            // Only apply scores if they exist (not placeholder 0s)
            if (data.frsScore > 0 || data.aiScore > 0) {
                applyScoresToUI(data);
                setVerificationStatus('Identity confirmed. Your scores are now available.', 'success');
            } else {
                clearScoreDisplays();
                setVerificationStatus('Identity confirmed, but scores are not yet available. Please contact your clinician.', 'info');
            }
            
            updateBeginJourneyButton();
        } catch (error) {
            console.error('Verification error:', error);
            isUserVerified = false;
            userScores = null;
            clearScoreDisplays();
            
            // Provide user-friendly error messages
            let errorMessage = 'Verification failed. Please try again.';
            if (error.code === 'permission-denied') {
                errorMessage = 'Permission denied. Your Firestore security rules need to allow users to read/write their own documents. See console for details.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setVerificationStatus(errorMessage, 'error');
            updateBeginJourneyButton();
        } finally {
            submitButton.disabled = false;
        }
    });
}

async function fetchPatientRecord(uid) {
    const docRef = db.collection('scores').doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) {
        return null; // Return null instead of throwing, so we can create it
    }

    return doc.data();
}

async function createPatientRecord(uid, patientId, dob) {
    const docRef = db.collection('scores').doc(uid);
    
    // Create document with patient ID and DOB
    // Scores will be added later by clinician/admin
    // 
    // Score Ranges:
    // - frsScore: 0-100 (percentage risk for 10-year major cardiac event)
    //   Low: < 10%, Moderate: 10-19%, High: ≥ 20%
    // - aiScore: 0-100 (AI risk index)
    //   Low: < 30, Moderate: 30-40, High: > 40
    await docRef.set({
        patientId: patientId,
        dob: dob,
        frsScore: 0, // Placeholder - to be updated by clinician (valid range: 0-100)
        aiScore: 0,  // Placeholder - to be updated by clinician (valid range: 0-100)
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: false }); // Use set() to create, not update
    
    console.log('✅ Patient record created for uid:', uid);
}

function confirmPatientDetails(data, enteredId, enteredDob) {
    // enteredDob is already formatted from the form input (YYYY-MM-DD from HTML date input)
    const storedId = (data.patientId || '').trim().toLowerCase();
    const storedDobRaw = data.dob || data.dateOfBirth || '';
    const storedDob = formatDobInput(storedDobRaw);
    // enteredDob is already in YYYY-MM-DD format from HTML date input, but normalize it just in case
    const enteredDobFormatted = formatDobInput(enteredDob);

    console.log('DOB Comparison:', {
        storedRaw: storedDobRaw,
        storedFormatted: storedDob,
        enteredRaw: enteredDob,
        enteredFormatted: enteredDobFormatted,
        match: storedDob === enteredDobFormatted
    });

    if (!storedId || !storedDob) {
        throw new Error('Your profile is missing the required ID or date of birth. Please contact support.');
    }

    if (storedId !== enteredId.toLowerCase()) {
        throw new Error('The patient ID you entered does not match our records.');
    }

    if (storedDob !== enteredDobFormatted) {
        console.error('DOB mismatch:', { 
            stored: storedDob, 
            entered: enteredDobFormatted,
            storedRaw: storedDobRaw
        });
        throw new Error('The date of birth you entered does not match our records.');
    }
    
    console.log('✅ Patient details confirmed');
}

function applyScoresToUI(data) {
    const frsScore = clampPercentage(data.frsScore);
    const aiScore = clampAIScore(data.aiScore);
    
    // Debug logging
    console.log('Raw AI Score from data:', data.aiScore);
    console.log('Clamped AI Score:', aiScore);
    console.log('Formatted AI Score:', formatAIScore(aiScore));
    
    // Always calculate labels from scores (ignore hardcoded labels in Firestore)
    const frsLabel = determineFRSRiskLabel(frsScore);
    const aiLabel = determineAIRiskLabel(aiScore);
    
    console.log('AI Risk Label:', aiLabel);

    updateTextContent('frsPercentage', formatPercentage(frsScore));
    updateTextContent('aiPercentage', formatAIScore(aiScore));
    updateTextContent('frsLabel', frsLabel);
    updateTextContent('aiLabel', aiLabel);
    updateTextContent('summaryFrsPercentage', formatPercentage(frsScore));
    updateTextContent('summaryAiPercentage', formatAIScore(aiScore));
    updateTextContent('summaryFrsLabel', frsLabel);
    updateTextContent('summaryAiLabel', aiLabel);

    updateGaugeFill('frsGaugeFill', frsScore);
    // Convert AUC (0.00-1.00) to percentage (0-100) for gauge display
    updateGaugeFill('aiGaugeFill', aiScore !== null ? aiScore * 100 : null);
    
    // Update gauge classes based on risk level
    updateGaugeClass('frsGauge', frsLabel);
    updateGaugeClass('aiGauge', aiLabel);
}

function clearScoreDisplays() {
    const placeholderPercent = '--';
    const placeholderLabel = 'Awaiting Lookup';
    updateTextContent('frsPercentage', placeholderPercent);
    updateTextContent('aiPercentage', placeholderPercent);
    updateTextContent('summaryFrsPercentage', placeholderPercent);
    updateTextContent('summaryAiPercentage', placeholderPercent);
    updateTextContent('frsLabel', placeholderLabel);
    updateTextContent('aiLabel', placeholderLabel);
    updateTextContent('summaryFrsLabel', placeholderLabel);
    updateTextContent('summaryAiLabel', placeholderLabel);
    updateGaugeFill('frsGaugeFill', null);
    updateGaugeFill('aiGaugeFill', null);
    // Reset gauge classes
    updateGaugeClass('frsGauge', placeholderLabel);
    updateGaugeClass('aiGauge', placeholderLabel);
}

function resetVerificationForm() {
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.reset();
    }
}

function toggleElementVisibility(elementId, shouldShow) {
    const el = document.getElementById(elementId);
    if (!el) {
        return;
    }
    el.classList.toggle('hidden', !shouldShow);
}

function setAuthStatus(message, variant = 'info') {
    const statusEl = document.getElementById('authStatus');
    if (!statusEl) {
        return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove('info', 'error', 'success');
    statusEl.classList.add(variant);
}

function setVerificationStatus(message, variant = 'info') {
    const statusEl = document.getElementById('verificationStatus');
    if (!statusEl) {
        return;
    }
    statusEl.textContent = message;
    statusEl.classList.remove('info', 'error', 'success');
    statusEl.classList.add(variant);
}

function parseFirebaseError(error) {
    if (!error || !error.code) {
        return 'An unexpected error occurred. Please try again.';
    }
    switch (error.code) {
        case 'auth/invalid-email':
            return 'The email address is not valid.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Incorrect email or password.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        default:
            return error.message || 'Authentication error. Please try again.';
    }
}

// Normalize date of birth to YYYY-MM-DD format
// Handles both YYYY-MM-DD and MM-DD-YYYY input formats
function formatDobInput(value) {
    if (!value) {
        return '';
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }
    
    // Split by common delimiters
    const parts = trimmed.split(/[-/]/);
    if (parts.length !== 3) {
        return trimmed; // Return as-is if format is unrecognized
    }
    
    // Determine format: if first part is 4 digits, it's YYYY-MM-DD
    // Otherwise, assume MM-DD-YYYY
    if (parts[0].length === 4) {
        // Already YYYY-MM-DD format
        const [year, month, day] = parts;
        return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else {
        // MM-DD-YYYY format - convert to YYYY-MM-DD
        const [month, day, year] = parts;
        return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
}

// ============================================================================
// SCORE RANGES AND VALIDATION
// ============================================================================
// 
// FRS (Framingham Risk Score):
//   - Range: 0-100 (percentage risk for 10-year major cardiac event)
//   - Risk Stratification:
//     * Low risk: < 10%
//     * Moderate risk: 10-19%
//     * High risk: ≥ 20%
//
// AI Score (AUC/Confidence Level):
//   - Range: 0.00-1.00 (Area Under the Curve / Confidence level)
//   - Risk Stratification:
//     * Really Low: < 0.50
//     * Low: 0.50-0.70
//     * Moderate: 0.70-0.90
//     * High: > 0.90
// ============================================================================

// Clamp FRS score to valid percentage range (0-100)
function clampPercentage(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return null;
    }
    return Math.min(Math.max(Math.round(numeric), 0), 100);
}

function formatPercentage(value) {
    return typeof value === 'number' ? `${value}%` : '--';
}

function formatAIScore(value) {
    if (typeof value !== 'number') {
        return '--';
    }
    // Format AUC as decimal with 2 decimal places (e.g., 0.85)
    return value.toFixed(2);
}

// Determine FRS risk label based on percentage score
// See documentation block above for risk stratification ranges
function determineFRSRiskLabel(score) {
    if (typeof score !== 'number') {
        return 'Awaiting Lookup';
    }
    if (score >= 20) {
        return 'High Risk';
    }
    if (score >= 10) {
        return 'Moderate Risk';
    }
    return 'Low Risk';
}

// Determine AI risk label based on AUC/confidence level (0.00-1.00)
// See documentation block above for risk stratification ranges
function determineAIRiskLabel(score) {
    if (typeof score !== 'number') {
        return 'Awaiting Lookup';
    }
    // Round to 2 decimal places for consistent comparison
    const roundedScore = Math.round(score * 100) / 100;
    if (roundedScore > 0.90) {
        return 'High Risk';
    }
    if (roundedScore >= 0.70) {
        return 'Moderate Risk';
    }
    if (roundedScore >= 0.50) {
        return 'Low Risk';
    }
    return 'Really Low Risk';
}

// Clamp AI score to valid AUC range (0.00-1.00)
function clampAIScore(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    let numeric = Number(value);
    if (Number.isNaN(numeric)) {
        return null;
    }
    
    // If value is > 1, it might be stored as percentage (e.g., 90 instead of 0.90)
    // Convert to decimal if needed
    if (numeric > 1 && numeric <= 100) {
        numeric = numeric / 100;
        console.log('Converted AI score from percentage to decimal:', numeric);
    }
    
    // Clamp to 0.00-1.00 range and round to 2 decimal places
    const clamped = Math.min(Math.max(parseFloat(numeric.toFixed(2)), 0), 1);
    return clamped;
}

function updateTextContent(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

function updateGaugeFill(id, value) {
    const el = document.getElementById(id);
    if (!el) {
        return;
    }
    el.style.width = typeof value === 'number' ? `${value}%` : '0%';
}

function updateGaugeClass(gaugeId, riskLabel) {
    const gaugeEl = document.getElementById(gaugeId);
    if (!gaugeEl) {
        return;
    }
    
    // Remove all risk classes
    gaugeEl.classList.remove('low', 'moderate', 'high', 'really-low');
    
    // Add appropriate class based on label
    if (riskLabel.includes('Really Low')) {
        gaugeEl.classList.add('really-low');
    } else if (riskLabel.includes('Low') && !riskLabel.includes('Really')) {
        gaugeEl.classList.add('low');
    } else if (riskLabel.includes('Moderate')) {
        gaugeEl.classList.add('moderate');
    } else if (riskLabel.includes('High')) {
        gaugeEl.classList.add('high');
    }
}

function updateBeginJourneyButton() {
    const beginButton = document.getElementById('beginJourneyButton');
    if (!beginButton) {
        return;
    }
    
    // Enable button only if user is authenticated AND verified
    const shouldEnable = isUserAuthenticated && isUserVerified;
    beginButton.disabled = !shouldEnable;
    
    if (!shouldEnable) {
        beginButton.title = isUserAuthenticated 
            ? 'Please verify your ID and date of birth first'
            : 'Please sign in and verify your identity first';
    } else {
        beginButton.title = '';
    }
}

// Initialize interactive score icon tooltips
function initializeScoreTooltips() {
    const iconButtons = document.querySelectorAll('.score-icon-button');
    let clickedTooltip = null; // Track which tooltip was clicked to stay open
    
    iconButtons.forEach(button => {
        const scoreType = button.getAttribute('data-score-type');
        const tooltipId = scoreType === 'frs' ? 'frsTooltip' : 'aiTooltip';
        const tooltip = document.getElementById(tooltipId);
        
        if (!tooltip) {
            return;
        }
        
        // Click to toggle tooltip (stays open until clicked again or outside)
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const wasActive = tooltip.classList.contains('active');
            
            // Close all tooltips first
            document.querySelectorAll('.score-info-tooltip').forEach(t => {
                t.classList.remove('active');
                t.classList.remove('left-side'); // Reset positioning
            });
            clickedTooltip = null;
            
            // If it wasn't active, open it and mark as clicked
            if (!wasActive) {
                tooltip.classList.add('active');
                clickedTooltip = tooltip;
                
                // Check if tooltip would go off-screen and position on left if needed
                setTimeout(() => {
                    const rect = tooltip.getBoundingClientRect();
                    const viewportWidth = window.innerWidth;
                    
                    if (rect.right > viewportWidth - 20) {
                        // Position on left side instead
                        tooltip.classList.add('left-side');
                    }
                }, 10);
            }
        });
        
        // Hover to show tooltip (only if not clicked open)
        let hoverTimeout;
        button.addEventListener('mouseenter', () => {
            if (clickedTooltip !== tooltip) {
                hoverTimeout = setTimeout(() => {
                    if (clickedTooltip !== tooltip) {
                        tooltip.classList.add('active');
                        // Check positioning on hover too
                        setTimeout(() => {
                            const rect = tooltip.getBoundingClientRect();
                            const viewportWidth = window.innerWidth;
                            if (rect.right > viewportWidth - 20) {
                                tooltip.classList.add('left-side');
                            }
                        }, 10);
                    }
                }, 400); // Small delay to prevent accidental triggers
            }
        });
        
        button.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimeout);
            // Only hide if it wasn't clicked open
            if (clickedTooltip !== tooltip) {
                tooltip.classList.remove('active');
            }
        });
        
        // Keep tooltip open when hovering over it
        tooltip.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
        });
        
        tooltip.addEventListener('mouseleave', () => {
            // Only hide if it wasn't clicked open
            if (clickedTooltip !== tooltip) {
                tooltip.classList.remove('active');
            }
        });
    });
    
    // Close tooltips when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.score-icon-button') && !e.target.closest('.score-info-tooltip')) {
            document.querySelectorAll('.score-info-tooltip').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
            clickedTooltip = null;
        }
    });
    
    // Close tooltips on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.score-info-tooltip').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
            clickedTooltip = null;
        }
    });
}

