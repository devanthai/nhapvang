const mongoose = require('mongoose');

const setting = new mongoose.Schema({
    setting: {
        type: String,
        default: "setting"
    },
    thongbao: {
        type: String,
        default: "thongbao"
    },
    cuoitrang: {
        type: String,
        default: "cuoitrang"
    },
    giavang: {
        sv1: { type: Number, default: 4000 },
        sv2: { type: Number, default: 4000 },
        sv3: { type: Number, default: 4000 },
        sv4: { type: Number, default: 4000 },
        sv5: { type: Number, default: 4000 },
        sv6: { type: Number, default: 4000 },
        sv7: { type: Number, default: 4000 },
        sv8: { type: Number, default: 4000 },
        sv9: { type: Number, default: 4000 }
    },
    sendmoney: {
        urlmm: { type: String, default: "link.me" },
        acctsr: {
            username: { type: String, default: "taikhoan" },
            password: { type: String, default: "pass" },
            otp: { type: String, default: "9011111" }
        }
    },
    bankauto:{
        momo:{ url:{type:String,default:"https://momo.the9sao.com/bankAuto?phone=0327194073&pass="}}
    }



})
module.exports = mongoose.model('Settingnhap', setting)