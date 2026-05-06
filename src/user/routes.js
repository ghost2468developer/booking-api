const router = require("express").Router()
const ctrl = require("./controllers")

router.post("/register", ctrl.register)
router.post("/login", ctrl.login)
router.get("/mechanics", ctrl.getMechanics)

module.exports = router