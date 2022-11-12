const request = require('request');
const cheerio = require('cheerio');
var key2captcha = "674b7bd9d310b5b6890aad46e1acfc64"
const Setting = require('../models/Setting')
const Ruttien = require('../models/Hisoutmoney')



const Bot = require('../telegram/bot');
const { contents } = require('cheerio/lib/api/traversing');
Ruttien.updateMany({ status: 3, type: "2" }, { status: -1 }, (data) => {
    console.log(data)
})


Ruttien.updateMany({ status: 3, type: "4" }, { status: -1 }, (data) => {
    console.log(data)
})

Ruttien.updateMany({ status: 3, type: "3" }, { status: -1 }, (data) => {
    console.log(data)
})


// start = async () => {
// setTimeout(() => {

//     start()
// }, 5000);
// var Settingz = await Setting.findOne({ setting: "setting" })
// if (Settingz.sendmoney.acctsr.isRunning) {
//     var rutTiens = await Ruttien.find({ status: -1, type: 2 })
//     rutTiens.forEach(async (item) => {
//         console.log("\x1b[33m", "Bắt đầu ck " + item.tknhantien)
//         item.status = 3
//         item.save()
//         var chuyentien = await CkTsr(item.tknhantien, item.sotien, "nhapvangtudong.com")
//         console.log(chuyentien)
//         if (!chuyentien.error) {
//             item.status = 2
//             item.save()
//             Bot.sendMessage(-550321171, "Chuyển tiền Thesieure thành công\nTime: " + chuyentien.time + "s" + "\nTk: " + item.tknhantien + " Số tiền: " + item.sotien);
//         }
//         else {
//             Bot.sendMessage(-550321171, "Chuyển tiền tsr thất bại \nTk: " + item.tknhantien + "\n" + chuyentien.message);
//             item.status = -1
//             item.save()
//         }
//     })
// }
// }
// start()


const UrlApi = "https://the9sao.com/api/t9s"

const TransFerApi = async (Username, Password, PasswordLever2, UsernameTo, AmountTransFer, Comment) => {
    return new Promise(resolve => {
        let options = {
            'method': 'POST',
            'url': UrlApi + "/Transfer",
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "Username": Username,
                "Password": Password,
                "PasswordLever2": PasswordLever2,
                "UsernameTo": UsernameTo,
                "AmountTransFer": AmountTransFer,
                "Comment": Comment
            })
        };
        request(options, async function (error, response, body) {
            if (error) {
                return resolve(null)
            }
            else if (response.statusCode == 200) {
                return resolve(body)
            }
            else {
                return resolve(null)
            }
        })
    })
}


t9saoAuto = async () => {
    let setting = await Setting.findOne({})
    setTimeout(() => {
        t9saoAuto()
    }, 10000);
    if (!setting.sendmoney.acct9s.isRunning) {
        return
    }
    const rutien = await Ruttien.findOne({ status: -1, type: 3 })
    if (rutien) {
        const transfer = await TransFerApi(setting.sendmoney.acct9s.username, setting.sendmoney.acct9s.password, setting.sendmoney.acct9s.passwordLv2, rutien.tknhantien, rutien.sotien, "nhapvangnro.com")
        if (transfer != null) {
            const json = JSON.parse(transfer)
            if (json.error == false) {
                await Ruttien.findOneAndUpdate({ _id: rutien._id }, { status: 1 })
                Bot.sendMessage(-550321171, "Auto the9sao success " + rutien.tknhantien + " " + rutien.sotien);
            }
            else
            {
                Bot.sendMessage(-550321171, "Chuyen tien the9sao loi " + rutien.tknhantien + " " + rutien.sotien + '\n' +  JSON.stringify(transfer));
            }
        }
    }
}

t9saoAuto()


getBalancePhone500kz = (phone) => {
    return new Promise(async (resolve) => {
        const options = {
            url: 'http://momo.500kz.com/getBalance',
            json: true,
            body: {
                phone: phone,
            }
        };
        request.post(options, (error, res, body) => {
            if (error) {
                
                return resolve({ error: true, message: "error request balance" })
            }
            else {
                return resolve(body)
            }
        })
    })
}

