import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { queryOne, run } from './db/db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'shophatbd_super_secure_jwt_secret_key_2026_bd';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role_id: string;
  password_changed: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role_id: user.role_id,
      password_changed: user.password_changed
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    return;
  }

  // Refresh user state from database to ensure up-to-date password_changed & role
  const user = queryOne<AuthUser>(
    'SELECT id, name, username, email, phone, role_id, password_changed FROM users WHERE id = ?',
    [decoded.id]
  );

  if (!user) {
    res.status(403).json({ success: false, message: 'User account no longer exists.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticateToken(req, res, () => {
    if (!req.user || (req.user.role_id !== 'admin' && req.user.role_id !== 'super_admin')) {
      res.status(403).json({ success: false, message: 'Access denied. Administrator privilege required.' });
      return;
    }
    next();
  });
}

export function logAdminAction(
  adminId: string,
  adminName: string,
  action: string,
  entityType: string,
  entityId: string | null = null,
  details: string | null = null,
  ipAddress: string = '127.0.0.1'
): void {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  run(
    `INSERT INTO admin_logs (id, admin_id, admin_name, action, entity_type, entity_id, details, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [logId, adminId, adminName, action, entityType, entityId, details, ipAddress]
  );
}
