const Botvang = require("../models/Botvang")
const BotGold = require("../models/BotGold")
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
async function getBotGold(server) {
    //const botvang = await Botvang.find({ server: server }).sort({ khuvuc: 1 })
    const botvang = await BotGold.find({ Server: server, Status: 1, TypeBot: 1 }).sort({ khuvuc: 1 })
    var html = `<div class="rmenu">Tài khoản bạn đăng ký sv` + server + " nên chỉ hiện bot sv" + server + `</div>`
    if (botvang.length == 0) html = `<div class="list1"><b style="color:green;">Hiện tại chưa có bot</b></div>`
    for (let i = 0; i < botvang.length; i++) {

        html += `<div ${botvang[i].Version == "2.2.2" ? 'style="background-color: #ffdada;"' : ''} class="list1"><b style="color:green;">[Online]</b> Vũ trụ ` + botvang[i].Server + `s: <b style="color:blue;">` + botvang[i].Name + ` </b>${botvang[i].Version == "2.2.2" ? '<small style="color:red;">(Bản mới)</small>' : ''}  Khu <span style="color:red;">` + botvang[i].Zone + `</span><span> Số vàng <span style="color:red;">` + numberWithCommas(botvang[i].Gold) + `<span></span></div>`
    }
    return html
}
function getBotAdmin() {
    console.log("getbotad")
}
module.exports = { getBot: getBotGold, getBotAdmin }
