const express = require("express");
const { getShops, createShop, updateShop, deleteShop } = require("../controllers/shopsController");

const router = express.Router();

router.get("/", getShops);
router.post("/", createShop);
router.put("/:shopId", updateShop);
router.delete("/:shopId", deleteShop);

module.exports = router;
