const express = require("express");
const {test, createProducts} = require("../controller/productCtrl");
const router = express.Router();

router.post("/test", test);
router.post("/listProduct", createProducts);

module.exports = router;