let momoErrorCount = 0

momoStart = async () => {
    let setting = await Setting.findOne({})
    setTimeout(() => {
        momoStart()
    }, 30000);
    if (!setting.bankauto.momo.isRunning) {
        return
    }
    const rutien = await Ruttien.findOne({ status: -1, type: 1 })
    if (rutien) {
        const balanceFirt = await getBalancePhone500kz(setting.bankauto.momo.sdtMomo)
        if (balanceFirt.error) {
            // if (momoErrorCount > 3) {
            //     setting.bankauto.momo.isRunning = false
            //     setting.save()
            //     Bot.sendMessage(-550321171, "Đã tắt auto momo");
            //     return
            // }
            // momoErrorCount += 1

            Bot.sendMessage(-550321171, "Chuyen tien MOMO loi " + rutien.tknhantien + " " + rutien.sotien + '\n' + JSON.stringify(balanceFirt));
        }
        else {
            console.log("firt", balanceFirt.balance)
            request.get(setting.bankauto.momo.url + "&amount=" + rutien.sotien + "&phoneTarget=" + rutien.tknhantien + "&comment=Nhapvang&ahihi=11111", async function (error, response, body) {
                if (!error) {
                    if (body == "thanhcong") {
                        momoErrorCount = 0
                        await Ruttien.findOneAndUpdate({ _id: rutien._id }, { status: 1 })
                        Bot.sendMessage(-550321171, "Auto momo success " + rutien.tknhantien + " " + rutien.sotien);
                    }
                    else {
                        // if (momoErrorCount > 3) {
                        //     setting.bankauto.momo.isRunning = false
                        //     setting.save()
                        //     Bot.sendMessage(-550321171, "Đã tắt auto momo");
                        //     return
                        // }
                        momoErrorCount += 1
                        Bot.sendMessage(-550321171, "Chuyen tien MOMO loi " + rutien.tknhantien + " " + rutien.sotien + '\n' + body);
                    }
                }
            })
        }
    }
}
momoStart()
// function upp(taikhoan, sotien, noidung) {
//     return new Promise(async (resolve) => {
//         var timeStart = new Date().getTime()
//         try {
//             request.get({ jar: true, url: 'https://thesieure.com/account/login' }, async function (error, response, body) {
//                 var Settingz = await Setting.findOne({ setting: "setting" })
//                 if (error) { return resolve({ error: true, message: "Lỗi lấy token login " + error.message }) }
//                 if (response.statusCode != 200) {
//                     return resolve({ error: true, message: "Lỗi lấy token login status != 200" })
//                 }
//                 else if (response.statusCode == 200) {
//                     const $ = cheerio.load(body);
//                     var token = $('[name=_token]').val()
//                     const cj = request.jar();
//                     for (var i = 0; i < response.headers['set-cookie'].length; i++) {
//                         cj.setCookie(response.headers['set-cookie'][i], 'https://thesieure.com/');
//                     }
//                     const options = {
//                         url: 'https://thesieure.com/account/login',
//                         jar: cj,
//                         json: true,
//                         body: {
//                             _token: token,
//                             phoneOrEmail: Settingz.sendmoney.acctsr.username,
//                             password: Settingz.sendmoney.acctsr.password
//                         }
//                     };
//                     request.post(options, (error, res, body) => {
//                         if (error) { return resolve({ error: true, message: "Lỗi post login " + error.message }) }
//                         if (res.statusCode != 302) {
//                             return resolve({ error: true, message: "Lỗi post login status != 302" })
//                         }
//                         else if (res.statusCode == 302) {
//                             request({
//                                 url: "https://thesieure.com/wallet/transfer",
//                                 method: "GET",
//                                 jar: cj,
//                                 headers: {
//                                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
//                                 }
//                             }, async function (error, response, body) {
//                                 if (error) {
//                                     return resolve({ error: true, message: "Lỗi get transfer error " + error.message })
//                                 }
//                                 else if (response.statusCode != 200) {
//                                     return resolve({ error: true, message: "Lỗi get transfer status != 200" })
//                                 }
//                                 else if (response.statusCode == 200) {
//                                     const $ = cheerio.load(body);
//                                     var token = $('[name=_token]').val()
//                                     request({
//                                         url: "https://thesieure.com/transfer/ajax/get-user-name",
//                                         method: "POST",
//                                         jar: cj,
//                                         headers: {
//                                             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
//                                         },
//                                         json: true,
//                                         body: { "_token": token, "payee_info": taikhoan }
//                                     }, async function (errorGetTk, responseGetTk, bodyGetTk) {
//                                         if (errorGetTk) {
//                                             return resolve({ error: true, message: "Lỗi get username error " + error.message })
//                                         }
//                                         else if (responseGetTk.statusCode != 200) {
//                                             return resolve({ error: true, message: "Lỗi get username status != 200" })
//                                         }
//                                         else if (bodyGetTk == "" || bodyGetTk == null || bodyGetTk == undefined) {
//                                             return resolve({ error: true, message: "Không tìm thấy username", status: 5 })
//                                         }
//                                         else if (responseGetTk.statusCode == 200) {
//                                             var payer_wallet
//                                             try {
//                                                 payer_wallet = body.split('option value="')[1].split('"')[0]
//                                             } catch (error) {
//                                                 return resolve({ error: true, message: "Lỗi get payer_wallet" })
//                                             }
//                                             if (payer_wallet == undefined) {
//                                                 return resolve({ error: true, message: "Lỗi get payer_wallet" })
//                                             }
//                                             request({
//                                                 url: "https://thesieure.com/wallet/transfer/verify",
//                                                 method: "POST",
//                                                 jar: cj,
//                                                 headers: {
//                                                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
//                                                 },
//                                                 json: true,
//                                                 body: { "payer_wallet": payer_wallet, "payee_info": taikhoan, "payee_name": "qqqq", "amount": sotien, "description": noidung, "_token": token }
//                                             }, async function (error, response, body) {
//                                                 if (error) {
//                                                     return resolve({ error: true, message: "Lỗi transfer/verify error " + error.message })
//                                                 }
//                                                 else if (response.statusCode != 200) {
//                                                     return resolve({ error: true, message: "Lỗi transfer/verify status != 200" })
//                                                 }
//                                                 else {
//                                                     const $ = cheerio.load(body);
//                                                     var _token = $('[name=_token]').val()
//                                                     var data_encode = $('[name=data_encode]').val()
//                                                     var g_recaptcha
//                                                     try {
//                                                         g_recaptcha = body.split('data-sitekey="')[1].split('"')[0]
//                                                     }
//                                                     catch
//                                                     {
//                                                         return resolve({ error: true, message: "Lỗi lấy g_recaptcha" })
//                                                     }
//                                                     if (body.includes("error")) {
//                                                         return resolve({ error: true, message: "Lỗi bode error" })
//                                                     }
//                                                     request({
//                                                         url: "https://2captcha.com/in.php?key=" + key2captcha + "&method=userrecaptcha&googlekey=" + g_recaptcha + "&pageurl=https://thesieure.com/wallet/transfer/verify",
//                                                         method: "GET"
//                                                     }, async function (error, response, body) {
//                                                         if (response.statusCode == undefined) {
//                                                             return resolve({ error: true, message: "Lỗi get captcha thất bại 1 " + body })
//                                                         }
//                                                         else if (response.statusCode != 200) {
//                                                             return resolve({ error: true, message: "Lỗi get captcha status != 200" })
//                                                         }
//                                                         else {
//                                                             var idget = body.split('|')[1]
//                                                             var solangiai = 0
//                                                             var lapgiaicaptcha = setInterval(async () => {
//                                                                 request({
//                                                                     url: "https://2captcha.com/res.php?key=" + key2captcha + "&action=get&id=" + idget,
//                                                                     method: "GET"
//                                                                 }, async function (error, response, body) {

