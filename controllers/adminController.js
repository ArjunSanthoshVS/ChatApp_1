require('dotenv').config()
const axios = require('axios');
const { Room } = require('../models/roomSchema');
const { Member } = require('../models/memberSchema');
const { Chat } = require('../models/chatSchema');
const BASE_URL = "http://localhost:3000";

module.exports = {
    // sendLink: async (req, res) => {
    //     try {
    //         const { whatsappNumber, message } = req.body;
    //         let finalUrl = '';

    //         // Create a Member with the provided WhatsApp number
    //         const newMember = await Member.create({ number: whatsappNumber });

    //         // Create a Room referencing the created Member's _id
    //         const newRoom = await Room.create({ user: newMember._id, admin: process.env.ADMIN_ID });

    //         const roomId = newMember._id;
    //         const link = `${BASE_URL}/chat?roomId=${roomId}`;

    //         console.log(link);


    //         /////////////  Integrating  Shareaholic url shortener  //////////////
    //         // const shareaholic_link = `https://www.shareaholic.com/v2/share/shorten_link?apikey=${process.env.SHAREAHOLIC_API_KEY}&url=${link}`
    //         // console.log(shareaholic_link);
    //         // const shareaholic_response = await axios.get(shareaholic_link);
    //         // const shortenedURL1 = shareaholic_response.data

    //         // console.log(shortenedURL1);


    //         /////////////  Integrating  Shrtlnk url shortener  //////////////
    //         // Shrtlnk API Integration
    //         const shrtlnkApiKey = process.env.SHRTLNK_API_KEY; // Replace with your actual API key
    //         const shrtlnkEndpoint = 'https://shrtlnk.dev/api/v2/link';

    //         const shrtlnk_headers = {
    //             'api-key': shrtlnkApiKey,
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json'
    //         };

    //         const requestBody = {
    //             url: link
    //         };

    //         axios.post(shrtlnkEndpoint, requestBody, { headers: shrtlnk_headers })
    //             .then(response => {
    //                 console.log('Shortened URL from Shrtlnk:', response.data.shrtlnk);
    //                 const shortenedUrl1 = response.data.shrtlnk;

    //                 // Shorte.st API Integration
    //                 const shortestApiToken = process.env.SHORTEST_API_KEY; // Replace with your actual API token
    //                 const shortestEndpoint = 'https://api.shorte.st/v1/data/url';

    //                 const shortest_headers = {
    //                     'public-api-token': shortestApiToken
    //                 };

    //                 const formData = new URLSearchParams();
    //                 formData.append('urlToShorten', shortenedUrl1);

    //                 return axios.put(shortestEndpoint, formData, { headers: shortest_headers });
    //             })
    //             .then(shortestResponse => {
    //                 console.log('Shortened URL from Shorte.st:', shortestResponse.data.shortenedUrl);
    //                 // Use shortestResponse.data.shortenedUrl as the final shortened URL
    //                 const shortenedUrl2 = shortestResponse.data.shortenedUrl

    //                 //     //url-s.xyz API Integration
    //                 //     const urlsAPiToken = process.env.URL_S_XYZ_API_KEY
    //                 //     console.log(urlsAPiToken);
    //                 //     const urlsEndpoint = 'https://url-s.xyz/api/url/add'

    //                 //     const requestData = {
    //                 //         url: shortenedUrl2 // Replace with the URL you want to shorten
    //                 //     };

    //                 //     const urls_headers = {
    //                 //         'Authorization': `Bearer ${urlsAPiToken}`,
    //                 //         'Content-Type': 'application/json'
    //                 //     };

    //                 //     return axios.post(urlsEndpoint, requestData, { headers: urls_headers })
    //                 // })
    //                 // .then(response => {
    //                 //     const shortenedUrl3 = response.data.shorturl
    //                 //     console.log('Shortened URL from url-s.xyz:', response.data.shorturl);

    //                 //     // Jio Url API Integrating
    //                 //     const jioUrlApiToken = process.env.JIOURL_API_KEY
    //                 //     const jioUrlEndpoint = 'https://jiourl.com/api/url/add'

    //                 //     const requestData = {
    //                 //         url: shortenedUrl3
    //                 //     };

    //                 //     const jiourl_headers = {
    //                 //         'Authorization': `Bearer ${jioUrlApiToken}`,
    //                 //         'Content-Type': 'application/json'
    //                 //     };
    //                 //     return axios.post(jioUrlEndpoint, requestData, { headers: jiourl_headers })

    //                 // })
    //                 // .then(response => {
    //                 //     const shortenedUrl4 = response.data.shorturl
    //                 //     console.log('Shortened URL from Jio Url:', shortenedUrl4);


    //                 const apiKey = process.env.URLDAY_API_KEY; // Replace with your actual API key
    //                 const endpoint = 'https://www.urlday.com/api/v1/links';

    //                 // Data to be sent in the request
    //                 const requestData = {
    //                     url: shortenedUrl2, // Replace with the URL you want to shorten
    //                 };

    //                 // Headers for the request
    //                 const headers = {
    //                     'Content-Type': 'application/x-www-form-urlencoded',
    //                     'Authorization': `Bearer ${apiKey}`,
    //                 };

    //                 return axios.post(endpoint, requestData, { headers })
    //             })
    //             .then(response => {
    //                 console.log('Shortened URL:', response.data.data.short_url);
    //                 const shortenedUrl3 = response.data.data.short_url


    //                 // RECUT API Integrating
    //                 const apiKey = process.env.RECUT_API_KEY; // Replace with your actual API key
    //                 const endpoint = 'https://app.recut.in/api/url/add';

    //                 // Data to be sent in the request
    //                 const requestData = {
    //                     url: shortenedUrl3, // Replace with the URL you want to shorten
    //                 };

    //                 // Headers for the request
    //                 const headers = {
    //                     'Authorization': `Bearer ${apiKey}`,
    //                     'Content-Type': 'application/json',
    //                 };

    //                 return axios.post(endpoint, requestData, { headers })
    //             })
    //             .then(response => {
    //                 console.log('Shortened URL:', response.data.shorturl);
    //                 const shortenedUrl4 = response.data.shorturl
    //                 finalUrl = response.data.shorturl


    //                 const messagePayload = {
    //                     api_key: process.env.WHATSAPP_API_KEY,
    //                     sender: "917090166621",
    //                     number: whatsappNumber,
    //                     message: `${message}, ${finalUrl}`
    //                 };

    //                 // Send the message with the link
    //                 const apiUrl = process.env.WHATSAPP_API_URL;
    //                 axios.post(apiUrl, messagePayload);

    //                 // console.log('Message sent:', message);
    //                 res.status(200).json({ message: 'Message sent successfully' });
    //                 //     // Linkly Integrating
    //                 //     const apiKey = process.env.LINKLY_API_KEY; // Replace with your actual API key
    //                 //     const endpoint = 'https://app.linklyhq.com/api/v1/link';

    //                 //     const requestData = {
    //                 //         url: shortenedUrl4, // Replace with the URL you want to shorten
    //                 //         workspace_id: process.env.LINKLY_WORKSPACE_ID, // Replace with your workspace ID
    //                 //     };

    //                 //     const headers = {
    //                 //         'Authorization': `Bearer ${apiKey}`,
    //                 //         'Content-Type': 'application/json',
    //                 //     };

    //                 //     return axios.post(endpoint, requestData, { headers })
    //                 // })
    //                 // .then(response => {
    //                 //     console.log('Link created/updated:', response.data);
    //                 //     const shortenedUrl5 = response.data
    //             })
    //             .catch(error => {
    //                 console.error('Error:', error);
    //                 // Handle error here
    //             });



    //     } catch (error) {
    //         console.error('Error sending message:', error);
    //         res.status(500).json({ error: 'Failed to send message' });
    //     }
    // },

    sendLink: async (req, res) => {
        try {
            const { whatsappNumber, message } = req.body;

            // Create a Member with the provided WhatsApp number
            const newMember = await Member.create({ number: whatsappNumber });

            // Create a Room referencing the created Member's _id
            const newRoom = await Room.create({ user: newMember._id, admin: process.env.ADMIN_ID });

            const roomId = newMember._id;
            const link = `${BASE_URL}/chat?roomId=${roomId}`;

            console.log(link);

            const messagePayload = {
                api_key: process.env.WHATSAPP_API_KEY,
                sender: process.env.WHATSAPP_SENDER,
                number: whatsappNumber,
                message: `${message}, ${link}`
            };

            // Send the message with the link
            const apiUrl = process.env.WHATSAPP_API_URL;
            const response = await axios.post(apiUrl, messagePayload);

            console.log('Message sent:', response);
            res.status(200).json({ message: 'Message sent successfully' });

        } catch (error) {
            console.error('Error sending message:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    },

    activeChats: async (req, res) => {
        try {
            const rooms = await Room.find({ status: "Created" })

            const usersWithLastRoomMessage = [];

            for (const room of rooms) {
                console.log(room);
                const user = await Member.findOne({ _id: room.user }).select("number")
                const unreadMessagesCount = await Chat.countDocuments({
                    receiver: room.admin, // Identify the recipient/user
                    read: false // Fetch unread messages
                });
                let lastMessageText = null;
                let lastMessageTime = null;
                if (room.lastMessage) {
                    const lastChat = await Chat.findById(room.lastMessage);
                    if (lastChat) {
                        if (lastChat && lastChat?.message && lastChat?.message?.text) {
                            lastMessageText = lastChat?.message?.text;
                        } else if (lastChat && lastChat?.message && lastChat?.message?.file?.pdfURL) {
                            console.log("PDF");
                            lastMessageText = "PDF file attachment"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.photo?.imageURL) {
                            console.log("Picture");
                            lastMessageText = "Picture File"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.video?.videoURL) {
                            lastMessageText = "Video File"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.location?.accuracy) {
                            lastMessageText = "Location"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.call?.video?.is) {
                            lastMessageText = "Video Call"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.call?.audio?.is) {
                            lastMessageText = "Audio Call"
                        } else {
                            lastMessageText = "Camera picture"
                        }
                        lastMessageTime = lastChat.updatedAt;
                    } else {
                        console.log("there is no last chat..!");
                    }
                }


                usersWithLastRoomMessage.push({
                    roomId: room._id,
                    user,
                    lastMessage: lastMessageText,
                    lastMessageTime: formattedTime(lastMessageTime),
                    unreadMessagesCount
                });
            }

            res.status(200).json(usersWithLastRoomMessage);
        } catch (error) {
            console.error("Error fetching users and last messages:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    archivedChats: async (req, res) => {
        try {
            const rooms = await Room.find({ status: "Archived" })

            const usersWithLastRoomMessage = [];

            for (const room of rooms) {
                const user = await Member.findOne({ _id: room.user }).select("number")

                let lastMessageText = null;
                let lastMessageTime = null;
                if (room.lastMessage) {
                    const lastChat = await Chat.findById(room.lastMessage);
                    if (lastChat) {
                        if (lastChat && lastChat?.message && lastChat?.message?.text) {
                            console.log("text");
                            lastMessageText = lastChat?.message?.text;
                        } else if (lastChat && lastChat?.message && lastChat?.message?.file?.pdfURL) {
                            console.log("PDF");
                            lastMessageText = "PDF file attachment"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.photo?.imageURL) {
                            console.log("Picture");
                            lastMessageText = "Picture File"
                        } else if (lastChat && lastChat?.message && lastChat?.message?.video?.videoURL) {
                            lastMessageText = "Video File"
                        } else {
                            lastMessageText = "Camera picture"
                        }
                        lastMessageTime = lastChat.updatedAt;
                    } else {
                        console.log("there is no last chat..!");
                    }
                }


                usersWithLastRoomMessage.push({
                    roomId: room._id,
                    user,
                    lastMessage: lastMessageText,
                    lastMessageTime: formattedTime(lastMessageTime)
                });
            }

            res.status(200).json(usersWithLastRoomMessage);
        } catch (error) {
            console.error("Error fetching users and last messages:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
};

const formattedTime = (timestamp) => {
    const currentDate = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((currentDate - messageDate) / 1000);

    // Less than 1 minute, show 'now'
    if (diffInSeconds < 60) {
        return 'now';
    }

    // Less than 1 hour, show minutes ago
    if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    // Show the time in HH:mm format
    const options = { hour: 'numeric', minute: 'numeric' };
    return messageDate.toLocaleString('en-US', options);
}
