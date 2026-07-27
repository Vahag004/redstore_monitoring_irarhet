const express = require("express");
const {
  getLists,
  createList,
  deleteList,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/listsController");

const router = express.Router();

router.get("/", getLists);
router.post("/", createList);
router.delete("/:listId", deleteList);

router.post("/:listId/products", addProduct);
router.put("/:listId/products/:productId", updateProduct);
router.delete("/:listId/products/:productId", deleteProduct);

module.exports = router;
