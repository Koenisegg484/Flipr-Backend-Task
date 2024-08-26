const express = require("express");
const { createUser, loginUserCtrl, getallUsers, getUser, 
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    logoutUser,
    handleRefreshToken,
    userCart,
    createOrder,
    getOrders,
    getAllOrders,
    getWishlist,
    getUserCart,
    emptyCart,
    updateOrderStatus
} = require("../controller/userCtrl");

const { authMiddleware, isAdmin } = require("../middlewares/autMiddleware");
const router = express.Router();

router.post("/signup", createUser);
router.post("/signin", loginUserCtrl);
router.post("/logout", logoutUser);

// Not required
router.get("/users", getallUsers);
router.get("/refresh", handleRefreshToken)
router.get("/:id",authMiddleware, isAdmin, getUser);
router.delete("/delete/:id",authMiddleware, deleteUser);
router.put("/update/:id",authMiddleware, updateUser);
router.put("/block/:id",authMiddleware, isAdmin, blockUser);
router.put("/unblock/:id",authMiddleware, isAdmin, unblockUser);



router.post("/cart", authMiddleware, userCart);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.get("/get-orders", authMiddleware, getOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);

router.delete("/empty-cart", authMiddleware, emptyCart);
router.put(
  "/order/update-order/:id",
  authMiddleware,
  isAdmin,
  updateOrderStatus
);


router.post("/test", (req, res) => {
    res.send("Hello from the Server Side")
});


module.exports = router;