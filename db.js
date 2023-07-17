const mongoose = require('mongoose');

mongoose.set('strictQuery', true)
module.exports = mongoose.connect(process.env.DATABASE_URL,()=>{
    console.log("connected to db")
})



