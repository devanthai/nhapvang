
function thongbao(msg) {
    $("#thongbao").html('<div class="rmenu"><b>' + msg + '</b></div>')
}
$("#dangky").click(function () {
    var username = $("#tk").val()
    var password = $("#mk").val()
    var server = $("#server").val()
    if (server == 0) {
        thongbao("Vui lòng chọn máy chủ");
        return;
    }
    var input = document.getElementsByTagName("input");
    for (var i = 0; i < 2; i++) {

        if (input[i].value.length == 0) {
            thongbao("Thông tin đăng kí không được để trống");
            return;
        }
        if (input[i].value.length < 6) {
            thongbao("Thông tin đăng kí phải là 1 chuỗi kí tự lớn hơn hoặc bằng 6 kí tự");
            return;
        }
        if (input[i].value.length > 16) {
            thongbao("Thông tin đăng kí phải là 1 chuỗi kí tự nhỏ hơn hoặc bằng 16 kí tự");
            return;
        }
        var arr = input[i].value.match(/([0-9]|[a-z]|[A-Z])/g);
        if (arr.length != input[i].value.length) {
            thongbao("Tài khoản và mật khẩu phải là 1 chuỗi kí tự từ a -> z, A -> Z hoặc 0 -> 9");
            return;
        }
    }
    $.ajax({
        url: '/auth/register',
        type: "POST",
        dataType: "text",
        data: { username: username, password: password, server: server },
        success: function (res) {

            thongbao(JSON.parse(res).msg)
            if (JSON.parse(res).error == 0) {
                window.location.href = '/'
            }
        }
    });
});
$("#login").click(function () {
    var username = $("#tk").val()
    var password = $("#mk").val()

    if (username.length == 0 || password.length == 0) {
        thongbao("Thông tin đăng nhập không được để trống");
        return;
    }
    if (username.length < 6 || password.length < 6) {
        thongbao("Thông tin đăng nhập phải là 1 chuỗi kí tự lớn hơn hoặc bằng 6 kí tự");
        return;
    }
    if (username.length > 16 || password.length > 16) {
        thongbao("Thông tin đăng nhập phải là 1 chuỗi kí tự nhỏ hơn hoặc bằng 16 kí tự");
        return;
    }
    var arr = username.match(/([0-9]|[a-z]|[A-Z])/g);
    if (arr.length != username.length) {
        thongbao("Tài khoản và mật khẩu phải là 1 chuỗi kí tự từ a -> z, A -> Z hoặc 0 -> 9");
        return;
    }
    var arrz = password.match(/([0-9]|[a-z]|[A-Z])/g);
    if (arrz.length != password.length) {
        thongbao("Tài khoản và mật khẩu phải là 1 chuỗi kí tự từ a -> z, A -> Z hoặc 0 -> 9");
        return;
    }

    $.ajax({
        url: '/auth/login',
        type: "POST",
        dataType: "text",
        data: { username: username, password: password },
        success: function (res) {

            thongbao(JSON.parse(res).msg)
            if (JSON.parse(res).error == 0) {
                window.location.href = '/'
            }
        }
    });
});
