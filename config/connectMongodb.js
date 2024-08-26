const {default: mongoose} = require("mongoose")

const dbconnect = () => {
    try{
        const conn = mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to the Mongo db")
    }catch(error){
        console.log("Error in connecting to the Mongo db")
        throw new Error(error)
    }
}

module.exports = dbconnect;