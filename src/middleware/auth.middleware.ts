import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, verifyTemp2FAToken } from '../utils/token'

// Shared request type
export interface AuthedRequest extends Request {
	userId?: string
	role?: string
}

/**
 * 🔐 AUTH MIDDLEWARE
 * Verifies JWT access token and attaches userId + role
 */
export const requireAuth = (
	req: AuthedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing access token' })
		return
	}
	const token = authHeader.split(' ')[1]
	try {
		const payload = verifyAccessToken(token)
		req.userId = payload.userId
		req.role = payload.role
		next()
	} catch {
		res.status(401).json({ error: 'Invalid or expired access token' })
		return
	}
}

/**
 * 🔑 TEMP 2FA TOKEN MIDDLEWARE
 */
export const requireTempToken = (
	req: AuthedRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Missing temp token' })
		return
	}
	const token = authHeader.split(' ')[1]
	try {
		const payload = verifyTemp2FAToken(token)
		req.userId = payload.userId
		next()
	} catch {
		res.status(401).json({ error: 'Invalid or expired temp token' })
		return
	}
}

/**
 * 🛡 ROLE-BASED ACCESS CONTROL (RBAC)
 * Usage: requireRole(['ADMIN', 'MECHANIC'])
 */
export const requireRole = (roles: string[]) => {
	return (req: AuthedRequest, res: Response, next: NextFunction): void => {
		if (!req.role) {
			res.status(401).json({ error: 'No role found' })
			return
		}
		if (!roles.includes(req.role)) {
			res.status(403).json({ error: 'Forbidden - insufficient permissions' })
			return
		}
		next()
	}
}