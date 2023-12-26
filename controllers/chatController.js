const { Chat } = require('../models/chatSchema');
const { Member } = require('../models/memberSchema');
const { Room } = require('../models/roomSchema');
const socketHandler = require('../sockets/socketHandler');


module.exports = {
    newUser: async (req, res) => {
        try {
            const roomId = req.query.roomId;
            const isRoomExisting = await Room.findOne({ user: roomId });

            if (isRoomExisting && isRoomExisting.status === "Created") {
                const io = socketHandler.getIO();
                io.emit('join_room', roomId);
                res.status(200).json(isRoomExisting);
            } else {
                res.status(404).send('Room not found');
            }
        } catch (error) {
            console.error('Error checking room:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    roomDetails: async (req, res) => {
        try {
            let room;
            const roomId = req.query.roomId; // Extract roomId from query parameters
            room = await Room.findOne({ user: roomId }); // Adjust your query to match the room ID
            if (room === null) {
                room = await Room.findOne({ _id: roomId });
            }
            res.status(200).json(room);
        } catch (error) {
            res.status(500).json({ message: "Can't find the room...!" });
        }
    },

    // roomDetails: async (req, res) => {
    //     try {
    //         let room;
    //         const roomId = req.query.roomId; // Extract roomId from query parameters
    //         room = await Room.findOne({ user: roomId }); // Adjust your query to match the room ID
    //         if (room === null) {
    //             room = await Room.findOne({ _id: roomId });
    //             res.status(200).json(room);
    //         } else {
    //             await room.updateOne({ userEntered: true, status: "Archived" });
    //             res.status(200).json({ room, redirectToPrevious: true });
    //             // res.status(200).json(room);
    //         }
    //     } catch (error) {
    //         res.status(500).json({ message: "Can't find the room...!" });
    //     }
    // },

    // specificRoomOfUser: async (req, res) => {
    //     try {
    //         const roomId = req.query.roomId; // Extract roomId from query parameters
    //         const room = await Room.findOne({ user: roomId }); // Adjust your query to match the room ID
    //         await room.updateOne({ userEntered: true })
    //         const AdminMobile = await Member.findOne({ _id: room.admin }).select([
    //             "number"
    //         ])
    //         const UserMobile = await Member.findOne({ _id: room.user }).select([
    //             "number"
    //         ])
    //         res.status(200).json({ room, AdminMobile, UserMobile });
    //     } catch (error) {
    //         res.status(500).json({ message: "Can't find the room...!" });
    //     }
    // },

    specificRoomOfUser: async (req, res) => {
        try {
            const roomId = req.query.roomId;
            const room = await Room.findOneAndUpdate(
                { user: roomId },
                { $set: { userEntered: true } },
                { new: true }
            ).lean();

            if (!room) {
                return res.status(404).json({ message: "Room not found" });
            }

            const [AdminMobile, UserMobile] = await Promise.all([
                Member.findOne({ _id: room.admin }).select("number").lean(),
                Member.findOne({ _id: room.user }).select("number").lean()
            ]);

            res.status(200).json({ room, AdminMobile, UserMobile });
        } catch (error) {
            res.status(500).json({ message: "Can't find the room" });
        }
    },

    specificRoomOfAdmin: async (req, res) => {
        try {
            const roomId = req.query.roomId;
            const room = await Room.findOne({ _id: roomId });
            const user = await Member.findOne({ _id: room.user });

            // Fetch the latest message sent by the user associated with the room
            const latestMessage = await Chat.findOne({ sender: user._id })
                .sort({ createdAt: -1 }) // Sort by createdAt in descending order to get the latest message
                .limit(1);

            // Access the 'updatedAt' time of the latest message, if available
            const updatedAt = latestMessage ? latestMessage.updatedAt : null;

            res.status(200).json({ room, user, updatedAt });
        } catch (error) {
            res.status(500).json({ message: "Can't find the room...!" });
        }
    },

    allContacts: async (req, res, next) => {
        try {
            const contacts = await Member.find({ admin: { $ne: true } }).select([
                "number"
            ])
            return res.json(contacts)
        } catch (error) {
            next(error)
        }
    },
    addMessage: async (req, res) => {
        try {
            const { sender, receiver, message } = req.body;
            let dataField;
            console.log(req.body);
            const room = await Room.findOne({ user: { $in: [sender, receiver] } });
            if ((Array.isArray(message) && message.length === 2) && (((/^https:\/\/.*\.pdf$/i).test(message[0])))) {
                // Assuming a message related to PDF (contains PDF URL and filename)
                dataField = 'file'; // Assuming 'file' is intended as a string

                const chatData = {};
                chatData['message.' + dataField] = {
                    pdfURL: message[0],
                    filename: message[1]
                };

                const data = await Chat.create({
                    ...chatData,
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver
                });

                if (data) {
                    try {
                        if (room) {
                            await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                            return res.json({ msg: "Message added successfully." });
                        } else {
                            return res.status(404).json({ msg: "Room not found." });
                        }
                    } catch (error) {
                        console.error("Error updating room lastMessage:", error);
                        return res.status(500).json({ msg: "Internal Server Error" });
                    }
                } else {
                    return res.json({ msg: "Failed to add message." });
                }
            } else if ((Array.isArray(message) && message.length > 0) && ((((/^https:\/\/.*\.png$/i).test(message[0]))) || (((/^https:\/\/.*\.jpg$/i).test(message[0]))))) {
                dataField = 'photo'; // Assuming 'file' is intended as a string

                const chatData = {};
                chatData['message.' + dataField] = {
                    imageURL: message[0],
                    filename: message[1]
                };

                const data = await Chat.create({
                    ...chatData,
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver
                });

                if (data) {
                    try {
                        if (room) {
                            await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                            return res.json({ msg: "Message added successfully." });
                        } else {
                            return res.status(404).json({ msg: "Room not found." });
                        }
                    } catch (error) {
                        console.error("Error updating room lastMessage:", error);
                        return res.status(500).json({ msg: "Internal Server Error" });
                    }
                } else {
                    return res.json({ msg: "Failed to add message." });
                }
            } else if ((Array.isArray(message) && message.length > 0) && ((/^https:\/\/.*\.mp4$/i).test(message[0]))) {
                dataField = 'video'; // Assuming 'file' is intended as a string

                const chatData = {};
                chatData['message.' + dataField] = {
                    videoURL: message[0],
                    filename: message[1]
                };

                const data = await Chat.create({
                    ...chatData,
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver
                });

                if (data) {
                    try {
                        if (room) {
                            await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                            return res.json({ msg: "Message added successfully." });
                        } else {
                            return res.status(404).json({ msg: "Room not found." });
                        }
                    } catch (error) {
                        console.error("Error updating room lastMessage:", error);
                        return res.status(500).json({ msg: "Internal Server Error" });
                    }
                } else {
                    return res.json({ msg: "Failed to add message." });
                }
            } else if ((Array.isArray(message) && message.length === 3) && (typeof message[0] === 'number') && (typeof message[1] === 'number') && (typeof message[2] === 'number')) {

                dataField = 'location';

                const chatData = {};
                chatData['message.' + dataField] = {
                    latitude: message[0],
                    longitude: message[1],
                    accuracy: message[2]
                };

                const data = await Chat.create({
                    ...chatData,
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver
                });

                if (data) {
                    try {
                        if (room) {
                            await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                            return res.json({ msg: "Message added successfully." });
                        } else {
                            return res.status(404).json({ msg: "Room not found." });
                        }
                    } catch (error) {
                        console.error("Error updating room lastMessage:", error);
                        return res.status(500).json({ msg: "Internal Server Error" });
                    }
                }
                else {
                    return res.json({ msg: "Failed to add message." });
                }
            } else if (message === "Video Call" || message === "Audio Call") {
                const chatData = {
                    message: {
                        text: null, // Set this if you have a message text, otherwise, keep it null
                        call: {
                            video: { is: message === "Video Call" },
                            audio: { is: message === "Audio Call" },
                        },
                        // ... other fields if applicable
                    },
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver,
                };

                try {
                    const data = await Chat.create(chatData);
                    if (data) {
                        try {
                            if (room) {
                                await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                                return res.json({ msg: "Message added successfully." });
                            } else {
                                return res.status(404).json({ msg: "Room not found." });
                            }
                        } catch (error) {
                            console.error("Error updating room lastMessage:", error);
                            return res.status(500).json({ msg: "Internal Server Error" });
                        }
                    }
                } catch (error) {
                    console.error("Error creating chat data:", error);
                    return res.status(500).json({ msg: "Cant add chat..!" })
                }

            } else {
                // Regular text message
                dataField = 'text'; // Assuming 'text' is intended as a string

                const chatData = {};
                chatData['message.' + dataField] = message;

                const data = await Chat.create({
                    ...chatData,
                    users: [sender, receiver],
                    sender: sender,
                    receiver: receiver
                });

                if (data) {
                    try {
                        if (room) {
                            await Room.findByIdAndUpdate(room._id, { lastMessage: data._id });
                            return res.json({ msg: "Message added successfully." });
                        } else {
                            return res.status(404).json({ msg: "Room not found." });
                        }
                    } catch (error) {
                        console.error("Error updating room lastMessage:", error);
                        return res.status(500).json({ msg: "Internal Server Error" });
                    }
                }
                else {
                    return res.json({ msg: "Failed to add message." });
                }
            }
        } catch (error) {
            return res.status(500).json({ message: "Can't add chat..." });
        }
    },


    // uploadPDFToCloudinary: async (req, res) => {

    //     console.log(req.file, "kahjbfdsjkh");
    //     try {
    //         if (!req.file) {
    //             return res.status(400).json({ error: 'No file uploaded!' });
    //         }

    //         // Upload the PDF file to Cloudinary
    //         cloudinary.uploader.upload(req.file.path, { resource_type: "raw" }, (error, result) => {
    //             if (error) {
    //                 console.error('Error uploading to Cloudinary:', error);
    //                 return res.status(500).json({ message: 'Failed to upload PDF to Cloudinary' });
    //             }

    //             // Once uploaded, you can obtain the public URL of the PDF
    //             const pdfURL = result.secure_url;
    //             res.status(200).json({ pdfURL: pdfURL });
    //         });
    //     } catch (error) {
    //         console.error('Error handling PDF file:', error);
    //         res.status(500).json({ message: "Can't Upload PDF to Cloudinary" });
    //     }
    // },

    getAllMessage: async (req, res, next) => {
        try {
            const { from, to } = req.query;
            await Chat.updateMany({ receiver: from, sender: to, read: false }, { $set: { read: true } });
            const messages = await Chat.find({ users: { $all: [from, to] } }).sort({ updatedAt: 1 })
            const projectedMessages = messages.map((msg) => {
                return {
                    fromSelf: msg.sender.toString() === from,
                    message: msg.message,
                    updatedAt: msg.updatedAt,
                    id: msg._id
                };
            });
            res.json(projectedMessages);
        } catch (error) {
            next(error);
        }
    },

    destroyChat: async (req, res) => {
        try {
            const userId = req.query.userId;
            console.log(userId);
            const updatedRoom = await Room.findOneAndUpdate(
                { user: userId },
                { $set: { status: "Terminated" } },
                { new: true }
            );

            if (!updatedRoom) {
                return res.status(404).json({ message: "Room not found for the given user" });
            }

            return res.status(200).json({ message: "Chat destroyed successfully", room: updatedRoom });
        } catch (error) {
            console.error('Error destroying chat:', error);
            return res.status(500).json({ message: "Can't destroy chat..." });
        }
    },

    updateEnteredUsers: async (req, res) => {
        try {
            const callId = req.query.callId;
            const user = req.query.user;
            const type = req.query.type;

            const chat = await Chat.findById(callId);
            if (!chat) {
                return res.status(404).json({ message: "Chat not found" });
            }

            if (!chat.message.call[type].enteredUsers.includes(user)) {
                chat.message.call[type].enteredUsers.push(user);
                await chat.save();
            }
            console.log(chat);
            return res.status(200).json({ message: "Entered successfully", chat });
        } catch (error) {
            return res.status(500).json({ message: "Can't update status..." });
        }
    },

    secondUser: async (req, res) => {
        try {
            const type = req.query.type;
            const callId = req.query.callId;
            const chat = await Chat.findOne({ _id: callId });
            if (!chat) {
                return res.status(404).json({ msg: "Chat not found" });
            }
            const enteredUsers = chat.message.call[type].enteredUsers;

            if (enteredUsers.length === 2) {
                // Retrieve the second user from the enteredUsers array
                const secondUser = enteredUsers[1];
                return res.status(200).json({ secondUser });
            } else {
                return res.status(404).json({ msg: "Second user not found" });
            }
        } catch (error) {
            return res.status(404).json({ msg: "You are the first user..!" });
        }
    }
};
