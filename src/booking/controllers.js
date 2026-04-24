const prisma = require("../prisma")

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00"
]

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id
    const { mechanicId, date, timeSlot } = req.body

    // validate time slot
    if (!TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({ message: "Invalid time slot" })
    }

    // check mechanic
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId }
    })

    if (!mechanic || mechanic.role !== "MECHANIC") {
      return res.status(400).json({ message: "Invalid mechanic" });
    }

    // prevent double booking
    const conflict = await prisma.booking.findFirst({
      where: {
        mechanicId,
        date: new Date(date),
        timeSlot,
        status: { not: "CANCELLED" }
      }
    })

    if (conflict) {
      return res.status(400).json({
        message: "Slot already booked"
      })
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        mechanicId,
        date: new Date(date),
        timeSlot
      }
    })

    res.json(booking)
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