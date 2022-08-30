var userAuth = require("../controllers/auth");
var napvang = require("../controllers/napvang");
var napthoi = require("../controllers/napthoi");
var ruttien = require("../controllers/ruttien");
var admin = require("../routers/admin");
var apinapvang = require("./api/napvang");
const Setting = require('../models/Setting')

var Sesssion = require("../controllers/session");

function route(app) {
    app.use(Sesssion)
    //app.use("/apinapvang",apinapvang)
    app.use("/auth", userAuth)
    app.use("/napvang", napvang)
    app.use("/napthoi", napthoi)
    app.use("/ruttien", ruttien)
    app.use("/hackerlo", admin)
    app.get('/', async (req, res) => {
        const setting = await Setting.findOne({ setting: "setting" })
        if(!setting)
        {
            await new Setting({setting: "setting"}).save()
        }
        res.render("index", { title: "Trang chủ", page: "pages/trangchu", data: req.user, setting: setting })
    })
    app.use(function (req, res, next) {
        res.status(404);
        res.send('Không tìm thấy trang này vui lòng về trang chủ <a href="/">Trang chủ<a/>');
        return;
    })
}
module.exports = route