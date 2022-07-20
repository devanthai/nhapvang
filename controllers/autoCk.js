const request = require('request');
const cheerio = require('cheerio');
var key2captcha = "674b7bd9d310b5b6890aad46e1acfc64"
const Setting = require('../models/Setting')
const Ruttien = require('../models/Hisoutmoney')

const Bot = require('../telegram/bot')

start = async () => {
    setTimeout(() => {
        start()
    }, 20000);
    var rutien = await Ruttien.find({ status: -1, type: 2 })
    for (let i = 0; i < rutien.length; i++) {
        console.log("\x1b[33m", " đang chuyển " + rutien[i].tknhantien)
        var cc = await Ruttien.findByIdAndUpdate(rutien[i]._id, { status: 3 })
        CkTsr(rutien[i].tknhantien, rutien[i].sotien, "nhap vang", rutien[i]._id)
    }
}
//start()

momoStart = async () => {
    const setting = await Setting.findOne({})
    setTimeout(() => {
        momoStart()
    }, 20000);
    var rutien = await Ruttien.findOne({ status: -1, type: 1 })
    console.log(rutien)
    if (rutien) {
        request.get(setting.bankauto.momo.url + "&amount=" + rutien.sotien + "&phoneTarget=" + rutien.tknhantien + "&comment=Nhapvang", async function (error, response, body) {
            if (!error) {
                if (body == "thanhcong") {
                    await Ruttien.findOneAndUpdate({ _id: rutien._id }, { status: 1 })
                    Bot.sendMessage(-550321171, "Auto momo success "+rutien.tknhantien+" "+rutien.sotien);
                }
                else {
                    Bot.sendMessage(-550321171, "Chuyen tien MOMO loi "+rutien.tknhantien+" "+rutien.sotien);
                }
            }
        })
    }

}
momoStart()

function CkTsr(taikhoan, sotien, noidung, iddon) {
    return new Promise(async (resolve) => {
        var timeStart = new Date().getTime()
        try {


            request.get('https://thesieure.com/account/login', async function (error, response, body) {
                var Settingz = await Setting.findOne({ setting: "setting" })
                if (error) { return resolve("loi tai 2002") }
                if (response.statusCode == 200) {
                    const $ = cheerio.load(body);
                    var token = $('[name=_token]').val()
                    const cj = request.jar();
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        cj.setCookie(response.headers['set-cookie'][i], 'https://thesieure.com/');
                    }
                    const options = {
                        url: 'https://thesieure.com/account/login',
                        jar: cj,
                        json: true,
                        body: {
                            _token: token,
                            phoneOrEmail: Settingz.sendmoney.acctsr.username,
                            password: Settingz.sendmoney.acctsr.password
                        }
                    };
                    request.post(options, (error, res, body) => {
                        if (error) { return resolve("loi tai 2001") }
                        if (res.statusCode == 302) {
                            request({
                                url: "https://thesieure.com/wallet/transfer",
                                method: "GET",
                                jar: cj,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
                                }
                            }, async function (error, response, body) {
                                const $ = cheerio.load(body);
                                var token = $('[name=_token]').val()
                                var payer_wallet
                                try {
                                    payer_wallet = body.split('option value="')[1].split('"')[0]
                                } catch (error) {
                                    console.log(body)
                                    console.log("loi tai ck 5")
                                    await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                    return resolve("loi tai ck 5")
                                }
                                if (payer_wallet == undefined) {

                                    console.log("next")
                                    await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                    return resolve("next")
                                }
                                request({
                                    url: "https://thesieure.com/wallet/transfer/verify",
                                    method: "POST",
                                    jar: cj,
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
                                    },
                                    json: true,
                                    body: { "payer_wallet": payer_wallet, "payee_info": taikhoan, "payee_name": "qqqq", "amount": sotien, "description": noidung, "_token": token }
                                }, async function (error, response, body) {
                                    const $ = cheerio.load(body);
                                    var _token = $('[name=_token]').val()
                                    var data_encode = $('[name=data_encode]').val()
                                    var g_recaptcha
                                    try {
                                        g_recaptcha = body.split('data-sitekey="')[1].split('"')[0]
                                    }
                                    catch
                                    {
                                        console.log(body)
                                        await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                        console.log("loi tai ck 4")
                                        return resolve("loi tai ck 4")
                                    }
                                    if (body.includes("error")) {

                                        await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                        console.log("loi tai ck 22")
                                        return resolve("loi tai ck 22")
                                    }
                                    request({
                                        url: "https://2captcha.com/in.php?key=" + key2captcha + "&method=userrecaptcha&googlekey=" + g_recaptcha + "&pageurl=https://thesieure.com/wallet/transfer/verify",
                                        method: "GET"
                                    }, async function (error, response, body) {
                                        var idget = body.split('|')[1]
                                        var solangiai = 0
                                        var lapgiaicaptcha = setInterval(async () => {
                                            request({
                                                url: "https://2captcha.com/res.php?key=" + key2captcha + "&action=get&id=" + idget,
                                                method: "GET"
                                            }, async function (error, response, body) {
                                                try {
                                                    if (!body.includes("CAPCHA_NOT_READY") && !body.includes("OK")) {
                                                        await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                                        console.log("Giải captcha thất bại")
                                                        clearInterval(lapgiaicaptcha)

                                                        console.log("loi tai ck 2")
                                                        return resolve("loi tai ck 2")
                                                    }
                                                    else if (body.includes("OK")) {
                                                        var responsecaptcha = body.split("|")[1]
                                                        request({
                                                            url: "https://thesieure.com/wallet/transfer/confirm",
                                                            method: "POST",
                                                            jar: cj,
                                                            headers: {

                                                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
                                                            },
                                                            json: true,
                                                            body: { "g-recaptcha-response": responsecaptcha, secret: Settingz.sendmoney.acctsr.otp, "data_encode": data_encode, "action": "doPayment", "_token": _token }
                                                        }, async function (error, response, body) {
                                                            try {
                                                                await Ruttien.findByIdAndUpdate(iddon, { status: 1 })
                                                                console.log("\x1b[32m", "Chuyển tiền cho " + taikhoan + " thành công " + "Success: " + (new Date().getTime() - timeStart))
                                                                clearInterval(lapgiaicaptcha)
                                                                if (body.includes("https://thesieure.com/transfer/result/")) {

                                                                }
                                                                else {
                                                                    console.log(body)
                                                                }
                                                                //await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                                                return resolve("thanhcong|" + sotien + "|" + (new Date().getTime() - timeStart))
                                                            } catch {
                                                                console.log(body)
                                                            }
                                                        })
                                                    }
                                                } catch {
                                                    console.log("loi tai ck 2 22")
                                                }
                                            })
                                            solangiai++
                                            if (solangiai > 25) {
                                                await Ruttien.findOneAndUpdate({ _id: iddon, status: 3 }, { status: -1 })
                                                clearInterval(lapgiaicaptcha)
                                                console.log("loi tai qua thoi gian giai captcha")
                                                return resolve("loi tai qua thoi gian giai captcha")
                                            }
                                        }, 5000)
                                    })
                                })
                            });
                        }
                    })
                }
            })
        } catch { return resolve("loi") }
    })
}
module.exports = { CkTsr }