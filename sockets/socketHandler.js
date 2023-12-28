const socketIO = require('socket.io');
const { Room } = require('../models/roomSchema');

let io;

const memberTokens = {};

module.exports = {
    init: (server) => {
        io = socketIO(server);

        io.on('connection', (socket) => {
            console.log('Socket Connected');

            let disconnectTimeout;
            let userToken;
            const handleDisconnect = async () => {
                try {
                    if (!userToken) {
                        console.error('User token not found');
                        return;
                    }

                    const room = await Room.findOne({ user: userToken }).lean();
                    if (!room) {
                        console.error("Can't find the room...!");
                        return;
                    }

                    await Room.findOneAndUpdate(
                        { user: userToken },
                        { $set: { userEntered: true } },
                        { new: true }
                    );

                    console.log(`User ${userToken} has left and 'userEntered' is set to 'true'.`);
                } catch (error) {
                    console.error('Error updating userEntered field:', error);
                }
            };


            socket.on('join_room', (data) => {
                const { token, room } = data;
                if (token === room._id) {
                    console.log('Admin connected');
                    memberTokens[token] = socket.id;
                } else if (token === room.user) {
                    userToken = token
                    console.log('User connected');
                    memberTokens[token] = socket.id;
                } else {
                    console.log('Localhost Connected');
                    memberTokens[token] = socket.id;
                }
            });

            socket.on('typing', (data) => {
                const { socketSender, socketReceiver } = data;
                const receiverSocketId = memberTokens[socketReceiver];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('user_typing', { socketSender });
                }
            });

            socket.on('send_message', (data) => {
                const { socketSender, socketReceiver, message } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_message', { socketSender, message });
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('send_pdf', (data) => {
                const { socketSender, socketReceiver, content } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_pdf', content);
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('send_image', (data) => {
                const { socketSender, socketReceiver, content } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_image', content);
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('send_video', (data) => {
                const { socketSender, socketReceiver, content } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_video', content);
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('send_location', (data) => {
                const { socketSender, socketReceiver, content } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_location', content);
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            // socket.on('initiate_VideoCall', (data) => {
            //     console.log(data);
            //     const { socketSender, socketReceiver } = data;
            //     const senderSocketId = memberTokens[socketSender];
            //     const receiverSocketId = memberTokens[socketReceiver];
            //     if (senderSocketId || receiverSocketId) {
            //         console.log(senderSocketId, receiverSocketId);
            //         if (receiverSocketId) {
            //             socket.to(receiverSocketId).emit('receive_videoCall', { socketSender, socketReceiver });
            //         } else {
            //             const adminSocketId = memberTokens["656eaad81a36eeacd8cb6898"]
            //             console.log(adminSocketId);
            //             socket.to(adminSocketId).emit('admin_receive_videoCall', { socketSender, socketReceiver });
            //         }
            //     } else {
            //         console.log('Sender or receiver not found');
            //     }
            // });

            // socket.on('initiate_AudioCall', (data) => {
            //     const { socketSender, socketReceiver } = data;
            //     const senderSocketId = memberTokens[socketSender];
            //     const receiverSocketId = memberTokens[socketReceiver];
            //     if (senderSocketId || receiverSocketId) {
            //         socket.to(receiverSocketId).emit('receive_audioCall', { socketSender, socketReceiver });
            //     } else {
            //         console.log('Sender or receiver not found');
            //     }
            // });

            socket.on('send_video_call', (data) => {
                const { socketSender, socketReceiver, callId, message } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_video_call', { socketSender, callId, message });
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('send_audio_call', (data) => {
                const { socketSender, socketReceiver, callId, message } = data;
                const senderSocketId = memberTokens[socketSender];
                const receiverSocketId = memberTokens[socketReceiver];
                if (senderSocketId || receiverSocketId) {
                    socket.to(receiverSocketId).emit('receive_audio_call', { socketSender, callId, message });
                } else {
                    console.log('Sender or receiver not found');
                }
            });

            socket.on('disconnect', () => {
                console.log('Socket Disconnected');
                clearTimeout(disconnectTimeout);
                disconnectTimeout = setTimeout(handleDisconnect, 5000); // Adjust the timeout as needed
            });

            socket.on('refresh', () => {
                clearTimeout(disconnectTimeout);
            });
        });
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    },
};
