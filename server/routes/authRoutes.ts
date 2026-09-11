import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, run } from '../db/db.ts';
import { generateToken, authenticateToken, AuthenticatedRequest, logAdminAction } from '../auth.ts';

const router = express.Router();

// Register new customer
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

    run(
      `INSERT INTO users (id, name, username, email, password_hash, phone, role_id, is_verified, password_changed)
       VALUES (?, ?, ?, ?, ?, ?, 'customer', 1, 1)`,
      [userId, name.trim(), username, email.toLowerCase().trim(), passwordHash, phone || null]
    );

    const user = queryOne<any>('SELECT id, name, username, email, phone, role_id, password_changed FROM users WHERE id = ?', [userId]);
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SHOPNOVA.',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// Login (Customer & Admin)
router.post('/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body; // email or username

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Email/Username and password are required.' });
      return;
    }

    const trimmedIdentifier = identifier.trim();
    const user = queryOne<any>(
      `SELECT id, name, username, email, password_hash, phone, role_id, password_changed
       FROM users
       WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`,
      [trimmedIdentifier, trimmedIdentifier]
    );

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please check your username/email and password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
      return;
    }

    const authPayload = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id,
      password_changed: user.password_changed
    };

    const token = generateToken(authPayload);

    // Audit log if admin logins
    if (user.role_id === 'admin' || user.role_id === 'super_admin') {
      logAdminAction(user.id, user.name, 'ADMIN_LOGIN', 'auth', user.id, 'Administrator logged in successfully', req.ip || '127.0.0.1');
    }

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: authPayload,
      requiresPasswordChange: user.role_id === 'super_admin' && user.password_changed === 0
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// Get current authenticated user
router.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Change Password
router.post('/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentPassword = req.body.current_password || req.body.currentPassword;
    const newPassword = req.body.new_password || req.body.newPassword;
    const user = req.user!;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (!currentPassword) {
      res.status(400).json({ success: false, message: 'Current password is required.' });
      return;
    }

    const dbUser = queryOne<any>('SELECT password_hash FROM users WHERE id = ?', [user.id]);
    if (!dbUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = bcrypt.compareSync(currentPassword, dbUser.password_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    run('UPDATE users SET password_hash = ?, password_changed = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newHash, user.id]);

    if (user.role_id === 'admin' || user.role_id === 'super_admin') {
      logAdminAction(user.id, user.name, 'CHANGE_PASSWORD', 'user', user.id, 'Admin password changed successfully', req.ip || '127.0.0.1');
    }

    res.json({
      success: true,
      message: 'Password updated successfully! Security warning resolved.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

// Update Profile
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, email, username } = req.body;
    const user = req.user!;

    if (!name || !String(name).trim()) {
      res.status(400).json({ success: false, message: 'Name cannot be empty.' });
      return;
    }

    let finalUsername = user.username;
    if (username !== undefined && username !== null) {
      const trimmedUsername = String(username).trim().toLowerCase();
      if (!trimmedUsername || trimmedUsername.length < 3) {
        res.status(400).json({ success: false, message: 'Username must be at least 3 characters long.' });
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        res.status(400).json({ success: false, message: 'Username can only contain English letters, numbers, and underscores (_).' });
        return;
      }
      const existing = queryOne<any>('SELECT id FROM users WHERE LOWER(username) = ? AND id != ?', [trimmedUsername, user.id]);
      if (existing) {
        res.status(400).json({ success: false, message: 'This username is already taken by another user. Please choose another.' });
        return;
      }
      finalUsername = trimmedUsername;
    }

    let finalEmail = user.email;
    if (email !== undefined && email !== null) {
      const trimmedEmail = String(email).trim().toLowerCase();
      if (trimmedEmail && trimmedEmail !== (user.email || '').toLowerCase()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
          return;
        }

        const existing = queryOne<any>('SELECT id FROM users WHERE LOWER(email) = ? AND id != ?', [trimmedEmail, user.id]);
        if (existing) {
          res.status(400).json({ success: false, message: 'This email is already used by another account.' });
          return;
        }
        finalEmail = trimmedEmail;
      }
    }

    run('UPDATE users SET name = ?, username = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
      String(name).trim(),
      finalUsername,
      phone ? String(phone).trim() : null,
      finalEmail,
      user.id
    ]);

    if (user.role_id === 'admin' || user.role_id === 'super_admin') {
      logAdminAction(user.id, String(name).trim(), 'UPDATE_ADMIN_PROFILE', 'user', user.id, `Admin profile updated: username=${finalUsername}, name=${String(name).trim()}`, req.ip || '127.0.0.1');
    }

    const updatedUser = queryOne<any>('SELECT id, name, username, email, phone, role_id, password_changed FROM users WHERE id = ?', [user.id]);

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

export default router;
