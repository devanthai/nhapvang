const mongoose = require('mongoose');
const rt = new mongoose.Schema({
    server: {
        type: Number
    },
    tknhantien: {
        type: String

    },
    sotien: {
        type: Number
    },
    status: {
        type: Number,
        default: -1
    },
    sovang: {
        type: Number
    },
    typebank: {
        type: String
    },
    type: {
        type: String
    },
    uid: {
        type: String
    },
    name: {
        type: String
    },
    time: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('hisruttiennhap', rt)