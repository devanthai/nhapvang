const router = require('express').Router()
const checkNameMm = require('./nameMomo')
const checkNameTsr = require('./nameTsr')
const CheckRecaptcha = require('./checkRecaptcha')
const Setting = require('../models/Setting')
const User = require('../models/User')
const Ruttien = require('../models/Hisoutmoney')
const Bot = require('../telegram/bot')

getstatustien = (ls) => {

    // var ccc = '<div class="rmenu waiting>"><b>Tên nhân vật: ' + ls.nhanvat + ' (Server ' + ls.server + ')<br> Số vàng: ' + numberWithCommas(ls.sovang) + '<br> Trạng thái: Đang chờ giao dịch <br> <button onclick="huydon(\'' + ls._id + `')" style="width:100%; margin-top:5px;">Hủy đơn</button> <br> </b></div>`
    var ccc = `<div class="rmenu ` + ((ls.status == -1 || ls.status == 3) ? "waiting" : ls.status != 5 ? "thanhcong" : "thatbai") + `"><b>Ví rút: ` + getTYPE(ls.type) +
        `<br>
        Số vàng rút: `+ numberWithCommas(ls.sovang) + `<br>
        Số tiền: <b style='color:red'>`+ numberWithCommas(ls.sotien) +'</b>'+
        (ls.type == 4 ? `\n<br>Ngân hàng: ` + ls.typebank : "") + `
        <br>
        Tk nhận tiền: <b style='color:red'>`+ ls.tknhantien +'</b>'+ `
        <br>
        Thời gian: `+ new Date(ls.time).toLocaleTimeString() + `
        <br>
        
        Trạng thái: `+ ((ls.status == -1 || ls.status == 3) ? "Đang chờ" : ls.status != 5 ? "Thành công" : "Thất bại") + `
        <br></b> </div>
        `
    return ccc


}

