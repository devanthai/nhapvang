const router = require('express').Router()
var Botvang = require('../../models/Botvang')
var hisNapvang = require('../../models/Hisnapvang')
var User = require('../../models/User')
// router.get('/updatebot', async (req, res) => {
//     const khuvuc = req.query.khu
//     const tnv = req.query.tnv
//     const server = req.query.server
//     const sovang = req.query.sovang
//     const taikhoan = (req.query.taikhoan)
//     var checkbot = await Botvang.findOne({ server: server, taikhoan: taikhoan })
//     if (!checkbot) {
//         await new Botvang({ taikhoan:taikhoan,khuvuc: khuvuc, server: server, nhanvat: tnv, sovang: sovang }).save()
//     }
//     else {
//         await Botvang.findOneAndUpdate({ taikhoan: taikhoan, server: server }, { khuvuc: khuvuc, sovang: sovang, khuvuc: khuvuc,nhanvat:tnv })
//     }
//     res.send("done")
// })
// router.get('/donenap', async (req, res) => {
//     const id = req.query.id
//     const namebot = req.query.namebot
//     const sodulast = req.query.last
//     const sodunow = req.query.now
//     const find = await hisNapvang.findOneAndUpdate({ _id: id, status: -1 }, { status: 1, namebot: namebot, last: sodulast, now: sodunow })
//     res.send("done")
// })
// router.get('/getnap', async (req, res) => {
//     const tnv = req.query.tnv
//     const server = req.query.server
//     const find = await hisNapvang.findOne({ server: server, nhanvat: tnv, status: -1 })
//     if (!find) {
//         return res.send("fail")
//     }
//     else {
//         return res.send("success|" + find._id + "|" + find.server + "|" + find.nhanvat + "|" + find.sovang)
//     }
// })
module.exports = router