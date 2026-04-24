const router = require("express").Router()
const ctrl = require("./controllers")
const auth = require("../middleware/auth")

router.post("/", auth, ctrl.createBooking)
router.get("/mine", auth, ctrl.getMyBookings)
router.get("/available-slots", auth, ctrl.getAvailableSlots)
router.patch("/:id/cancel", auth, ctrl.cancelBooking);
router.get("/mechanic", auth, ctrl.getMechanicBookings)

module.exports = router