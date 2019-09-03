
const moment = require('moment')
var _ = require('underscore')
let usocket = {}
let room = {}
function privateSocket (io, toId) {
  // 寻找socket 保存的 socket 对象
  return (_.findWhere(io.sockets.sockets, { id: toId }));
}
module.exports = {
    init(io) {
        io.on('connection', socket => {
            socket.on('newUser', data => {
                console.log(1234);
                this.newUser(data)
                socket.emit('aabb', 112233)
            })
            socket.on('singleSendMsg', data => {
                this.singleSendMsg(data)
            })
            socket.on('joinGroup', data => {
                this.joinGroup(data)
            })
            socket.on('groupSendMsg', data => {
                this.groupSendMsg(data)
            })
            socket.on('loveGroup', data => {
                this.loveGroup(data)
            })
        })
        io.on('disconnect', () => {
            console.log(1)
        })
    },
    newUser(data) {
        // 用户加入
        if (!data || !data.userId) {
            return
        }
        usocket[data.userId] = socket.id
    },
    singleSendMsg(data) {
        if (!data.toUserId || !usocket[data.toUserId]) {
            return
        }
        const sendData = {
            userName: data.userName,
            sendName: data.sendName,
            userId: data.userId,
            toUserId: data.toUserId,
            msg: data.msg,
            sign: data.sign,
            msgArr: [{
                msg: data.msg,
                sign: 'he',
                id: Math.random() * 1000 + 'node'
            }],
            date: moment().format('YYYY-MM-DD HH:mm:ss')
        }
        const toId = usocket[data.toUserId] || null
        if (toId && privateSocket(io, toId)) {
            // 找出接收消息的socket 触发事件
            privateSocket(io, toId).emit('privatChat', sendData)
            return
        }
        if (!privateSocket(io, toId) && toId) {
            // 发送消息好友不在线是触发事件
            let exitData = {
                userName: sendData.userName,
                toUserId: data.toUserId
            }
            socket.emit('accountExit', exitData)
        }
    },
    joinGroup(data) {
        if (!room[data.roomId]) {
            room[data.roomId] = []
        }
        // 保存一份房间用户列表
        room[data.roomId].push(data.userName)
        socket.join(data.roomId)
        socket.to(data.roomId).emit('sys', data, room[data.roomId])
    },
    groupSendMsg(data) {
        if (!data.roomId || !data.userName) {
            return
        }
        socket.to(data.roomId).emit('groupMsg', data)
    },
    loveGroup (data) {
        socket.leave(data.roomId)
        socket.to(data.roomId).emit('sys', data.userName + '退出了房间')
    }
}
