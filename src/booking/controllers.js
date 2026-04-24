const prisma = require("../prisma")

/**
 * CREATE BOOKING (USER ONLY)
 */
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id
    const { mechanicId, date } = req.body

    // 1. Check if mechanic exists
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId }
    })

    if (!mechanic || mechanic.role !== "MECHANIC") {
      return res.status(400).json({ message: "Invalid mechanic" })
    }

    // 2. Prevent double booking (same mechanic + same time)
    const conflict = await prisma.booking.findFirst({
      where: {
        mechanicId,
        date: new Date(date),
        status: {
          not: "CANCELLED"
        }
      }
    })

    if (conflict) {
      return res.status(400).json({
        message: "This mechanic is already booked for this time"
      })
    }

    // 3. Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        mechanicId,
        date: new Date(date)
      }
    })

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        mechanic: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMechanicBookings = async (req, res) => {
  try {
    if (req.user.role !== "MECHANIC") {
      return res.status(403).json({ message: "Forbidden" })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        mechanicId: req.user.id
      },
      include: {
        user: true
      },
      orderBy: {
        date: "asc"
      }
    })

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}