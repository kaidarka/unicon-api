import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from 'express';

interface AuthenticatedRequest extends Request {
    authorization?: string;
    user?: {
        id: string;
        email: string;
    }
}

export function generateToken(userId: string, email: string): string {
    return jwt.sign({userId, email}, process.env.JWT_SECRET!, {
        expiresIn: '1h',
    });
}
// TODO переделать методы с токенами как в другом проекте
export function checkAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send('Authentication required');
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
            userId: string;
            email: string;
        };
        req.user = { id: payload.userId, email: payload.email };
        next();
    } catch (err) {
        return res.status(401).send('Invalid token');
    }
}
