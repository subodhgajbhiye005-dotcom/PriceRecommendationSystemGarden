require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.static('static'));
app.use('/static', express.static('static'));

// Session middleware
app.use(session({
    secret: 'hyperx-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            db.get('SELECT * FROM users WHERE email = ?', [profile.emails[0].value], async (err, user) => {
                if (err) return done(err);

                if (user) {
                    // User exists, update Google ID if not set
                    if (!user.google_id) {
                        db.run('UPDATE users SET google_id = ? WHERE user_id = ?', [profile.id, user.user_id]);
                    }
                    return done(null, user);
                } else {
                    // Create new user
                    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10);
                    const newUser = {
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        google_id: profile.id,
                        password_hash: hashedPassword,
                        user_type: 'customer'
                    };

                    db.run(`INSERT INTO users (name, email, google_id, password_hash, user_type, created_at)
                       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                        [newUser.name, newUser.email, newUser.google_id, newUser.password_hash, newUser.user_type],
                        function (err) {
                            if (err) return done(err);
                            newUser.user_id = this.lastID;
                            return done(null, newUser);
                        });
                }
            });
        } catch (error) {
            return done(error);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser((id, done) => {
    db.get('SELECT * FROM users WHERE user_id = ?', [id], (err, user) => {
        done(err, user);
    });
});

// Database setup
// const db = new sqlite3.Database('./price_recommendation.db', (err) => {
//     if (err) {
//         console.error('Error opening database:', err.message);
//     } else {
//         console.log('Connected to SQLite database.');
//         initializeDatabase();
//     }
// });

// Initialize database tables
// function initializeDatabase() {
//     const fs = require('fs');
//     const schema = fs.readFileSync('database_schema.sql', 'utf8');

//     // Create new tables (don't drop existing ones for now)
//     db.exec(schema, (err) => {
//         if (err) {
//             console.error('Error initializing database:', err.message);
//         } else {
//             console.log('Database initialized successfully.');
//         }
//     });
// }

// Routes

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve standalone login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve standalone register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Serve admin login page
app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_login.html'));
});

// Serve simple login page
app.get('/simple-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'simple-login.html'));
});

// Serve customer info page
app.get('/customer-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'customer-info.html'));
});

// Serve services page
app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

// Serve Google OAuth setup page
app.get('/google-setup', (req, res) => {
    res.sendFile(path.join(__dirname, 'google-setup.html'));
});

// Serve forgot password page
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'forgot_password.html'));
});

// Serve AI Analysis page
app.get('/ai-analysis', (req, res) => {
    res.sendFile(path.join(__dirname, 'ai_analysis.html'));
});

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, redirect to home
        res.redirect('/');
    }
);

// Logout route
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/login');
        });
    });
});

// Get all users
app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get specific user by ID
app.get('/api/users/:id', requireAuth, (req, res) => {
    const userId = req.params.id;

    // Only allow users to view their own data or admins to view all
    if (req.session.userId != userId && req.session.userType !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    db.get('SELECT * FROM users WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(row);
    });
});

// Get all gardeners
app.get('/api/gardeners', (req, res) => {
    db.all('SELECT * FROM gardeners', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get price recommendation (requires authentication)
app.post('/api/price-recommendation', requireAuth, (req, res) => {
    const { user_id, gardener_id, location } = req.body;

    if (!user_id || !gardener_id || !location) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get external data from cache
    db.get('SELECT * FROM external_data_cache WHERE location = ? AND expires_at > datetime("now")',
        [location], (err, externalData) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!externalData) {
                return res.status(404).json({ error: 'No external data available for this location' });
            }

            // Simple price calculation logic (you can replace with your ML models)
            const basePrice = externalData.competitor_price;
            const demandMultiplier = externalData.market_demand;
            const predictedDemand = Math.round(demandMultiplier * 100) / 100;

            // Calculate final price with some business logic
            let finalPrice = basePrice;
            let discount = 0;
            let offer = 'Standard Service';

            // Apply discounts based on demand
            if (predictedDemand > 0.8) {
                discount = 10;
                finalPrice = basePrice * 0.9;
                offer = 'High Demand Special';
            } else if (predictedDemand < 0.6) {
                discount = 5;
                finalPrice = basePrice * 0.95;
                offer = 'Early Bird Discount';
            }

            const recommendation = {
                predicted_demand: predictedDemand,
                base_price: Math.round(basePrice * 100) / 100,
                final_price: Math.round(finalPrice * 100) / 100,
                discount: discount,
                offer: offer
            };

            // Save recommendation to database
            db.run(`INSERT INTO price_recommendations
                (user_id, gardener_id, location, predicted_demand, base_price, final_price, discount, recommended_offer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [user_id, gardener_id, location, predictedDemand, basePrice, finalPrice, discount, offer],
                function (err) {
                    if (err) {
                        console.error('Error saving recommendation:', err.message);
                    }
                });

            res.json(recommendation);
        });
});

