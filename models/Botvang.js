const mongoose = require('mongoose');
const Napvang = new mongoose.Schema({
    taikhoan:{
        type:String
    },
    server:{
        type:Number
    },
    nhanvat:{
        type:String
    },
    sovang:{
        type:Number
    },
    khuvuc:{
        type:Number
    }
})
module.exports = mongoose.model('Botvangnhap',Napvang)