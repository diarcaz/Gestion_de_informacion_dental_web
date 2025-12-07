// ============================================
// AUTH MODULE - SECURE VERSION
// ============================================

import PasswordHash from '../utils/password-hash.js';

export const ROLES = {
    ADMIN: 'dentist',
    RECEPTION: 'receptionist'
};

// Login attempts tracking for brute force protection
const loginAttempts = {};
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const DEFAULT_USERS = [
    {
        id: 1,
        username: 'admin',
        // Password: admin123 (hashed)
        password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        name: 'Dr. Admin',
        role: ROLES.ADMIN
    },
    {
        id: 2,
        username: 'recepcion',
        // Password: 123 (hashed)
        password: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
        name: 'Recepción',
        role: ROLES.RECEPTION
    }
];

const Auth = {
    currentUser: null,
    users: [],

    init() {
        // Load users from localStorage
        try {
            const savedUsers = localStorage.getItem('dental_users');
            if (savedUsers) {
                this.users = JSON.parse(savedUsers);
            } else {
                // First time load: seed with default users
                this.users = DEFAULT_USERS;
                this.saveUsers();
            }

            // Load current session
            const savedSession = localStorage.getItem('dental_user');
            if (savedSession) {
                const session = JSON.parse(savedSession);

                // Check session expiration
                if (session.expiresAt && session.expiresAt < Date.now()) {
                    console.log('Session expired');
                    this.logout();
                    return;
                }

                this.currentUser = session.user;
                // Verify if user still exists
                const validUser = this.users.find(u => u.username === this.currentUser.username);
                if (!validUser) {
                    this.logout();
                } else {
                    this.currentUser = validUser;
                }
            }
        } catch (e) {
            console.error('Auth init error:', e);
            this.users = DEFAULT_USERS;
        }
    },

    saveUsers() {
        try {
            localStorage.setItem('dental_users', JSON.stringify(this.users));
        } catch (e) {
            console.error('Error saving users:', e);
        }
    },

    async login(username, password) {
        // Ensure users are loaded
        if (this.users.length === 0) this.init();

        // Check for lockout
        const attemptKey = `attempts_${username}`;
        const lockoutKey = `lockout_${username}`;
        const attempts = loginAttempts[attemptKey] || 0;
        const lockoutUntil = loginAttempts[lockoutKey] || 0;

        if (lockoutUntil > Date.now()) {
            const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
            return {
                success: false,
                message: `Demasiados intentos fallidos. Intenta de nuevo en ${remainingMinutes} minuto(s).`
            };
        }

        // Reset attempts if lockout expired
        if (lockoutUntil > 0 && lockoutUntil <= Date.now()) {
            loginAttempts[attemptKey] = 0;
            loginAttempts[lockoutKey] = 0;
        }

        const user = this.users.find(u => u.username === username);

        if (user) {
            // Verify password hash
            const isValid = await PasswordHash.verify(password, user.password);

            if (isValid) {
                // Reset attempts on successful login
                loginAttempts[attemptKey] = 0;
                loginAttempts[lockoutKey] = 0;

                this.currentUser = user;

                // Create session with expiration (8 hours)
                const session = {
                    user: user,
                    expiresAt: Date.now() + (8 * 60 * 60 * 1000)
                };

                try {
                    localStorage.setItem('dental_user', JSON.stringify(session));
                } catch (e) {
                    console.error('Session save error', e);
                }

                return { success: true };
            }
        }

        // Increment failed attempts
        loginAttempts[attemptKey] = attempts + 1;

        if (loginAttempts[attemptKey] >= MAX_ATTEMPTS) {
            loginAttempts[lockoutKey] = Date.now() + LOCKOUT_DURATION;
            return {
                success: false,
                message: `Demasiados intentos fallidos. Cuenta bloqueada por ${LOCKOUT_DURATION / 60000} minutos.`
            };
        }

        return {
            success: false,
            message: `Credenciales incorrectas. Intentos restantes: ${MAX_ATTEMPTS - loginAttempts[attemptKey]}`
        };
    },

    async register(userData) {
        // Validate password strength
        const validation = PasswordHash.validate(userData.password);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        // Check if username exists
        if (this.users.some(u => u.username === userData.username)) {
            return { success: false, message: 'El nombre de usuario ya existe' };
        }

        // Hash password
        const hashedPassword = await PasswordHash.hash(userData.password);

        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: hashedPassword,
            name: userData.name,
            role: userData.role || ROLES.RECEPTION
        };

        this.users.push(newUser);
        this.saveUsers();
        return { success: true, message: 'Usuario registrado exitosamente' };
    },

    async updatePassword(username, newPassword) {
        // Validate password strength
        const validation = PasswordHash.validate(newPassword);
        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        const userIndex = this.users.findIndex(u => u.username === username);
        if (userIndex !== -1) {
            // Hash new password
            const hashedPassword = await PasswordHash.hash(newPassword);

            this.users[userIndex].password = hashedPassword;
            this.saveUsers();

            // If updating current user, update session too
            if (this.currentUser && this.currentUser.username === username) {
                this.currentUser.password = hashedPassword;
                const session = {
                    user: this.currentUser,
                    expiresAt: Date.now() + (8 * 60 * 60 * 1000)
                };
                try {
                    localStorage.setItem('dental_user', JSON.stringify(session));
                } catch (e) { }
            }
            return { success: true };
        }
        return { success: false, message: 'Usuario no encontrado' };
    },

    logout() {
        this.currentUser = null;
        try {
            localStorage.removeItem('dental_user');
        } catch (e) { }
        window.location.reload();
    },

    isLoggedIn() {
        return !!this.currentUser;
    },

    getUser() {
        return this.currentUser;
    },

    // Permission checks
    canDeletePatients() {
        return this.currentUser && this.currentUser.role === ROLES.ADMIN;
    },

    canManageInventory() {
        return true;
    },

    canExportData() {
        return this.currentUser && this.currentUser.role === ROLES.ADMIN;
    }
};

export default Auth;
