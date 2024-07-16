const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/nodejs_blogs_edit').then(() => {
    console.log("Connected to MongoDB");
}).catch((e) => {
    console.log("Failed to connect to MongoDB")
})

