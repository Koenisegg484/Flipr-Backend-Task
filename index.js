const express = require('express');
const dbconnect = require('./config/connectMongodb');
const app = express()
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 4400;
const authRouter = require('./routes/authRoutes');
const productRouter = require('./routes/productRoutes');
const bodyParser = require('body-parser');
const { notFound, errorHandler } = require('./middlewares/errorHandlers');
const cookieparser = require("cookie-parser");

// Conncting to the database
dbconnect();

// Starting the server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieparser());

app.use("/", authRouter);
app.use("/products", productRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on the Port : ${PORT}`)
});