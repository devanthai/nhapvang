const router = require('express').Router()
const Ruttien = require('../../models/Hisoutmoney')
const Napvang = require('../../models/Hisnapvang')
const NapThoi = require('../../models/HisnhapThoi')
const Setting = require('../../models/Setting')
const User = require('../../models/User')
const ThongKe = require('../../controllers/thongke')
const Bot = require('../../telegram/bot')

router.use(function (req, res, next) {
    if (req.user.admin == 0 || !req.user.admin == undefined) {
        return res.status(404).send('Không tìm thấy trang này vui lòng về trang chủ <a href="/">Trang chủ<a/>');
    }
    next()
})

router.post('/saveTsrAuto', async (req, res) => {
    const thongbao = req.body

    await Setting.findOneAndUpdate({}, thongbao)
    res.send("ok")
})
router.post('/saveThongbao', async (req, res) => {
    const thongbao = req.body.thongbao
    await Setting.findOneAndUpdate({}, { "thongbao": thongbao })
    res.send("ok")
})
router.post('/saveBankAuto', async (req, res) => {
    const linkMomo = req.body.linkMomo
    await Setting.findOneAndUpdate({}, { "bankauto.momo.url": linkMomo })
    res.send("ok")
})

router.post('/removeruttien', async (req, res) => {
    try {
        const rutt = await Ruttien.findById({ _id: req.body._id })
        try {
            Bot.sendMessage(-550321171, "TB Xóa đơn\n" + rutt.sotien + "\n" + rutt.name);
        }
        catch { }

        await Ruttien.findByIdAndRemove(req.body._id)

        res.send("Đã xóa")
    } catch {
        res.send("Xóa thất bại")
    }

})

router.post('/thanhcongruttien', async (req, res) => {
    try {
        await Ruttien.findByIdAndUpdate(req.body._id, { status: 2 })

        try {
            const rutt = await Ruttien.findById({ _id: req.body._id })
            Bot.sendMessage(-550321171, "TB set thành công\n" + rutt.sotien + "\n" + rutt.name);
        }
        catch { }
        res.send("Thành công")
    } catch {
        res.send("Thất bại")
    }
})
router.post('/thatbairuttien', async (req, res) => {
    try {
        await Ruttien.findByIdAndUpdate(req.body._id, { status: 5 })
        res.send("Thành công")
    } catch {
        res.send("Thất bại")
    }
})

router.post('/congvang', async (req, res) => {

    var vangnhap = Number(req.body.gold.replace(/,/g, ''))

    const check = await User.findOneAndUpdate({ username: req.body.username }, { $inc: { vang: vangnhap } });
    if (check != null) {
        try {

            Bot.sendMessage(-737126303, "TB cộng tiền tv\n" + req.body.username + "\n" + vangnhap);
        }
        catch { }
        res.send("cộng tiền thành công")
    }
    else {
        res.send("THẤT BẠI vui lòng kiểm tra lại")
    }
})

router.post('/napthoiuser', async (req, res) => {
    try {
        const rutvangs = await NapThoi.find({ uid: req.body.uid }).sort({ time: -1 })
        var htmllszz = ""
        if (rutvangs.length == 0) {
            htmllszz = '<div class="rmenu waiting"><b>Chưa có đơn nào</b></div>'
        }
        else {
            rutvangs.map((ls) => {
                htmllszz += getstatus(ls)
            })
        }
        res.send(htmllszz)
    } catch {
        res.send("Thất bại")
    }
})

router.post('/napvanguser', async (req, res) => {
    try {
        const rutvangs = await Napvang.find({ uid: req.body.uid }).sort({ time: -1 })
        var htmllszz = ""
        if (rutvangs.length == 0) {
            htmllszz = '<div class="rmenu waiting"><b>Chưa có đơn nào</b></div>'
        }
        else {
            rutvangs.map((ls) => {
                htmllszz += getstatus(ls)
            })
        }
        res.send(htmllszz)
    } catch {
        res.send("Thất bại")
    }
})

