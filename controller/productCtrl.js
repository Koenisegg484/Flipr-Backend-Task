const Product = require("../models/productModels");
const asyncHandler = require("express-async-handler");


const test = asyncHandler(async (req, res) => {
    res.json({
        message:"This is the products section.",
    });
});


const createProducts = asyncHandler(async (req, res) => {
    console.log("This is the products section");

    // try {
    //     const newProduct = await new Product.create(req.body);
    //     res.json({
    //         newProduct,
    //         msg:"Product has been listed."})
    // } catch (error) {
    //     throw new Error(error);
    // }
});

module.exports = {
    test,
    createProducts
}