// Global variables
let currentUser = null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    // checkAuthStatus();  // Commented out since no auth in this app

    // Setup form event listeners
    // setupAuthEventListeners();  // Commented out since no auth
    setupRecommendationEventListeners();
});

// Authentication event listeners
function setupAuthEventListeners() {
    // Login form
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('showRegister').addEventListener('click', showRegisterForm);
    document.getElementById('showLogin').addEventListener('click', showLoginForm);

    // Register form
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);
}

// Recommendation event listeners
function setupRecommendationEventListeners() {
    document.getElementById('recommendationForm').addEventListener('submit', handleRecommendation);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Check if user is authenticated
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/me', {
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainApp();
        } else {
            // Redirect to login page if not authenticated
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Redirect to login page on error
        window.location.href = '/login';
    }
}

// Show authentication forms
function showAuthForms() {
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('mainSection').style.display = 'none';
}

// Show main application
function showMainApp() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('mainSection').style.display = 'block';

    // Update user info
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `<p>Welcome, <strong>${currentUser.name}</strong>! (${currentUser.email})</p>`;
}

// Show register form
function showRegisterForm(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Show login form
function showLoginForm(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            showMainApp();
            alert('Login successful!');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }

    loginBtn.disabled = false;
    loginBtn.textContent = 'Login';
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const location = document.getElementById('registerLocation').value;
    const registerBtn = document.getElementById('registerBtn');

    registerBtn.disabled = true;
    registerBtn.textContent = 'Registering...';

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ name, email, password, location })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            showMainApp();
            alert('Registration successful! You are now logged in.');
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }

    registerBtn.disabled = false;
    registerBtn.textContent = 'Register';
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            currentUser = null;
            showAuthForms();
            alert('Logged out successfully!');
        } else {
            alert('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    }
}

// Handle price recommendation
async function handleRecommendation(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const responseDiv = document.getElementById('response');

    // Get form values
    const userId = document.getElementById('userId').value;
    const gardenerId = document.getElementById('gardenerId').value;
    const location = document.getElementById('location').value;

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Getting Recommendation...';
    resultDiv.style.display = 'block';
    resultDiv.classList.remove('error');
    loadingDiv.style.display = 'block';
    responseDiv.innerHTML = '';

    try {
        // Make API request
        const response = await fetch('/price-recommendation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                gardener_id: parseInt(gardenerId),
                location: location
            })
        });

        const data = await response.json();

        // Hide loading
        loadingDiv.style.display = 'none';

        if (response.ok) {
            // Display successful result
            responseDiv.innerHTML = `
                <h3>✅ Price Recommendation</h3>
                <p><strong>Predicted Demand:</strong> ${data.predicted_demand}</p>
                <p><strong>Base Price:</strong> $${data.base_price}</p>
                <p><strong>Final Price:</strong> $${data.final_price}</p>
                <p><strong>Discount:</strong> ${data.discount}%</p>
                <p><strong>Recommended Offer:</strong> ${data.offer}</p>
            `;
        } else {
            // Display error
            resultDiv.classList.add('error');
            responseDiv.innerHTML = `<h3>❌ Error</h3><p>${data.error || 'An error occurred'}</p>`;
        }

    } catch (error) {
        // Hide loading
        loadingDiv.style.display = 'none';
        resultDiv.classList.add('error');
        responseDiv.innerHTML = `<h3>❌ Error</h3><p>Failed to connect to the server. Make sure the API is running.</p>`;
        console.error('Error:', error);
    }

    // Reset button
    submitBtn.disabled = false;
    submitBtn.textContent = 'Get Price Recommendation';
}