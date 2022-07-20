const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')


const { registerValidation, loginValidation } = require('./validation')
router.get('/register', (req, res) => {
    if (req.user.isLogin) {
        return res.redirect('/')
    }
    var page = "pages/auth/dangky";
    res.render("index", { title: "Đăng ký", page: page, data: req.user });
});
router.get('/login', (req, res) => {
    if (req.user.isLogin) {
        return res.redirect('/')
    }
    var page = "pages/auth/dangnhap";
    res.render("index", { title: "Đăng nhập", page: page, data: req.user });
});
router.get('/logout', (req, res) => {
    cookie = req.cookies;
    for (var prop in cookie) {
        if (!cookie.hasOwnProperty(prop)) {
            continue;
        }
        res.cookie(prop, '', { expires: new Date(0) });
    }
    req.session = null
    res.redirect('/')
});


router.post("/changepass", async (req, res) => {
    if (req.body.repassword == undefined || req.body.password == undefined || req.body.oldpassword == undefined) {
        return res.status(200).send({ error: 1, msg: 'Không hợp lệ' })
    }
    var repassword = req.body.repassword.toLowerCase()
    var password = req.body.password.toLowerCase()
    var oldpassword = req.body.oldpassword.toLowerCase()

    var matkhauc = repassword.match(/([0-9]|[a-z]|[A-Z])/g);

    if (matkhauc.length != password.length) {
        return res.status(200).send({ error: 1, msg: 'Mật khẩu nhập không hợp lệ a-z, A-Z, 0-9' })
    }
    else if (repassword != password) {
        return res.status(200).send({ error: 1, msg: 'Mật khẩu nhập lại không khớp' })
    }
    else {
        const user = await User.findById(req.session.userId)
        if (user) {
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(oldpassword, salt)
            const vaildPass = await bcrypt.compare(oldpassword, user.password)
            if (!vaildPass) {
                return res.status(200).send({ error: 1, msg: 'Mật khẩu cũ không đúng' })
            }
            else {
                const zhashPassword = await bcrypt.hash(repassword, salt)
                const userpas = await User.findByIdAndUpdate(req.session.userId,{password:zhashPassword})
                return res.status(200).send({ error: 0, msg: 'Đổi mật khẩu thành công' })
            }
        }
        else {
            return res.status(200).send({ error: 1, msg: 'Lỗi' })
        }
    }
})

router.post('/register', async (req, res) => {
    if (req.body.username == undefined || req.body.password == undefined || req.body.server == undefined) {
        return res.status(200).send({ error: 1, msg: 'Không hợp lệ' })
    }
    var server = req.body.server
    var username = req.body.username.toLowerCase()
    var password = req.body.password.toLowerCase()
    if (isNaN(server)) {
        return res.status(200).send({ error: 1, msg: 'Máy chủ không hợp lệ' })
    }
    else if (server < 1 || server > 9) {
        return res.status(200).send({ error: 1, msg: 'Máy chủ không hợp lệ' })
    }

    const { error } = registerValidation(req.body)
    if (error) return res.status(200).send({ error: 1, msg: error.details[0].message })

    var taikhoanc = username.match(/([0-9]|[a-z]|[A-Z])/g);
    var matkhauc = password.match(/([0-9]|[a-z]|[A-Z])/g);
    if (taikhoanc.length != username.length) {
        return res.status(200).send({ error: 1, msg: 'Tài khoản không hợp lệ' })
    }
    else if (matkhauc.length != password.length) {
        return res.status(200).send({ error: 1, msg: 'Mật khẩu không hợp lệ' })
    }
    else if (username == password) {
        return res.status(200).send({ error: 1, msg: 'Tài khoản không được giống mật khẩu' })
    }
    else if (username.includes(password)) {
        return res.status(200).send({ error: 1, msg: 'Tài khoản không được giống mật khẩu' })
    }
    else if (password.includes(username)) {
        return res.status(200).send({ error: 1, msg: 'Tài khoản không được giống mật khẩu' })
    }
    else if (password.includes('123') || password.includes('456') || password.includes('789') || password.includes('321')) {
        return res.status(200).send({ error: 1, msg: 'Mật khẩu không được dễ đoán như 123, 456, 789, 321 ....' })
    }
    const usernameExist = await User.findOne({ username: username })
    if (usernameExist) return res.status(200).send({ error: 1, msg: 'Tài khoản này đã tồn tại vui lòng chọn tài khoản khác' })
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    let admin = 0;
    if (username == "trongem" || username == "admin9sao") {
        admin = 1
    }
    const user = new User({ username: username, password: hashPassword, server: server, admin: admin })
    try {
        const savedUser = await user.save()
        req.session.userId = user._id
        res.json({ error: 0, msg: "Đăng ký thành công" });
    }
    catch (err) { res.status(200).send({ error: 1, msg: "Lỗi không xác định vui lòng thử lại" }) }
})
router.post('/login', async (req, res) => {
    var username = req.body.username.toLowerCase()
    var password = req.body.password.toLowerCase()
    const { error } = loginValidation(req.body)
    if (error) return res.status(200).send({ error: 1, msg: error.details[0].message })
    const user = await User.findOne({ username: username })
    if (!user) return res.status(200).send({ error: 1, msg: 'Tài khoản hoặc mật khẩu không chính xác' })
    const vaildPass = await bcrypt.compare(password, user.password)
    if (!vaildPass) return res.status(200).send({ error: 1, msg: 'Tài khoản hoặc mật khẩu không chính xác' })

    req.session.userId = user._id


    res.json({ error: 0, msg: "Đăng nhập thành công" });
})


module.exports = router