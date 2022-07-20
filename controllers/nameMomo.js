const request = require('request');
async function Check_User(phone) {
    return new Promise(resolve => {
        var checkheader = {
            Msgtype: "SEND_OTP_MSG",
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
        var times = new Date().getTime()
        var dataBody = {
            user: phone,
            msgType: 'CHECK_USER_BE_MSG',
            cmdId: times + '000000',
            lang: "vi",
            time: times,
            channel: "APP",
            appVer: "30192",
            appCode: "3.0.19",
            deviceOS: "IOS",
            buildNumber: 0,
            appId: "vn.momo.platform",
            result: true,
            errorCode: 0,
            errorDesc: '',
            momoMsg: {
                _class: 'mservice.backend.entity.msg.RegDeviceMsg',
                number: phone,
                imei: '71ddaf6b-7f8d-42e8-886b-8c0f6d03e4fc',
                cname: 'Vietnam',
                ccode: '084',
                device: 'iPhone 12',
                firmware: '15.0',
                hardware: 'iPhone',
                manufacture: 'Apple',
                csp: 'Viettel',
                icc: '',
                mcc: '452',
                mnc: '04',
                device_os: 'IOS',
            },
            extra: { checkSum: "" }
        }
        const options = {
            url: 'https://api.momo.vn/backend/auth-app/public/CHECK_USER_BE_MSG',
            json: true,
            headers: checkheader,
            body: dataBody
        };
        try {
            request.post(options, (error, res, body) => {
                if (body.result == true && body.extra.NAME != undefined) {
                    return resolve({ err: 0, message: body.extra.NAME })
                }
                else {
                    return resolve({ err: 1, message: body.errorDesc })
                }
            })
        } catch { return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" }) }
    });
}
module.exports = { Check_User }