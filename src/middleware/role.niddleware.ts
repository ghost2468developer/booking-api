import { Request, Response, NextFunction } from 'express'

export const requireRole = (roles: string[]) => {
	return (req: any, res: Response, next: NextFunction) => {
		const userRole = req.user?.role
		if (!userRole) {
			return res.status(401).json({ error: 'Unauthorized' })
		}
		if (!roles.includes(userRole)) {
			return res.status(403).json({ error: 'Forbidden: Access denied' })
		}
		next()
	}
}