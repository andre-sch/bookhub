import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export function generateToken(payload: object) {
    return jwt.sign(payload, env.JWT_SECRET as Secret, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);
}

export function verifyToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET as Secret);
}