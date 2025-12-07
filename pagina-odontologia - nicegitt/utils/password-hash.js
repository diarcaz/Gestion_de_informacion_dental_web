// ============================================
// PASSWORD HASHING UTILITY
// ============================================

/**
 * Simple password hashing using SHA-256
 * Note: For production, consider using a proper library like bcrypt
 * This is a browser-compatible solution
 */
const PasswordHash = {
    /**
     * Hash a password using SHA-256
     * @param {string} password - Plain text password
     * @returns {Promise<string>} - Hashed password in hex format
     */
    async hash(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    /**
     * Verify a password against a hash
     * @param {string} password - Plain text password to verify
     * @param {string} hash - Stored hash to compare against
     * @returns {Promise<boolean>} - True if password matches
     */
    async verify(password, hash) {
        const passwordHash = await this.hash(password);
        return passwordHash === hash;
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} - {valid: boolean, message: string}
     */
    validate(password) {
        if (!password || password.length < 8) {
            return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
        }

        if (!/[A-Z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
        }

        if (!/[a-z]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
        }

        if (!/[0-9]/.test(password)) {
            return { valid: false, message: 'La contraseña debe contener al menos un número' };
        }

        return { valid: true };
    }
};

export default PasswordHash;
