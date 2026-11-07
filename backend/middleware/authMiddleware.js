import jwt from 'jsonwebtoken';

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