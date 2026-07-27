const express = require("express");
const { monitorList, monitorShop } = require("../controllers/monitoringController");

const router = express.Router();

router.post("/list/:listId", monitorList);
router.post("/shop/:shopId", monitorShop);

module.exports = router;