//                                                                     if (response.statusCode == undefined) {
//                                                                         clearInterval(lapgiaicaptcha)
//                                                                         return resolve({ error: true, message: "Lỗi get captcha thất bại 2 " + body })
//                                                                     }
//                                                                     else if (response.statusCode == 200) {
//                                                                         if (!body.includes("CAPCHA_NOT_READY") && !body.includes("OK")) {
//                                                                             clearInterval(lapgiaicaptcha)
//                                                                             return resolve({ error: true, message: "Lỗi giải captcha thất bại" })
//                                                                         }
//                                                                         else if (body.includes("OK")) {
//                                                                             clearInterval(lapgiaicaptcha)
//                                                                             var responsecaptcha = body.split("|")[1]
//                                                                             request({
//                                                                                 url: "https://thesieure.com/wallet/transfer/confirm",
//                                                                                 method: "POST",
//                                                                                 jar: cj,
//                                                                                 headers: {
//                                                                                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
//                                                                                 },
//                                                                                 json: true,
//                                                                                 body: { "g-recaptcha-response": responsecaptcha, secret: Settingz.sendmoney.acctsr.otp, "data_encode": data_encode, "action": "doPayment", "_token": _token }
//                                                                             }, async function (error, response, body) {
//                                                                                 if (error) {
//                                                                                     return resolve({ error: true, message: "Lỗi tại transfer/confirm " + error.message })
//                                                                                 }
//                                                                                 else if (response.statusCode == 302) {
//                                                                                     if (body.includes("Redirecting")) {
//                                                                                         return resolve({ error: false, message: "Chuyển tiền thành công", time: new Date().getTime() - timeStart })
//                                                                                     }
//                                                                                     else {
//                                                                                         return resolve({ error: true, message: "Thất bại k biet tai sao " + body })
//                                                                                     }
//                                                                                 }
//                                                                                 else {
//                                                                                     return resolve({ error: true, message: "Lỗi gì k biết tại transfer/confirm" })
//                                                                                 }
//                                                                             })
//                                                                         }
//                                                                     }
//                                                                     else {
//                                                                         console.log("Lỗi check captcha")
//                                                                     }
//                                                                 })
//                                                                 solangiai++
//                                                                 if (solangiai > 25) {
//                                                                     clearInterval(lapgiaicaptcha)
//                                                                     return resolve({ error: true, message: "Lỗi giải captcha quá thời gian" })
//                                                                 }
//                                                             }, 5000)
//                                                         }

