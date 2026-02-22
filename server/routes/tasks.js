import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const tasks = await query(
      `SELECT bit.*, p.name as product_name, p.image_url as product_image
       FROM brand_identification_tasks bit
       LEFT JOIN products p ON bit.product_id = p.id
       WHERE bit.assigned_to = ? AND bit.status = 'pending'
       ORDER BY bit.created_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/:taskId/submit', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { selected_brand, confidence_level, notes } = req.body;

    const tasks = await query(
      'SELECT * FROM brand_identification_tasks WHERE id = ? AND assigned_to = ?',
      [taskId, req.user.id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = tasks[0];

    if (task.status !== 'pending') {
      return res.status(400).json({ error: 'Task already submitted' });
    }

    const isCorrect = selected_brand === task.correct_brand;
    const baseReward = parseFloat(task.reward_amount);
    let finalReward = baseReward;

    if (isCorrect && confidence_level === 'high') {
      finalReward = baseReward * 1.2;
    } else if (isCorrect && confidence_level === 'medium') {
      finalReward = baseReward * 1.1;
    } else if (!isCorrect) {
      finalReward = baseReward * 0.5;
    }

    await query(
      `UPDATE brand_identification_tasks
       SET status = 'completed', selected_brand = ?, confidence_level = ?,
           notes = ?, is_correct = ?, actual_reward = ?, completed_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [selected_brand, confidence_level, notes, isCorrect, finalReward, taskId]
    );

    await query(
      'UPDATE wallets SET balance = balance + ?, total_earned = total_earned + ?, updated_at = NOW() WHERE user_id = ?',
      [finalReward, finalReward, req.user.id]
    );

    await query(
      'INSERT INTO earnings (user_id, task_id, task_type, amount, earned_at) VALUES (?, ?, ?, ?, NOW())',
      [req.user.id, taskId, 'brand_identification', finalReward]
    );

    res.json({
      success: true,
      is_correct: isCorrect,
      reward: finalReward
    });
  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({ error: 'Failed to submit task' });
  }
});

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await query(
      `SELECT
        COUNT(*) as total_completed,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_count,
        SUM(actual_reward) as total_earned
       FROM brand_identification_tasks
       WHERE assigned_to = ? AND status = 'completed'`,
      [req.user.id]
    );

    const [wallet] = await query(
      'SELECT balance FROM wallets WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      ...stats[0],
      current_balance: wallet[0]?.balance || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
