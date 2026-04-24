const router = require("express").Router()
const ctrl = require("./controllers")
const auth = require("../middleware/auth")

// USER routes
router.post("/", auth, ctrl.createBooking)
router.get("/mine", auth, ctrl.getMyBookings)

// MECHANIC routes
router.get("/mechanic", auth, ctrl.getMechanicBookings)

module.exports = router