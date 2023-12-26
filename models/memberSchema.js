const mongoose = require("mongoose")

const memberSchema = new mongoose.Schema({
    number: String,
    admin: { type: Boolean, default: false }
    // rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }] // Reference to rooms
})

const Member = mongoose.model("Member", memberSchema)

module.exports = { Member }
