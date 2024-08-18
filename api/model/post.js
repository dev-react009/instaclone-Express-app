const mongoose = require('mongoose');
const Postschema = new mongoose.Schema({
    author: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    likes:{type:String,default:12},
    date: { type: String, default: new Date() }
}, {
    timestamps: true
})
module.exports = mongoose.model('Post', Postschema)