//                                                     })
//                                                 }
//                                             })
//                                         }
//                                     })
//                                 }
//                             });
//                         }
//                     })
//                 }
//             })
//         } catch (ex) { console.log(ex); return resolve({ error: true, message: "Lỗi không xác định " + error.message }) }
//     })
// }


startCkBank = async () => {
    setTimeout(() => {
        startCkBank()
    }, 20000);
    var rutbank = await Ruttien.findOne({ status: -1, type: 4 })
    if (rutbank) {
        var setting = await Setting.findOne()
        if (setting.sendmoney.accAcb.isRunning == true) {
            const { typebank, sotien, tknhantien, name } = rutbank
            rutbank.status = 3
            rutbank.save()
            var bankcode = null
            if (typebank == "BIDV") {
                bankcode = 970418
            }
            else if (typebank == "MB") {
                bankcode = 970422
            }
            else if (typebank == "AGR") {
                bankcode = 970405
            }
            else if (typebank == "ACB") {
                bankcode = 970416
            }
            else if (typebank == "SACOMBANK") {
                bankcode = 970403
            }
            else if (typebank == "VIETCOMBANK") {
                bankcode = 970436
            }
            else if (typebank == "TECHCOMBANK") {
                bankcode = 970407
            }
            else if (typebank == "DONGA") {
                bankcode = 970406
            }
            else if (typebank == "VIETINBANK") {
                bankcode = 970415
            }
            else if (typebank == "VPBANK") {
                bankcode = 970432
            }
            else if (typebank == "TPBANK") {
                bankcode = 970423
            }
            else if (typebank == "EXB") {
                bankcode = 970431
            }
            else if (typebank == "SEA") {
                bankcode = 970440
            }
            else if (typebank == "HDB") {
                bankcode = 970437
            }
            else if (typebank == "VIB") {
                bankcode = 970441
            }
            else if (typebank == "OCE") {
                bankcode = 970414
            }
            else if (typebank == "SHB") {
                bankcode = 970443
            }

            const ck = await ckAcb(
                setting.sendmoney.accAcb.linkapi,
                setting.sendmoney.accAcb.username,
                setting.sendmoney.accAcb.password,
                setting.sendmoney.accAcb.accountNumber,
                tknhantien,
                bankcode,
                sotien,
                "nhapvangnro.com",
                'OTPS'
            )
            console.log(ck)
            if (!ck.error) {
                rutbank.status = 2
                rutbank.save()
                let namebankz = ck.data.receiverName
                let bankname = ck.data.bankName
                Bot.sendMessage(-550321171, "Chuyển tiền Bank thành công\nUsername: " + name + "\nTk: " + tknhantien + " Số tiền: " + sotien + "\nName: " + namebankz + "\nBank:" + bankname);
            }
            else {
                Bot.sendMessage(-550321171, "Chuyển tiền Bank thất bại \nTk: " + tknhantien + "\n" + ck.message);
                rutbank.status = -1

                if (ck.message.includes("checkReceiveAccount failed:")) {
                    rutbank.status = 5
                }

                rutbank.save()
            }
        }
    }
}
startCkBank()

