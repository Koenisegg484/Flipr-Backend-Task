const express = require("express");
const {
    createProduct,
    getaProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    addToWishlist,
    rating,
  } = require("../controller/productCtrl");
const{isAdmin, authMiddleware} = require("../middlewares/autMiddleware")
const router = express.Router();


router.post("/", authMiddleware, isAdmin, createProduct);

router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);

router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.get("/", getAllProduct);
router.get("/test", (req, res) => {
    res.json({
        messae:"This is products endpoint."
    });
});

module.exports = router;