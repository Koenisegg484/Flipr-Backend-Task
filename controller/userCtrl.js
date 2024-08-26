const { generateToken } = require('../config/jwtToken');
const jwt = require("jsonwebtoken")
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler')
const generateRefreshToken = require("../config/refreshToken.JS")
const validateMongoDbId = require("../utils/validateMongodbId")

// Register a user
const createUser = asyncHandler(
    async(req, res) => {      
        const email = req.body.email;
        const phone = req.body.phone;
        const findUser = await User.findOne({email : email});
        if(!findUser){
            //Creating a new User
            const newUser = await User.create(req.body);
            res.json({
                msg:"You have been registered succesfully."
            });
            console.log("Created new User.");
            
        }else{
            // The user exists already
            throw new Error (`User Already Exists`);
        }
    }
);


// Logging the user
const loginUserCtrl = asyncHandler(async(req, res) => {
    const {email, password} = req.body;
    //Check if user exists
    const findUser = await User.findOne({email});
    if (findUser && await findUser.isPasswordMatched(password)){
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser.id, 
            {
                refreshToken: refreshToken
            },
            {new: true}
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72*60*60*1000,
        });
        res.json({
            _id : findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            phone: findUser?.phone,
            token: generateToken(findUser?._id),
        });
    }else{
        throw new Error("Invalid Credentials Entered.");
    }
    
});

// Logout the user
const logoutUser = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if(!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({refreshToken});
    if(!user){
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true
        });
        return res.sendStatus(204); //forbidden
    }

    await User.findOneAndUpdate(
        {refreshToken}, 
        {refreshToken: ""});

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true
    });
    res.json({
        msg:"User has been Logged Out."
    });
    // res.sendStatus(204); //forbidden
});


//Get all users
const getallUsers = asyncHandler(async (req, res) => {
   try {
    const getUsers = await User.find();
    res.json(getUsers);
   } catch (error) {
    throw new Error(error)    
   }
})

// Get a single user
const getUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    console.log(id);
    try {
        const getauser = await User.findById(id);
        res.json({
            getauser
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) =>{
    const cookie = req.cookies;
    if(!cookie?.refreshToken)throw new Error("No Refresh Token in cookies.");
    const refreshToken = cookie.refreshToken;   
    const user = await User.findOne({refreshToken});
    if(!user) throw new Error("No Refresh Token presint in db or not mathched with any user.");
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if(err || user.id !== decoded.id){
        throw new Error("Something is wrong with the token.")
    }
    const accessToken = generateToken(user?._id);
    res.json({accessToken})
});
    
    
});

// Update a user
const updateUser = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    validateMongoDbId(_id);
    try {
        const updateauser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            phone: req?.body?.phone,
        });
        res.json({
            updateauser,
        });
    } catch (error) {
        throw new Error(error);
    }
});


// Delete a user
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    try {
        const getauser = await User.findByIdAndDelete(id);
        res.json({
            getauser,
            msg:"User has been deleted successfully."
        });
    } catch (error) {
        throw new Error(error);
    }
});

// Block a user
const blockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked:true,
        }, {
            new:true,
        });
        res.json({
            msg:"User has been blocked"
        });
    } catch (error) {
        throw new Error(error)
    }
});

// Unblock a user
const unblockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked:false,
        }, {
            new:true,
        });
        res.json({
            msg:"User has been unblocked"
        });
    } catch (error) {
        throw new Error(error)
    }
});


// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only
// These are for cart only

const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
      const findUser = await User.findById(_id).populate("wishlist");
      res.json(findUser);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      let products = [];
      const user = await User.findById(_id);
      // check if user already have product in cart
      const alreadyExistCart = await Cart.findOne({ orderby: user._id });
      if (alreadyExistCart) {
        alreadyExistCart.remove();
      }
      for (let i = 0; i < cart.length; i++) {
        let object = {};
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        let getPrice = await Product.findById(cart[i]._id).select("price").exec();
        object.price = getPrice.price;
        products.push(object);
      }
      let cartTotal = 0;
      for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
      }
      let newCart = await new Cart({
        products,
        cartTotal,
        orderby: user?._id,
      }).save();
      res.json(newCart);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const cart = await Cart.findOne({ orderby: _id }).populate(
        "products.product"
      );
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const user = await User.findOne({ _id });
      const cart = await Cart.findOneAndRemove({ orderby: user._id });
      res.json(cart);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  
  const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      if (!COD) throw new Error("Create cash order failed");
      const user = await User.findById(_id);
      let userCart = await Cart.findOne({ orderby: user._id });
      let finalAmout = 0;
      if (couponApplied && userCart.totalAfterDiscount) {
        finalAmout = userCart.totalAfterDiscount;
      } else {
        finalAmout = userCart.cartTotal;
      }
  
      let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
          id: uniqid(),
          method: "COD",
          amount: finalAmout,
          status: "Cash on Delivery",
          created: Date.now(),
          currency: "usd",
        },
        orderby: user._id,
        orderStatus: "Cash on Delivery",
      }).save();
      let update = userCart.products.map((item) => {
        return {
          updateOne: {
            filter: { _id: item.product._id },
            update: { $inc: { quantity: -item.count, sold: +item.count } },
          },
        };
      });
      const updated = await Product.bulkWrite(update, {});
      res.json({ message: "success" });
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongoDbId(_id);
    try {
      const userorders = await Order.findOne({ orderby: _id })
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
  });
  
  const getAllOrders = asyncHandler(async (req, res) => {
    try {
      const alluserorders = await Order.find()
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(alluserorders);
    } catch (error) {
      throw new Error(error);
    }
  });
  const getOrderByUserId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const userorders = await Order.findOne({ orderby: id })
        .populate("products.product")
        .populate("orderby")
        .exec();
      res.json(userorders);
    } catch (error) {
      throw new Error(error);
    }
  });
  const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    validateMongoDbId(id);
    try {
      const updateOrderStatus = await Order.findByIdAndUpdate(
        id,
        {
          orderStatus: status,
          paymentIntent: {
            status: status,
          },
        },
        { new: true }
      );
      res.json(updateOrderStatus);
    } catch (error) {
      throw new Error(error);
    }
  });



module.exports = {
    createUser,
    loginUserCtrl,
    getallUsers,
    getUser,
    deleteUser,
    updateUser,
    blockUser,
    unblockUser,
    logoutUser,
    handleRefreshToken,
    getWishlist,
    userCart,
    getUserCart,
    emptyCart,
    createOrder,
    getOrders,
    updateOrderStatus,
    getAllOrders,
    getOrderByUserId
};