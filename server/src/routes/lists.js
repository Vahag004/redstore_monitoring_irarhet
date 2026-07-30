const express = require("express");
const {
  getLists,
  editList,
  createList,
  deleteList,
  addProduct,
  updateProduct,
  deleteProduct,

} = require("../controllers/listsController");

const router = express.Router();

router.get("/", getLists);
router.post("/", createList);
router.patch("/:listId", editList)
router.delete("/:listId", deleteList);

router.post("/:listId/products", addProduct);
router.put("/:listId/products/:productId", updateProduct);
router.delete("/:listId/products/:productId", deleteProduct);

module.exports = router;
