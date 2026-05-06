const router = require("express").Router()
const ctrl = require("./controllers")

router.post("/register", ctrl.register)
router.post("/login", ctrl.login)
router.get("/mechanics", ctrl.getMechanics)
router.patch("/:id/complete", auth, ctrl.completeBooking)

module.exports = router