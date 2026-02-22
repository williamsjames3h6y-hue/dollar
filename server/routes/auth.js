import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, NOW())',
      [email, hashedPassword, 'user']
    );

    const userId = result.insertId;

    await query(
      'INSERT INTO user_profiles (user_id, full_name, vip_tier, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, full_name || email.split('@')[0], 'free']
    );

    await query(
      'INSERT INTO wallets (user_id, balance, total_earned, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [userId, 0, 0]
    );

    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const [users] = await query(
      'SELECT u.id, u.email, u.role, up.full_name, up.vip_tier FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?',
      [userId]
    );

    res.json({
      user: users[0],
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await query(
      'SELECT u.id, u.email, u.password, u.role, up.full_name, up.vip_tier FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

router.post('/signout', authenticateToken, async (req, res) => {
  res.json({ message: 'Signed out successfully' });
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT u.id, u.email, u.role, up.full_name, up.vip_tier FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
