const Hisnapvang = require('../models/Hisnapvang')
const Hisnapthoi = require('../models/HisnhapThoi')
const Hisoutmoney = require('../models/Hisoutmoney')
const moment = require('moment')

thongKeVangNapThoiServer = async (date) => {
    var now = new Date();
    var DATE = null
    if (date == "day") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    else {
        DATE = new Date(now.getFullYear(), now.getMonth());
    }
    var zzz = await Hisnapthoi.aggregate([
        {
            $match: {
                time: { $gte: DATE }, status: 1
            }
        },
        {
            $group: {
                _id: {
                    "server": "$server"
                },
                "tongvang": { $sum: "$sovang" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "server": "$_id.server",
                "tongvang": "$tongvang"
            }
        },
        { $sort: { "server": 1 } }
    ])
    return zzz
}
thongKeVangNapServer = async (date) => {
    var now = new Date();
    var DATE = null
    if (date == "day") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    else {
        DATE = new Date(now.getFullYear(), now.getMonth());
    }
    var zzz = await Hisnapvang.aggregate([
        {
            $match: {
                time: { $gte: DATE }, status: 1
            }
        },
        {
            $group: {
                _id: {
                    "server": "$server"
                },
                "tongvang": { $sum: "$sovang" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "server": "$_id.server",
                "tongvang": "$tongvang"
            }
        },
        { $sort: { "server": 1 } }
    ])
    return zzz
}

thongkeRuttien = async (date) => {
    var now = new Date();
    var DATE = null
    if (date == "day") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    else {
        DATE = new Date(now.getFullYear(), now.getMonth());
    }
    const zzz = await Hisoutmoney.aggregate([
        { $match: { time: { $gte: DATE }, $or: [{ status: 1 }, { status: 2 }] } }
        ,
        {
            $group: {
                _id: {
                    "server": "$server"
                },
                "tongtien": { $sum: "$sotien" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "server": "$_id.server",
                "tongtien": "$tongtien"
            }
        },
        { $sort: { "server": 1 } }
    ])
    return zzz
}


thongkeRuttienType = async (date) => {
    var now = new Date();
    var DATE = null
    if (date == "day") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    else {
        DATE = new Date(now.getFullYear(), now.getMonth());
    }
    const zzz = await Hisoutmoney.aggregate([
        { $match: { time: { $gte: DATE }, $or: [{ status: 1 }, { status: 2 }] } }
        ,
        {
            $group: {
                _id: {
                    "type": "$type"
                },
                "tongtien": { $sum: "$sotien" }
            }
        },
        {
            "$project": {
                "_id": 0,
                "type": "$_id.type",
                "tongtien": "$tongtien"
            }
        },
        { $sort: { "type": 1 } }
    ])
    return zzz
}


thongkeCount = async (date) => {
    var now = new Date();
    var DATE = null
    if (date == "day") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    else if (date == "20") {
        DATE = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 9);
        console.log(DATE.toLocaleDateString())
    }
    else {
        DATE = new Date(now.getFullYear(), now.getMonth());
    }

    var zzz = await Hisoutmoney.countDocuments({ $or: [{ status: 1 }, { status: 2 }], time: { $gte: DATE } })
    return DATE.toLocaleDateString() + " to " + new Date(now.getFullYear(), now.getMonth(), now.getDate()) + " là " + zzz + " đơn thành công"
}


module.exports = {
    thongKeVangNapServer: thongKeVangNapServer,
    thongkeRuttien: thongkeRuttien,
    thongkeCount: thongkeCount,
    thongKeVangNapThoiServer: thongKeVangNapThoiServer,
    thongkeRuttienType: thongkeRuttienType
}