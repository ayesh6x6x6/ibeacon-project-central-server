const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    username: String,
    email: String,
    password: String,
    picture:String,
    favItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    orderHistory: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
    preferredZone: [{type:String}],
    visit: [],
    r: Number,
    g: Number,
    b: Number
});

module.exports = mongoose.model('User',userSchema);