const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1];
        try {
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
            
        } catch (error) {
            throw new Error("Not authorised, token expired, Please Login again")
        }
    }else{
        throw new Error("There is no token attached to the header.")
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    console.log(req.user);
    const adminUser = await User.findOne({email:req.user.email});
    if (adminUser.role !== "admin"){
        throw new Error("You do not have the permission to view this page.")
    }else{
        next();
    }
});

module.exports = {authMiddleware, isAdmin}