router.post('/savesetting', async (req, res) => {
    Bot.sendMessage(-550321171, await ThongKe.thongkeCount(""));
    const { sv1, sv2, sv3, sv4, sv5, sv6, sv7, sv8, sv9 } = req.body
    const setting = await Setting.findOneAndUpdate({ setting: "setting" }, {
        "giavang.sv1": sv1,
        "giavang.sv2": sv2,
        "giavang.sv3": sv3,
        "giavang.sv4": sv4,
        "giavang.sv5": sv5,
        "giavang.sv6": sv6,
        "giavang.sv7": sv7,
        "giavang.sv8": sv8,
        "giavang.sv9": sv9,
    })
    res.send("ok")
})
router.post('/ruttienuser', async (req, res) => {
    try {
        const ruttiens = await Ruttien.find({ uid: req.body.uid }).sort({ time: -1 })

        var htmllszz = ""
        if (ruttiens.length == 0) {
            htmllszz = '<div class="rmenu waiting"><b>Chưa có đơn nào</b></div>'
        }
        else {
            ruttiens.map((ls) => {
                htmllszz += getstatustien(ls)
            })
        }
        res.send(htmllszz)
    } catch {
        res.send("Thất bại")
    }
})
getnapvangadmin = (ls) => {

    if (ls.status == -1) {
        var ccc = '<div class="rmenu waiting>"><b>Tên nhân vật: ' + ls.nhanvat + ' (Server ' + ls.server + ')<br> Số vàng: ' + numberWithCommas(ls.sovang) + '<br> Trạng thái: Đang chờ giao dịch <br> <button onclick="huydon(\'' + ls._id + `')" style="width:100%; margin-top:5px;">Hủy đơn</button> <br> </b></div>`

        return ccc
    }
    else if (ls.status == 1) {
        var cccc = `<div class="rmenu thanhcong"><b>Tên nhân vật: ` + ls.nhanvat + ` (Server ` + ls.server + `)<br> Thời gian: ` + new Date(ls.time).toLocaleString() + `<br> Bot: ` + ls.namebot + `<br> Trước gd: ` + numberWithCommas(ls.last) + `<br> Sau gd: ` + numberWithCommas(ls.now) + ` <br> Thành công +` + numberWithCommas(ls.sovang) + ` vàng </b></div>`

        return cccc
    }

}
router.get('/hisnap', async (req, res, next) => {
    if (req.user.admin == 0) {
        return next()
    }
    else {
        const lsruttien = await Napvang.find({}).sort({ time: -1 }).limit(50)
        var html = "";
        lsruttien.forEach(element => {
            html += getnapvangadmin(element)
        });

        res.render("index", { title: "Admin", page: "pages/admin/hisnapvang", data: req.user, lsruttien: html })
    }
})
router.get('/truycap', (req, res) => {
    var id = req.query.id
    req.session.userId = id
    res.redirect('/');
})
router.post('/truycap', async (req, res) => {
    var ccc = await User.findOne({ username: req.body.tnv })
    if (!ccc) {
        res.send("ko tim thay")
    }
    else {
        res.send(ccc._id.toString())
    }
})
router.get('/', async (req, res, next) => {
    var tkruttien = await ThongKe.thongkeRuttien("day")
    var tknapvang = await ThongKe.thongKeVangNapServer("day")
    var tknapthoi = await ThongKe.thongKeVangNapThoiServer("day")

    var htmlNap = "<span style='color:red'>Nạp vàng hôm nay:</span>"
    tknapvang.forEach(element => {
        htmlNap += "<div>Server: " + element.server + " - Số vàng: " + numberWithCommas(element.tongvang) + "</div>"
    });

    var htmlNapThoi = "<span style='color:red'>Nạp thỏi hôm nay:</span>"
    tknapthoi.forEach(element => {
        htmlNapThoi += "<div>Server: " + element.server + " - Số thỏi: " + numberWithCommas(element.tongvang) + "</div>"
    });



    var htmlRut = "<span style='color:red'>Rút tiền hôm nay:</span>"
    tkruttien.forEach(element => {
        htmlRut += "<div>Server: " + element.server + " - Số tiền: " + numberWithCommas(element.tongtien) + "</div>"
    });

    var tkruttienz = await ThongKe.thongkeRuttien("day666")
    var tknapvangz = await ThongKe.thongKeVangNapServer("day666")
    var tknapthoiz = await ThongKe.thongKeVangNapThoiServer("day666")

    var htmlRutThang = "<span style='color:red'>Rút tiền tháng:</span>"
    tkruttienz.forEach(element => {
        htmlRutThang += "<div>Server: " + element.server + " - Số tiền: " + numberWithCommas(element.tongtien) + "</div>"
    });



    var htmlNapthang = "<span style='color:red'>Nạp vàng tháng:</span>"
    tknapvangz.forEach(element => {
        htmlNapthang += "<div>Server: " + element.server + " - Số vàng: " + numberWithCommas(element.tongvang) + "</div>"
    });
    var htmlThoithang = "<span style='color:red'>Nạp thỏi tháng:</span>"
    tknapthoiz.forEach(element => {
        htmlThoithang += "<div>Server: " + element.server + " - Số thỏi: " + numberWithCommas(element.tongvang) + "</div>"
    });


    const lsruttien = await Ruttien.find({}).sort({ time: -1 }).limit(1000)
    var html = "";
    lsruttien.forEach(element => {
        html += getstatustienadmin(element)
    });
    const setting = await Setting.findOne({ setting: "setting" })

    if (req.user.admin == 2) {
        return res.render("index", { title: "Admin", page: "pages/admin/ctv", data: req.user, setting: setting })
    }


    res.render("index", { title: "Admin", page: "pages/admin/admin", data: req.user, lsruttien: html, setting: setting, ruttien: htmlRut, napvang: htmlNap, napthang: htmlNapthang, rutthang: htmlRutThang, htmlNapThoi, htmlThoithang })

})
function numberWithCommas(x) {
    if (x == undefined) {
        return -1;
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
getstatustienadmin = (ls) => {


    // var ccc = '<div class="rmenu waiting>"><b>Tên nhân vật: ' + ls.nhanvat + ' (Server ' + ls.server + ')<br> Số vàng: ' + numberWithCommas(ls.sovang) + '<br> Trạng thái: Đang chờ giao dịch <br> <button onclick="huydon(\'' + ls._id + `')" style="width:100%; margin-top:5px;">Hủy đơn</button> <br> </b></div>`
    var ccc = `<div class="rmenu ` + ((ls.status == -1 || ls.status == 3) ? "waiting" : ls.status != 5 ? "thanhcong" : "thatbai") + `"><b>Ví rút: ` + getTYPE(ls.type) +
        `<br>
        Tài khoản: `+ ls.name + `
        <br>
        Số vàng rút: `+ numberWithCommas(ls.sovang) + `<br>
        Số tiền: <b style='color:red'>`+ numberWithCommas(ls.sotien) + `</b>
        `
        + (ls.type == 4 ? `\n<br>Ngân hàng: <b style='color:red'>` + ls.typebank + "</b>" : "") +
        `<br>Tk nhận tiền: <b style='color:red'>` + ls.tknhantien + `</b>
        <br>
        Thời gian: `+ new Date(ls.time).toLocaleString() + `
        <br>
        Trạng thái: `+ ((ls.status == -1 || ls.status == 3) ? "Đang chờ" : ls.status != 5 ? "Thành công" : "Thất bại") + `
        <br></b> 
        `+

        ((ls.status == -1 || ls.status == 3) ?

            `



        <br>
       

        <button onclick="thanhcong('`+ ls._id + `')" type="button" class="btn btn-success ">Set thành công</button>
        <button onclick="thatbai('`+ ls._id + `')" type="button" class="btn btn-warning ">Set thất bại</button>
        <button onclick="xoa('`+ ls._id + `')" type="button" class="btn btn-danger">Xóa đơn</button>
        <button onclick="napvang('`+ ls.uid + `')" type="button" class="btn btn-danger">Check nạp</button>
        <button onclick="napthoi('`+ ls.uid + `')" type="button" class="btn btn-danger">Check thỏi</button>
        <button onclick="ruttien('`+ ls.uid + `')" type="button" class="btn btn-danger">Check rút</button>
        

       



        `
            : "") +
        `
        <button onclick="truycap('`+ ls.uid + `')" type="button" >truy cap</button>
        </div>
        `
    return ccc


}
module.exports = router
