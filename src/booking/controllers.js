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

const getDayName = (date) => {
  return new Date(date)
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase(); // MON, TUE, etc.
}

const isWithinWorkingHours = (timeSlot, startHour, endHour) => {
  return timeSlot >= startHour && timeSlot <= endHour
}

exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.id
    const { mechanicId, date, timeSlot } = req.body

    // 1. Validate mechanic
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId }
    })

    if (!mechanic || mechanic.role !== "MECHANIC") {
      return res.status(400).json({ message: "Invalid mechanic" })
    }

    // 2. Check working days
    const day = getDayName(date) // MON, TUE, etc.

    if (mechanic.workingDays) {
      const allowedDays = mechanic.workingDays.split(",")

      if (!allowedDays.includes(day)) {
        return res.status(400).json({
          message: `Mechanic does not work on ${day}`
        })
      }
    }

    // 3. Check working hours
    if (mechanic.startHour && mechanic.endHour) {
      if (!isWithinWorkingHours(timeSlot, mechanic.startHour, mechanic.endHour)) {
        return res.status(400).json({
          message: `Outside working hours (${mechanic.startHour} - ${mechanic.endHour})`
        })
      }
    }

    // 4. Prevent double booking
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
        message: "This slot is already booked"
      })
    }

    // 5. Create booking
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

exports.getAvailableSlots = async (req, res) => {
  try {
    const { mechanicId, date } = req.query

    // 1. Get mechanic
    const mechanic = await prisma.user.findUnique({
      where: { id: mechanicId }
    })

    if (!mechanic || mechanic.role !== "MECHANIC") {
      return res.status(400).json({ message: "Invalid mechanic" })
    }

    // 2. Check working days
    const day = getDayName(date)

    if (mechanic.workingDays) {
      const allowedDays = mechanic.workingDays.split(",")

      if (!allowedDays.includes(day)) {
        return res.json({
          date,
          mechanicId,
          availableSlots: [],
          message: `Mechanic does not work on ${day}`
        })
      }
    }

    // 3. Get existing bookings for that day
    const bookings = await prisma.booking.findMany({
      where: {
        mechanicId,
        date: new Date(date),
        status: { not: "CANCELLED" }
      },
      select: {
        timeSlot: true
      }
    })

    const bookedSlots = bookings.map((b) => b.timeSlot)

    // 4. Filter available slots
    let availableSlots = TIME_SLOTS.filter(
      (slot) => !bookedSlots.includes(slot)
    )

    // 5. Apply working hours filter
    if (mechanic.startHour && mechanic.endHour) {
      availableSlots = availableSlots.filter((slot) => {
        return slot >= mechanic.startHour && slot <= mechanic.endHour
      })
    }

    res.json({
      date,
      mechanicId,
      availableSlots,
      bookedSlots
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role
    const { id } = req.params

    // 1. Find booking
    const booking = await prisma.booking.findUnique({
      where: { id }
    })

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // 2. Prevent cancelling completed bookings
    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed bookings cannot be cancelled"
      })
    }

    // USER RULES
    if (userRole === "USER") {
      if (booking.userId !== userId) {
        return res.status(403).json({
          message: "You can only cancel your own bookings"
        })
      }

      if (booking.status === "CANCELLED") {
        return res.status(400).json({
          message: "Booking already cancelled"
        })
      }
    }

    // MECHANIC RULES
    if (userRole === "MECHANIC") {
      if (booking.mechanicId !== userId) {
        return res.status(403).json({
          message: "You can only manage your assigned bookings"
        })
      }
    }

    // 3. Cancel booking
    const cancelled = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED"
      }
    })

    res.json({
      message: "Booking cancelled successfully",
      booking: cancelled
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}