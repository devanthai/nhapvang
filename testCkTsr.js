const puppeteer = require('puppeteer');
// var shell = require('shelljs');
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/thaiDb", {
    // useUnifiedTopology: true,
    // useNewUrlParser: true,
    // useFindAndModify: false,
    // useCreateIndex: true
}, () => console.log('Connected to db'));

const request = require('request');
var key2captcha = "674b7bd9d310b5b6890aad46e1acfc64"
const Setting = require('./models/Setting')
const Ruttien = require('./models/Hisoutmoney')


let browser = null
let page = null
let cookies = null
let content = null


CkTsr = async (taikhoan, sotien, noidung) => {
    try {
        const setting = await Setting.findOne({})
        browser = await puppeteer.launch({ args: ['--no-sandbox', '--single-process', '--no-zygote'], headless: true });
        page = await browser.newPage();
        if (cookies == null) {
            await page.goto('https://thesieure.com/account/login', { waitUntil: 'networkidle0' });
            await page.waitForTimeout(2000)
            await page.type("#phoneOrEmail", setting.sendmoney.acctsr.username);
            await page.type("#password", setting.sendmoney.acctsr.password);
            await page.click("button[type='submit']")
        }
        else {
            await page.setCookie(...cookies);
        }
        await page.waitForTimeout(2000)
        await page.goto('https://thesieure.com/wallet/transfer', { waitUntil: 'networkidle0' });
        content = await page.content()
        if (content.includes("20,000,000")) {
            cookies = await page.cookies()
            await page.waitForTimeout(2000)
            await page.type("#get-user-wallet", taikhoan);
            await page.type("body > div.page.category > section > div > div > div > div > section > div.col-md-7 > form > table > tbody > tr:nth-child(4) > td:nth-child(2) > input", sotien.toString());
            await page.type("#description", noidung);
            await page.click("button[type='submit']")
            await page.waitForTimeout(2000)
            content = await page.content()
            if (content.includes("Xác nhận chuyển tiền")) {
                await page.waitForTimeout(2000)
                await page.evaluate(() => { document.querySelector('#g-recaptcha-response').style.display = 'block'; });
                const g_recaptcha = content.split('data-sitekey="')[1].split('"')[0]
                const giaicaptcha = await giaiCaptcha(g_recaptcha)
                if (!giaicaptcha.error) {
                    await page.type("#g-recaptcha-response", giaicaptcha.data);
                    await page.waitForTimeout(5000)


                    await page.evaluate(() => { document.querySelector("button[type='submit']").click() });
                    await page.waitForTimeout(2000)
                    content = await page.content()
                    if (content.includes("thành công")) {
                        return { error: false, message: "ck thành công" }
                    }
                    else {
                        return { error: true, message: "ck that bai" }
                    }
                }
                else {
                    return { error: true, message: "Giair captcha that bai" }
                }
            }
            else {
                return { error: true, message: "Lỗi không thấy trang xác nhận ck" }
            }
        }
        else {
            cookies = null
            return { error: true, message: "Lỗi không thấy trang ck" }
        }
    } catch (error) {
        return { error: true, message: "Lỗi " + error.message }
    }
}




giaiCaptcha = async (g_recaptcha) => {
    return new Promise(async (resolve) => {
        request({
            url: "https://2captcha.com/in.php?key=" + key2captcha + "&method=userrecaptcha&googlekey=" + g_recaptcha + "&pageurl=https://thesieure.com/wallet/transfer/verify",
            method: "GET"
        }, async function (error, response, body) {
            if (response.statusCode == undefined) {
                return resolve({ error: true, message: "Lỗi get captcha thất bại 1 " + body })
            }
            else if (response.statusCode != 200) {
                return resolve({ error: true, message: "Lỗi get captcha status != 200" })
            }
            else {
                const idget = body.split('|')[1]
                let solangiai = 0
                const lapgiaicaptcha = setInterval(async () => {
                    console.log("Giải captcha lần: " + (solangiai + 1))
                    request({
                        url: "https://2captcha.com/res.php?key=" + key2captcha + "&action=get&id=" + idget,
                        method: "GET"
                    }, async function (error, response, body) {
                        if (response.statusCode == undefined) {
                            clearInterval(lapgiaicaptcha)
                            return resolve({ error: true, message: "Lỗi get captcha thất bại 2 " + body })
                        }
                        else if (response.statusCode == 200) {
                            if (!body.includes("CAPCHA_NOT_READY") && !body.includes("OK")) {
                                clearInterval(lapgiaicaptcha)
                                return resolve({ error: true, message: "Lỗi giải captcha thất bại" })
                            }
                            else if (body.includes("OK")) {
                                clearInterval(lapgiaicaptcha)
                                const responsecaptcha = body.split("|")[1]
                                return resolve({ error: false, message: "Giair captcha thanh cong", data: responsecaptcha })
                            }
                        }
                        else {
                            console.log("Lỗi check captcha")
                        }
                    })
                    solangiai++
                    if (solangiai > 25) {
                        clearInterval(lapgiaicaptcha)
                        return resolve({ error: true, message: "Lỗi giải captcha quá thời gian" })
                    }
                }, 5000)
            }
        })
    })
}



const Bot = require('./telegram/bot')


start = async () => {
    setTimeout(() => {
        start()
    }, 5000);
    const Settingz = await Setting.findOne({ setting: "setting" })
    if (Settingz.sendmoney.acctsr.isRunning) {
        const item2 = await Ruttien.findOne({ status: 3, type: 2 })
        if (item2) {

        }
        else {
            var item = await Ruttien.findOne({ status: -1, type: 2 })
            if (item) {
                console.log("\x1b[33m", "Bắt đầu ck " + item.tknhantien)
                item.status = 3
                item.save()
                const chuyentien = await CkTsr(item.tknhantien, item.sotien, "nhapvangtudong.com")
                try {
                    await page.close()
                    await browser.close();
                } catch { }
                console.log(chuyentien)
                if (!chuyentien.error) {
                    item.status = 2
                    item.save()
                    Bot.sendMessage(-550321171, "Chuyển tiền Thesieure thành công\nTime: " + chuyentien.time + "s" + "\nTk: " + item.tknhantien + " Số tiền: " + item.sotien);
                }
                else {
                    Bot.sendMessage(-550321171, "Chuyển tiền tsr thất bại \nTk: " + item.tknhantien + "\n" + chuyentien.message);
                    item.status = -1
                    item.save()
                }
            }
        }
    }
}
start()