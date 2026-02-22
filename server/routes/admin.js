import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [userStats] = await query('SELECT COUNT(*) as total FROM users');
    const [taskStats] = await query('SELECT COUNT(*) as total FROM brand_identification_tasks');
    const [completedStats] = await query('SELECT COUNT(*) as total FROM brand_identification_tasks WHERE status = "completed"');
    const [revenueStats] = await query('SELECT SUM(actual_reward) as total FROM brand_identification_tasks WHERE status = "completed"');

    res.json({
      total_users: userStats[0].total,
      total_tasks: taskStats[0].total,
      completed_tasks: completedStats[0].total,
      total_revenue: revenueStats[0].total || 0
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await query(
      `SELECT u.id, u.email, u.role, u.created_at,
              up.full_name, up.vip_tier,
              w.balance, w.total_earned,
              COUNT(DISTINCT bit.id) as tasks_completed
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN wallets w ON u.id = w.user_id
       LEFT JOIN brand_identification_tasks bit ON u.id = bit.assigned_to AND bit.status = 'completed'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    await query('DELETE FROM earnings WHERE user_id = ?', [userId]);
    await query('DELETE FROM brand_identification_tasks WHERE assigned_to = ?', [userId]);
    await query('DELETE FROM payment_methods WHERE user_id = ?', [userId]);
    await query('DELETE FROM wallets WHERE user_id = ?', [userId]);
    await query('DELETE FROM user_profiles WHERE user_id = ?', [userId]);
    await query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, brand, category, image_url, description } = req.body;

    const result = await query(
      'INSERT INTO products (name, brand, category, image_url, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [name, brand, category, image_url, description]
    );

    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, brand, category, image_url, description } = req.body;

    await query(
      'UPDATE products SET name = ?, brand = ?, category = ?, image_url = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [name, brand, category, image_url, description, productId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    await query('DELETE FROM brand_identification_tasks WHERE product_id = ?', [productId]);
    await query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.post('/tasks/generate', async (req, res) => {
  try {
    const { product_id, quantity, reward_per_task } = req.body;

    const [products] = await query('SELECT * FROM products WHERE id = ?', [product_id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const users = await query('SELECT id FROM users WHERE role = "user"');

    if (users.length === 0) {
      return res.status(400).json({ error: 'No users available for task assignment' });
    }

    const decoyBrands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour', 'New Balance'].filter(b => b !== product.brand);

    for (let i = 0; i < quantity; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const shuffledDecoys = [...decoyBrands].sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [product.brand, ...shuffledDecoys].sort(() => Math.random() - 0.5);

      await query(
        `INSERT INTO brand_identification_tasks
         (product_id, assigned_to, correct_brand, brand_options, reward_amount, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [product_id, randomUser.id, product.brand, JSON.stringify(allOptions), reward_per_task]
      );
    }

    res.json({ success: true, generated: quantity });
  } catch (error) {
    console.error('Generate tasks error:', error);
    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

router.get('/payment-gateways', async (req, res) => {
  try {
    const gateways = await query('SELECT * FROM payment_gateways ORDER BY created_at DESC');
    res.json(gateways);
  } catch (error) {
    console.error('Get payment gateways error:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateways' });
  }
});

router.post('/payment-gateways', async (req, res) => {
  try {
    const { name, type, api_key, api_secret, webhook_url, is_active, config } = req.body;

    const result = await query(
      `INSERT INTO payment_gateways (name, type, api_key, api_secret, webhook_url, is_active, config, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, type, api_key, api_secret, webhook_url, is_active, JSON.stringify(config)]
    );

    res.json({ id: result.insertId, success: true });
  } catch (error) {
    console.error('Create payment gateway error:', error);
    res.status(500).json({ error: 'Failed to create payment gateway' });
  }
});

router.put('/payment-gateways/:gatewayId', async (req, res) => {
  try {
    const { gatewayId } = req.params;
    const { name, type, api_key, api_secret, webhook_url, is_active, config } = req.body;

    await query(
      `UPDATE payment_gateways
       SET name = ?, type = ?, api_key = ?, api_secret = ?, webhook_url = ?, is_active = ?, config = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, type, api_key, api_secret, webhook_url, is_active, JSON.stringify(config), gatewayId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Update payment gateway error:', error);
    res.status(500).json({ error: 'Failed to update payment gateway' });
  }
});

router.delete('/payment-gateways/:gatewayId', async (req, res) => {
  try {
    const { gatewayId } = req.params;
    await query('DELETE FROM payment_gateways WHERE id = ?', [gatewayId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete payment gateway error:', error);
    res.status(500).json({ error: 'Failed to delete payment gateway' });
  }
});

export default router;
