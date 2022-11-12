const User = require('../models/User')

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
module.exports = async function (req, res, next) {
  var userID = req.session.userId
  var admin = 0;

  if (userID) {
    var isLogin = false;
    var vang = 0;
    var name = "";



    const user = await User.findOne({ _id: userID })



    if (user) {

      isLogin = true;
      name = user.username;
      vang = user.vang;
      admin = user.admin

      const f2a = { f2a: req.session.f2a }

      req.user = admin > 0 ? { server: user.server, _id: user._id, name: name, vang: numberWithCommas(Math.round(vang)), isLogin: isLogin, admin: admin, ...f2a } : { server: user.server, _id: user._id, name: name, vang: numberWithCommas(Math.round(vang)), isLogin: isLogin, admin: admin }
    }
    else {

      req.user = { isLogin: false, admin: admin, }
    }
    return next();
  } else {
    req.user = { isLogin: false, admin: admin }
    return next();
  }
}