getTYPE = (type) => {
    if (type == 1) {
        return "<b style='color:red'>Momo</b>"
    }
    else if (type == 2) {
        return "<b style='color:red'>TSR</b>"
    }
    else if (type == 3) {
        return "<b style='color:red'>The9sao.Com</b>"
    }
    else if (type == 4) {
        return "<b style='color:red'>Bank</b>"
    }
    else {
        return "??"
    }
}
getTYPEtele = (type) => {
    if (type == 1) {
        return "Momo"
    }
    else if (type == 2) {
        return "TSR"
    }
    else if (type == 3) {
        return "The9sao.Com"
    }
    else if (type == 4) {
        return "Bank"
    }
    else {
        return "??"
    }
}
getlstelegram = (ls) => {
    // var ccc = '<div class="rmenu waiting>"><b>Tên nhân vật: ' + ls.nhanvat + ' (Server ' + ls.server + ')<br> Số vàng: ' + numberWithCommas(ls.sovang) + '<br> Trạng thái: Đang chờ giao dịch <br> <button onclick="huydon(\'' + ls._id + `')" style="width:100%; margin-top:5px;">Hủy đơn</button> <br> </b></div>`
    var ccc = `Ví rút: ` + getTYPEtele(ls.type) +
        `\nSố vàng rút: ` + numberWithCommas(ls.sovang) +
        `\nSố tiền: ` + numberWithCommas(ls.sotien) +
        (ls.type == 4 ? `\nNgân hàng: ` + ls.typebank : "") +
        `\nTk nhận tiền: ` + ls.tknhantien +
        `\nThời gian: ` + new Date(ls.time).toLocaleTimeString() +
        `\nTrạng thái: ` + ((ls.status == -1 || ls.status == 3) ? "Đang chờ" : ls.status != 5 ? "Thành công" : "Thất bại")
    return ccc


}
router.get('/getls', async (req, res) => {
    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }
    var lichsurut = await Ruttien.find({ uid: req.user._id }).sort({ time: -1 }).limit(5)
    var htmlls = ""

    if (lichsurut.length == 0) {
        htmlls = '<div class="rmenu waiting"><b>Chưa có đơn nào</b></div>'
    }
    else {
        lichsurut.map((ls) => {
            htmlls += getstatustien(ls)
        })
    }
    return res.send(htmlls)
})
router.post('/getNamemm', async (req, res) => {

    if (req.user.isLogin && req.body.sdt != undefined) {
        const sdt = await checkNameMm.Check_User(req.body.sdt)
        res.send(sdt)
    }
})
router.post('/getNameTsr', async (req, res) => {

    if (req.user.isLogin && req.body.sdt != undefined) {
        const sdt = await checkNameTsr.CheckName(req.body.sdt)
        res.send(sdt)
    }
})
router.get('/', async (req, res) => {

    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }
    var lichsurut = await Ruttien.find({ uid: req.user._id }).sort({ time: -1 }).limit(5)
    var htmllszz = ""
    if (lichsurut.length == 0) {
        htmllszz = '<div class="rmenu waiting"><b>Chưa có đơn nào</b></div>'
    }
    else {
        lichsurut.map((ls) => {
            htmllszz += getstatustien(ls)
        })
    }


    var setting = await Setting.findOne({ setting: "setting" })
    if (!setting) {
        setting = await new Setting({ setting: "setting" }).save();
    }
    var page = "pages/ruttien";
    //console.log(setting.giavang['sv' + req.user.server])
    res.render("index", { title: "Rút vàng", page: page, data: req.user, lichsurut: htmllszz, giavang: setting.giavang['sv' + req.user.server] });
})
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
router.post('/', async (req, res) => {
    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }
    var type = req.body.type
    var sovangrut = req.body.sovangrut
    var taikhoanck = req.body.taikhoanck
    var typebank = req.body.typebank
    var vangreal = sovangrut.replace(/[\D\s\._\-]+/g, "");
    if (isNaN(vangreal) || (type != 1 && type != 2 && type != 3 && type != 4)) {
        return res.send({ err: "1", message: "Đã có lỗi xảy ra vui lòng thử lại" })
    }
    vangreal = Math.round(vangreal)
    var setting = await Setting.findOne({ setting: "setting" })
    if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        return res.json({ "err": 1, "message": "Vui lòng xác thực captcha" });
    }
    var checkCaptcha = await CheckRecaptcha.CheckRecaptcha(req.body['g-recaptcha-response'], req.socket.remoteAddress)

    if (checkCaptcha == false) {
        return res.json({ "err": 1, "message": "Vui lòng xác thực captcha" });
    }
    if (type == 1) {
        const checkmm = await checkNameMm.Check_User(taikhoanck)
        if (checkmm.err == 1) {
            return res.send({ err: 1, message: checkmm.message })
        }
    }
    else if (type == 2) {
        // const checktsr = await checkNameTsr.CheckName(taikhoanck)
        // if (checktsr.err == 1) {
        //     return res.send({ err: 1, message: checktsr.message })
        // }
    }

    var giavang = setting.giavang['sv' + req.user.server]

    var sotien = vangreal / giavang
    sotien = Math.round(sotien)
    if (sotien < 10000) {
        var needgold = 10000 * giavang
        return res.send({ err: 1, message: "Chỉ rút được trên " + numberWithCommas(needgold) + " vàng" })
    }
    var user = await User.findById(req.user._id)
    if (user) {
        if (user.vang < vangreal) {
            return res.send({ err: 1, message: "Bạn không đủ vàng để rút" })
        }
        const us = await User.findOneAndUpdate({ _id: req.user._id }, { $inc: { vang: -vangreal } })
        if (us) {
            try {
                var rtirn = await new Ruttien({ server: req.user.server, sotien: sotien, sovang: vangreal, type: type, tknhantien: taikhoanck, name: us.username, typebank: typebank, uid: us._id }).save()

                Bot.sendMessage(-550321171, getlstelegram(rtirn));

                if (rtirn) {
                    return res.send({ err: 1, message: "Tạo đơn rút thành công vui lòng đợi hệ thống thanh toán" })
                }
            }
            catch {
                return res.send({ err: 1, message: "Có lỗi đã xảy ra" })
            }
        }
    }
    else {
        return res.send({ err: 1, message: "Không tìm thấy đăng nhập vui lòng load lại trang" })
    }

})
module.exports = router