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
            username: { type: String, default: "namphuong00" },
            password: { type: String, default: "Xt221612@@" },
            otp: { type: String, default: "9011111" },
            isRunning: { type: Boolean, default: true }
        },
        accAcb: {
            linkapi:{ type: String, default: "http://139.180.133.253/" },
            username: { type: String, default: "4161701" },
            password: { type: String, default: "Tronganhdz5577" },
            accountNumber: { type: String, default: "4161701" },
            isRunning: { type: Boolean, default: true }
        }
    },
    bankauto: {
        momo: { url: { type: String, default: "https://momo.the9sao.com/bankAuto?phone=0327194073&pass=" } }
    }
})
module.exports = mongoose.model('Settingnhap', setting)