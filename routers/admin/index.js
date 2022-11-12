const router = require('express').Router()
const Ruttien = require('../../models/Hisoutmoney')
const Napvang = require('../../models/Hisnapvang')
const NapThoi = require('../../models/HisnhapThoi')
const Setting = require('../../models/Setting')
const User = require('../../models/User')
const ThongKe = require('../../controllers/thongke')
const Bot = require('../../telegram/bot')
const { generateSecret, verify } = require('2fa-util');

router.use(function (req, res, next) {
    if (req.user.admin == 0 || !req.user.admin == undefined) {
        return res.status(404).send('Không tìm thấy trang này vui lòng về trang chủ <a href="/">Trang chủ<a/>');
    }
    next()
})
router.post('/2fa', async (req, res) => {
    const code = req.body.code
    console.log(code)
    const is2Fa = await verify(code, "EECQIGR5BMACS6I5")
    if (!is2Fa) {
        return res.send({ error: true })
    }
    else {
        Bot.sendMessage(-737126303, "Login 2fa" + "\n" + req.user.name);

        req.session.f2a = true
        return res.send({ error: false })
    }
})
router.use(function (req, res, next) {
    if (!req.user.f2a) {
        return res.render("index", { title: "Admin", page: "pages/admin/admin", data: req.user })
    }
    next()
})
router.post('/saveT9sAuto', async (req, res) => {
    const thongbao = req.body
    Bot.sendMessage(-737126303, "save the9sao auto" + "\n" + req.user.name);

    await Setting.findOneAndUpdate({}, thongbao)
    res.send("ok")
})
router.post('/saveTsrAuto', async (req, res) => {
    const thongbao = req.body
    Bot.sendMessage(-737126303, "saveTsrAuto" + "\n" + req.user.name);

    await Setting.findOneAndUpdate({}, thongbao)
    res.send("ok")
})
router.post('/saveThongbao', async (req, res) => {
    const thongbao = req.body.thongbao
    await Setting.findOneAndUpdate({}, { "thongbao": thongbao })
    Bot.sendMessage(-737126303, "saveThongbao" + "\n" + req.user.name);

    res.send("ok")
})
router.post('/saveBankAuto', async (req, res) => {
    const linkMomo = req.body.linkMomo
    const sdtMomo = req.body.sdtMomo
    const isRunning = req.body.isRunning
    await Setting.findOneAndUpdate({}, { "bankauto.momo.url": linkMomo, "bankauto.momo.sdtMomo": sdtMomo, "bankauto.momo.isRunning": isRunning })
    Bot.sendMessage(-737126303, "Save bank auto\n" + req.user.name);

    res.send("ok")
})





router.post('/removeruttien', async (req, res) => {
    try {
        const rutt = await Ruttien.findById({ _id: req.body._id })
        try {
            Bot.sendMessage(-737126303, "TB Xóa đơn\n" + rutt.sotien + "\n" + rutt.name + "\n" + req.user.name);
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
        const rutt = await Ruttien.findByIdAndUpdate(req.body._id, { status: 1 })

        try {
            Bot.sendMessage(-737126303, "TB set thành công\n" + rutt.sotien + "\n" + rutt.name + "\n" + req.user.name);
        }
        catch { }
        res.send("Thành công")
    } catch {
        res.send("Thất bại")
    }
})
router.post('/thatbairuttien', async (req, res) => {
    try {
        const rutt = await Ruttien.findByIdAndUpdate(req.body._id, { status: 5 })
        Bot.sendMessage(-737126303, "TB set that bai\n" + rutt.sotien + "\n" + rutt.name + "\n" + req.user.name);

        res.send("Thành công")
    } catch {
        res.send("Thất bại")
    }
})


router.post('/checkServer', async (req, res) => {
    const check = await User.findOne({ username: req.body.username });
    if (check != null) {
        res.send({ error: false, message: check.username + " Server: " + check.server })
    }
    else {
        res.send({ error: true, message: "không tìm thấy thành viên này" })
    }
})


router.post('/congvang', async (req, res) => {

    var vangnhap = Number(req.body.gold.replace(/,/g, ''))

    const check = await User.findOneAndUpdate({ username: req.body.username }, { $inc: { vang: vangnhap } });
    if (check != null) {
        try {

            Bot.sendMessage(-737126303, "TB cộng tiền tv\n" + req.body.username + "\n" + vangnhap + "\n" + req.user.name);
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
    Bot.sendMessage(-737126303, await ThongKe.thongkeCount(""));
    const { sv1, sv2, sv3, sv4, sv5, sv6, sv7, sv8, sv9, sv10 } = req.body
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
        "giavang.sv10": sv10,
    })
    Bot.sendMessage(-737126303, "Savesetting" + "\n" + req.user.name);

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



    var rutienTypes = await ThongKe.thongkeRuttienType("day")
    var htmlRutienType = "<span style='color:red'>Rút tiền type:</span>"
    rutienTypes.forEach(element => {
        htmlRutienType += "<div>Type: " + getTypeeee(element.type) + " - Số tiền: " + numberWithCommas(element.tongtien) + "</div>"
    });

    var rutienTypesThang = await ThongKe.thongkeRuttienType("dsssay")
    var htmlRutienTypethang = "<span style='color:red'>Rút tiền type tháng:</span>"
    rutienTypesThang.forEach(element => {
        htmlRutienTypethang += "<div>Type: " + getTypeeee(element.type) + " - Số tiền: " + numberWithCommas(element.tongtien) + "</div>"
    });


    res.render("index", { title: "Admin", page: "pages/admin/admin", data: req.user, lsruttien: html, setting: setting, ruttien: htmlRut, napvang: htmlNap, napthang: htmlNapthang, rutthang: htmlRutThang, htmlNapThoi, htmlThoithang, htmlRutienType, htmlRutienTypethang })

})

getTypeeee = (type) => {
    if (type == "1") {
        return "Momo"
    }
    else if (type == "2") {
        return "Tsr"
    }
    else if (type == "3") {
        return "T9s"
    }
    else if (type == "4") {
        return "Bank"
    }
}

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


        `



        <br>
       

        <button onclick="thanhcong('`+ ls._id + `')" type="button" class="btn btn-success ">Set thành công</button>
        <button onclick="thatbai('`+ ls._id + `')" type="button" class="btn btn-warning ">Set thất bại</button>
        <button onclick="xoa('`+ ls._id + `')" type="button" class="btn btn-danger">Xóa đơn</button>
        <button onclick="napvang('`+ ls.uid + `')" type="button" class="btn btn-danger">Check nạp</button>
        <button onclick="napthoi('`+ ls.uid + `')" type="button" class="btn btn-danger">Check thỏi</button>
        <button onclick="ruttien('`+ ls.uid + `')" type="button" class="btn btn-danger">Check rút</button>
        

       
        <button onclick="truycap('`+ ls.uid + `')" type="button" >truy cap</button>


   
        </div>
        `
    return ccc


}
module.exports = router
