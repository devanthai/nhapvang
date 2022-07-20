const request = require('request');
const cheerio = require('cheerio');
function CheckName(username) {
    return new Promise(resolve => {
        try {
            request.get('https://thesieure.com/account/login', function (error, response, body) {
                // if (error) throw error; 
                if (error) { return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" }) }
                if (response.statusCode == 200) {
                    const $ = cheerio.load(body);
                    var token = $('[name=_token]').val()
                    const cj = request.jar();
                    for (var i = 0; i < response.headers['set-cookie'].length; i++) {
                        cj.setCookie(response.headers['set-cookie'][i], 'https://thesieure.com/');
                    }
                    const options = {
                        url: 'https://thesieure.com/transfer/ajax/get-user-name',
                        jar: cj,
                        json: true,
                        body: {
                            payee_info: username,
                            _token: token
                        }
                    };
                    request.post(options, (error, res, body) => {
                        if (error) {
                            return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" })
                        }
                        else if (response.statusCode == 200) {
                            return resolve({ err: 0, message: body })
                        }
                        else {
                            return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" })
                        }
                    })
                } else return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" })
            });
        } catch { return resolve({ err: 1, message: "Có lỗi đã xảy ra vui lòng thử lại" }) }
    });
}
module.exports = { CheckName }
