import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
      req.user = decoded;
      return next();
    } catch {
      return res.status(401).json({ message: 'Token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
};

const moderatorIds = () => new Set(
  (process.env.MODERATOR_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
);

export const isModerator = (userId) => moderatorIds().has(userId?.toString());

export const requireModerator = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id');
    if (!user || !isModerator(user._id)) {
      return res.status(403).json({ message: 'Moderator access required.' });
    }
    req.moderator = user;
    return next();
  } catch (error) {
    return next(error);
  }
};