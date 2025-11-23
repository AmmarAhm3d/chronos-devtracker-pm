import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
export const generateToken = (payload) => {
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d');
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
