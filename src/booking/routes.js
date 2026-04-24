const router = require("express").Router()
const ctrl = require("./controllers")
const auth = require("../middleware/auth")

// USER routes
router.post("/", auth, ctrl.createBooking)
router.get("/mine", auth, ctrl.getMyBookings)
router.get("/available-slots", auth, ctrl.getAvailableSlots)

// MECHANIC routes
router.get("/mechanic", auth, ctrl.getMechanicBookings)

module.exports = router