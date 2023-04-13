import jwt from 'jsonwebtoken';
import { type NextFunction, type Request, type Response } from 'express';

interface AuthenticatedRequest extends Request {
  authorization?: string
  user?: {
    id: string
    email: string
  }
}

export function generateToken (userId: string, email: string): string {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET ?? 'mysecret', {
    expiresIn: '1h'
  });
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function checkAuth (req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (token == null) {
    return res.status(401).send('Authentication required');
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'mysecret') as {
      userId: string
      email: string
    };
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
}
