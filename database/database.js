require('dotenv').config()
const mongoose = require('mongoose');

module.exports = () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        // mongoose.connect("mongodb+srv://arjunscintillate:ELhfura45uEKb9vv@cluster0.zkscdti.mongodb.net/ChatApp")
        console.log("Connected Successfully...!")
    } catch (error) {
        console.log("Not Connected...!")
    }
}






