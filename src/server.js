require("dotenv").config()
const express = require("express")
const cors = require("cors")

const authRoutes = require("./user/routes")
const bookingRoutes = require("./booking/routes")

const app = express()

// middleware
app.use(cors())
app.use(express.json())

// routes
app.use("/api/auth", authRoutes)
app.use("/api/bookings", bookingRoutes)

// health check
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})