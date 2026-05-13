import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import prisma from '../prisma/client';

const router = Router();

// CUSTOMER creates booking
router.post('/create', requireAuth, async (req: any, res) => {
	const { providerId, serviceType, date } = req.body;

	const booking = await prisma.booking.create({
		data: {
			customerId: req.userId,
			providerId,
			serviceType,
			date,
		},
	});

	res.json(booking);
});

// MECHANIC / NAIL TECH sees bookings
router.get(
	'/my-bookings',
	requireAuth,
	requireRole(['MECHANIC', 'NAIL_TECHNICIAN']),
	async (req: any, res) => {
		const bookings = await prisma.booking.findMany({
			where: {
				providerId: req.userId,
			},
		});

		res.json(bookings);
	}
);

// APPROVE booking
router.patch(
	'/approve/:id',
	requireAuth,
	requireRole(['MECHANIC', 'NAIL_TECHNICIAN']),
	async (req: any, res) => {
		const { id } = req.params;

		const booking = await prisma.booking.update({
			where: { id },
			data: { status: 'APPROVED' },
		});

		res.json(booking);
	}
);

export default router;