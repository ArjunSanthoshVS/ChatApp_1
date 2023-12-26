const mongoose = require("mongoose")

const chatSchema = new mongoose.Schema({
    message: {
        text: {
            type: String,
        },
        file: {
            pdfURL: String,
            filename: String
        },
        photo: {
            imageURL: String,
            filename: String
        },
        video: {
            videoURL: String,
            filename: String
        },
        camera: {
            type: Boolean,
            default: false
        },
        location: {
            latitude: Number,
            longitude: Number,
            accuracy: Number
        },
        call: {
            video: {
                is: { type: Boolean, default: false },
                enteredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
            },
            audio: {
                is: { type: Boolean, default: false },
                enteredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
            },
        },
    },
    users: Array,
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true
    }
);

const Chat = mongoose.model("chat", chatSchema)

module.exports = { Chat }