const urlGetCode9sao = "https://acb.doitien.me/getOTP9sao"
ckAcb = (urlapi, username, password, accountNumber, tranfer_to, napasBankCode, amount, message, otp_type = 'OTPS') => {
    return new Promise(async (resolve) => {
        const options = {
            url: urlapi + "api/acb/" + (napasBankCode == 970416 ? "tranfer_local" : "tranfer_247"),
            json: true,
            body: {
                accountNumber: accountNumber,
                username: username,
                password: password,
                tranfer_to: tranfer_to,
                napasBankCode: napasBankCode.toString(),
                amount: amount,
                message: message,
                otp_type: otp_type
            }
        };
        request.post(options, (error, res, body) => {
            if (error) {
                return resolve({ error: true, message: "Lỗi tại api/acb/tranfer_247 " + error.message })
            }
            else if (res.statusCode != 200) {
                return resolve({ error: true, message: "Lỗi tại api/acb/tranfer_247 status != 200" })
            }
            else {
                var jsonRes = body
                if (jsonRes.success == true) {
                    var uuid = jsonRes.data.uuid
                    request.get(urlGetCode9sao, async function (error, response, body) {
                        if (error) {
                            return resolve({ error: true, message: "Lỗi tại get code " + error.message })
                        }
                        else if (response.statusCode != 200) {
                            return resolve({ error: true, message: "Lỗi tại get code status != 200" })
                        }
                        else {
                            var code = body
                            const options = {
                                url: urlapi + "api/acb/confirm_tranfer",
                                json: true,
                                body: {
                                    accountNumber: accountNumber,
                                    username: username,
                                    password: password,
                                    uuid: uuid,
                                    code: code,
                                    otp_type: otp_type
                                }
                            };
                            request.post(options, (error, res, body) => {
                                if (error) {
                                    return resolve({ error: true, message: "Lỗi tại confirm_tranfer " + error.message })
                                }
                                else if (res.statusCode != 200) {
                                    return resolve({ error: true, message: "Lỗi tại get confirm_tranfer status != 200" })
                                }
                                else {
                                    var resJsson = body
                                    if (resJsson.success == true) {
                                        return resolve({ error: false, message: "Ck thành công", data: resJsson })
                                    }
                                    else {
                                        return resolve({ error: true, message: "Lỗi tại not success confirm_tranfer " + JSON.stringify(resJsson) })
                                    }
                                }
                            })
                        }
                    })
                }
                else {
                    return resolve({ error: true, message: "Lỗi tại not success " + JSON.stringify(jsonRes) })
                }
            }
        })
    })
}
module.exports = {}