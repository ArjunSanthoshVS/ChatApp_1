// const mongoose = require("mongoose")

// const roomSchema = new mongoose.Schema({
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Member",
//     },
//     admin: {
//         type: mongoose.Schema.Types.ObjectId,
//     },
//     status: {
//         type: String,
//         default: "Created"
//     },
//     chats: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Chat",
//     }]
// },
//     {
//         timestamps: true
//     })

// const Room = mongoose.model("Room", roomSchema)

// module.exports = { Room }


const mongoose = require("mongoose")

const roomSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
    },
    status: {
        type: String,
        default: "Created"
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },
    ip: {
        type: String,
        default: null
    }
},
    {
        timestamps: true
    })

const Room = mongoose.model("Room", roomSchema)

module.exports = { Room }