// Get recommendation history
app.get('/api/recommendations', (req, res) => {
    const { user_id, limit = 10 } = req.query;

    let query = 'SELECT * FROM price_recommendations ORDER BY created_at DESC';
    let params = [];

    if (user_id) {
        query = 'SELECT * FROM price_recommendations WHERE user_id = ? ORDER BY created_at DESC';
        params = [user_id];
    }

    if (limit) {
        query += ' LIMIT ?';
        params.push(parseInt(limit));
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
}

// Authentication routes

// Register new user
app.post('/api/register', async (req, res) => {
    const {
        name,
        email,
        mobile,
        address,
        dateOfBirth,
        gender,
        userType,
        password,
        location
    } = req.body;

    if (!name || !email || !password || !mobile || !address || !userType) {
        return res.status(400).json({ error: 'Name, email, mobile, address, user type, and password are required' });
    }

    try {
        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user with all new fields
        db.run(`INSERT INTO users (name, email, mobile, street_address, city, state, zip_code, country, date_of_birth, gender, user_type, password_hash, location)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                email,
                mobile,
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country,
                dateOfBirth,
                gender,
                userType,
                passwordHash,
                location
            ],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                // Auto-login after registration
                req.session.userId = this.lastID;
                req.session.userName = name;
                req.session.userType = userType;

                res.json({
                    message: 'User registered successfully',
                    user: {
                        id: this.lastID,
                        name,
                        email,
                        mobile,
                        userType,
                        location
                    }
                });
            });
    } catch (error) {
        res.status(500).json({ error: 'Error hashing password' });
    }
});



// Remember me token functions
function generateRememberToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

function createRememberToken(userId, callback) {
    const token = generateRememberToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    db.run(`INSERT INTO remember_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [userId, token, expiresAt.toISOString()],
        function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, token);
        });
}

function validateRememberToken(token, callback) {
    db.get(`SELECT rt.*, u.name, u.email, u.user_type, u.location
            FROM remember_tokens rt
            JOIN users u ON rt.user_id = u.user_id
            WHERE rt.token = ? AND rt.expires_at > datetime('now') AND u.is_active = 1`,
        [token], (err, row) => {
            if (err) {
                return callback(err);
            }

            if (!row) {
                return callback(null, null);
            }

            // Clean up expired tokens
            db.run(`DELETE FROM remember_tokens WHERE expires_at <= datetime('now')`);

            callback(null, row);
        });
}

// Remember me login endpoint
app.post('/api/login-remember', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    validateRememberToken(token, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Set session
        req.session.userId = user.user_id;
        req.session.userName = user.name;
        req.session.userType = user.user_type;

        res.json({
            message: 'Login successful',
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                userType: user.user_type,
                location: user.location
            }
        });
    });
});

// Enhanced login with remember me support
app.post('/api/login', (req, res) => {
    const { email, password, userType, rememberMe } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    // Build query based on userType if specified
    let query = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
    let params = [email];

    if (userType) {
        query += ' AND user_type = ?';
        params.push(userType);
    }

    db.get(query, params, async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email, password, or account type' });
        }

        try {
            const isValidPassword = await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Set session
            req.session.userId = user.user_id;
            req.session.userName = user.name;
            req.session.userType = user.user_type;

            let responseData = {
                message: 'Login successful',
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    userType: user.user_type,
                    location: user.location
                }
            };

            // Create remember me token if requested
            if (rememberMe) {
                createRememberToken(user.user_id, (err, token) => {
                    if (err) {
                        console.error('Error creating remember token:', err);
                    } else {
                        responseData.rememberToken = token;
                        res.json(responseData);
                    }
                });
            } else {
                res.json(responseData);
            }

        } catch (error) {
            res.status(500).json({ error: 'Error verifying password' });
        }
    });
});

// Password reset request endpoint
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    db.get('SELECT user_id, name FROM users WHERE email = ? AND is_active = 1', [email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If an account with this email exists, a password reset link has been sent.' });
        }

        // Generate reset token (simplified - in production, use proper token generation)
        const resetToken = generateRememberToken();
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

        // Store reset token (in production, you'd want a separate table for this)
        db.run(`UPDATE users SET password_hash = ? WHERE user_id = ?`,
            [`RESET_TOKEN:${resetToken}:${expiresAt.getTime()}`, user.user_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error processing reset request' });
                }

                // In production, send email here
                console.log(`Password reset for ${email}: ${resetToken}`);

                res.json({
                    message: 'If an account with this email exists, a password reset link has been sent.',
                    resetToken: resetToken // Remove in production
                });
            });
    });
});

// Password reset confirmation endpoint
app.post('/api/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Find user with reset token
    db.get('SELECT user_id, password_hash FROM users WHERE password_hash LIKE ?', [`RESET_TOKEN:${token}:%`], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const tokenData = user.password_hash.split(':');
        if (tokenData.length !== 3) {
            return res.status(400).json({ error: 'Invalid reset token format' });
        }

        const expiresAt = parseInt(tokenData[2]);
        if (Date.now() > expiresAt) {
            return res.status(400).json({ error: 'Reset token has expired' });
        }

        try {
            // Hash new password
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            db.run('UPDATE users SET password_hash = ? WHERE user_id = ?', [passwordHash, user.user_id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.json({ message: 'Password reset successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: 'Error resetting password' });
        }
    });
});

// Enhanced logout with remember token cleanup
app.post('/api/logout', (req, res) => {
    const userId = req.session.userId;

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Error logging out' });
        }

        // Clean up remember tokens for this user
        if (userId) {
            db.run('DELETE FROM remember_tokens WHERE user_id = ?', [userId], (err) => {
                if (err) {
                    console.error('Error cleaning up remember tokens:', err);
                }
            });
        }

        res.json({ message: 'Logout successful' });
    });
});

// Get current user
app.get('/api/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    db.get('SELECT user_id, name, email, mobile, user_type, location FROM users WHERE user_id = ?',
        [req.session.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.user_id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    userType: user.user_type,
                    location: user.location
                }
            });
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Access the web interface at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    if (typeof db !== 'undefined') {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    if (typeof db !== 'undefined') {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed.');
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});