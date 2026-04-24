const prisma = require("../prisma")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const exists = await prisma.user.findUnique({
      where: { email }
    })

    if (exists) {
      return res.status(400).json({ message: "User already exists" })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role || "USER"
      }
    })

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
}

exports.getMechanics = async (req, res) => {
  try {
    const mechanics = await prisma.user.findMany({
      where: {
        role: "MECHANIC"
      },
      select: {
        id: true,
        name: true,
        email: true,
        workingDays: true,
        startHour: true,
        endHour: true
      }
    })

    res.json(mechanics);
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}