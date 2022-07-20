const router = require('express').Router()
const hisNapvang = require('../models/HisnhapThoi')
const napvang9s = require('../models/NapThoi9s')
const getBot = require('./getBotThoi')

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
getstatus = (ls) => {

    if (ls.status == -1) {
        var ccc = '<div class="rmenu waiting>"><b>Tên nhân vật: ' + ls.nhanvat + ' (Server ' + ls.server + ')<br> Số thỏi vàng: ' + numberWithCommas(ls.sovang) + '<br> Trạng thái: Đang chờ giao dịch <br> <button onclick="huydon(\'' + ls._id + `')" style="width:100%; margin-top:5px;">Hủy đơn</button> <br> </b></div>`

        return ccc
    }
    else if (ls.status == 1) {
        var cccc = `<div class="rmenu thanhcong"><b>Tên nhân vật: ` + ls.nhanvat + ` (Server ` + ls.server + `)<br> Thời gian: ` + new Date(ls.time).toLocaleString() + ` <br> Thành công +` + numberWithCommas(ls.sovang) + ` thỏi vàng </b></div>`

        return cccc
    }

}

router.post('/huydon', async (req, res) => {
    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }

    var id = req.body.id
    await hisNapvang.deleteOne({ _id: id, status: -1 })
    res.send("xong")
})
router.get('/getls', async (req, res) => {
    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }
    var lichsunap = await hisNapvang.find({ uid: req.user._id }).sort({ time: -1 })
    var htmlls = ""

    if (lichsunap.length == 0) {
        htmlls = '<div class="rmenu waiting"><b>Chưa có đơn nạp vàng nào</b></div>'
    }
    else {
        lichsunap.map((ls) => {
            htmlls += getstatus(ls)
        })
    }
    return res.send(htmlls)
})
router.get('/', async (req, res) => {
    if (!req.user.isLogin) {
        return res.redirect('/auth/login')
    }
    var listbot = await getBot.getBot(req.user.server)
    var lichsunap = await hisNapvang.find({ uid: req.user._id }).sort({ time: -1 })
    var htmlls = ""

    if (lichsunap.length == 0) {
        htmlls = '<div class="rmenu waiting"><b>Chưa có đơn nạp thỏi nào</b></div>'
    }
    else {
        lichsunap.map((ls) => {
            htmlls += getstatus(ls)
        })
    }
    var page = "pages/napthoi";
    res.render("index", { title: "Nạp thỏi", page: page, data: req.user, lichsu: htmlls, bot: listbot });
})


router.post('/', async (req, res) => {
    if (!req.user.isLogin) {
        return res.send({ err: 1, message: "Vui lòng đăng nhập" })
    }
    var vangnap = req.body.vangnap
    var tnv = req.body.tnv
    var tnvcc = tnv.match(/([0-9]|[a-z]|[A-Z])/g);

    if(!tnv || !vangnap)
    {
        return res.send({ err: 1, message: 'Không hợp lệ' })
    }

    if (tnvcc.length != tnv.length) {
        return res.send({ err: 1, message: 'Tên nhân vật không hợp lệ' })
    }
    tnv = tnv.toLowerCase()
    if (!isNaN(vangnap)) {
        if (vangnap < 100 && vangnap > 0) {
            var vang = vangnap
            const checkAnother = await hisNapvang.find({ uid: { $ne: req.user._id }, status: -1, nhanvat: tnv })
            if (checkAnother.length > 0) {
                // console.log(checkAnother)
                await hisNapvang.deleteMany({ nhanvat: tnv, status: -1 })
                return res.send({ err: 1, message: "<b style='color:red'>Tạo đơn không thành công vui lòng thử lại</b>" })
            }
            const checkAnother2 = await napvang9s.find({ status: 0, tnv: tnv })
            if (checkAnother2.length > 0) {
                await napvang9s.deleteMany({ tnv: tnv, status: 0 })
                await hisNapvang.deleteMany({ nhanvat: tnv, status: -1 })
                return res.send({ err: 1, message: "<b style='color:red'>Tạo đơn không thành công vui lòng thử lại</b>" })

            }
            var napvang = await hisNapvang.countDocuments({ status: -1, uid: req.user._id })
            if (napvang > 4) {
                return res.send({ err: 1, message: "chỉ tạo đc 5 đơn 1 lúc" })
            }
            else {
                const rs = await new hisNapvang({ server: req.user.server, nhanvat: tnv, taikhoan: req.user.name, sovang: vang, uid: req.user._id }).save()
                console.log(rs)
                setTimeout(async () => {
                    const check = await hisNapvang.findOne({ _id: rs._id, status: -1 })
                    if (check) {
                        await hisNapvang.deleteOne({ _id: rs._id })
                    }
                }, 600000);
                return res.send({ err: 0, message: "Tạo đơn thành công vui lòng vào game giao dịch" })
            }
        }
        else {
            return res.send({ err: 1, message: "Nạp thỏi chỉ từ tối thiểu 1 -> tối đa 99" })
        }
    }
    else {
        return res.send({ err: 1, message: "Có lỗi đã xảy ra" })
    }
})
module.exports = router