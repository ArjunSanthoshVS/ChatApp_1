
document.addEventListener('DOMContentLoaded', async function () {
    const BASE_URL = "https://chat-service-fhbc.onrender.com";
    // const BASE_URL = "http://localhost:3000";

    //Initializing all constiables
    const socket = io();
    let receiverMobileNumber;
    let adminToken = null;
    let userToken = null;
    let socketSender;
    let socketReceiver;
    let senderToken;
    let receiverToken;
    let token = null
    const urlParams = new URLSearchParams(window.location.search);
    token = urlParams.get("roomId");
    console.log(token);
    userToken = token



    // Function to send data using navigator.sendBeacon()
    // let isInternalNavigation = false;

    // function sendDataUsingFetch(userId) {
    //     const data = JSON.stringify({ userId });
    //     fetch(`${BASE_URL}/userLeave`, {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: data
    //     })
    //         .then(response => {
    //             console.log('Data sent successfully (fetch)');
    //         })
    //         .catch(error => {
    //             console.error('Error sending data (fetch):', error);
    //         });
    // }

    // Set flag for internal navigation
    // window.addEventListener('click', function (event) {
    //     const targetUrl = new URL(event.target.href);
    //     const currentUrl = new URL(window.location.href);
    //     if (targetUrl.hostname === currentUrl.hostname) {
    //         isInternalNavigation = true;
    //     } else {
    //         isInternalNavigation = false;
    //     }
    // });

    // window.addEventListener('beforeunload', function (event) {
    //     if (!isInternalNavigation && performance.navigation.type === 2) {
    //         sendDataUsingFetch(token);
    //     }
    // });





    // const getIPv4Addresses = async () => {
    //     try {
    //         const response = await fetch('https://api.ipify.org?format=json');
    //         const data = await response.json();
    //         return data.ip; // Return the IP address from the function
    //     } catch (error) {
    //         console.error('Error fetching IP address:', error);
    //     }
    // };

    // const userIp = await getIPv4Addresses()
    // console.log(userIp);

    const serverIp = await fetch('/chat/retrieveIp');  // Call backend endpoint
    const userIp = await serverIp.json();
    console.log("User IP (from server):", userIp);

    // fetching the fulll room details by using the url
    fetch(`${BASE_URL}/chat/roomDetails?roomId=${token}`)
        .then(response => response.json())
        .then(async data => {
            if (data.message) {
                window.location.href = '/error'
            }

            adminToken = data._id;
            if (userToken === data.user) {
                socket.emit('join_room', { token: userToken, room: data });
            } else {
                socket.emit('join_room', { token: adminToken, room: data });
            }

            // adminToken = data._id;
            // if (userToken === data.room.user) {
            //     if (data.redirectToPrevious) {
            //         window.location = '/error'
            //     } else {
            //         socket.emit('join_room', { token: userToken, room: data });
            //     }
            // } else {
            //     socket.emit('join_room', { token: adminToken, room: data });
            // }

            // Checking that who is entering the website. Is that user or Admin
            if (userToken === data.user) {
                await fetch(`${BASE_URL}/chat/specificRoomOfUser?roomId=${token}&ip=${userIp}`)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);
                        if (data.message) {
                            window.location.href = '/error'
                        }
                        receiverToken = data?.room?.admin;
                        senderToken = data?.room?.user;
                        socketSender = data?.room?.user
                        socketReceiver = data?.room?._id
                        localStorage.setItem("socketSender", socketSender)
                        localStorage.setItem("socketReceiver", socketReceiver)
                        localStorage.setItem("senderToken", senderToken)
                        localStorage.setItem("receiverToken", receiverToken)
                        localStorage.setItem("senderMobileNumber", data?.UserMobile?.number)
                        localStorage.setItem("receiverMobileNumber", data?.AdminMobile?.number)
                        document.getElementById("oppName").innerText = "Your chat is live...";
                        document.getElementById("profileName").innerText = "Your chat is live...";
                        document.getElementById("active_time").innerText = "Your chating with Admin";
                        document.getElementById("delete_icon").style.display = 'none'
                        fetchMessages(senderToken, receiverToken);
                    })
                    .catch(error => {
                        console.error('Error fetching specific room data:', error);
                    });
            } else {
                fetch(`${BASE_URL}/chat/specificRoomOfAdmin?roomId=${token}`)
                    .then(response => response.json())
                    .then(data => {
                        receiverToken = data?.room?.user;
                        senderToken = data?.room?.admin;
                        receiverMobileNumber = data?.user?.number;
                        socketSender = data?.room?._id
                        socketReceiver = data?.room?.user
                        localStorage.setItem("socketSender", socketSender)
                        localStorage.setItem("socketReceiver", socketReceiver)
                        localStorage.setItem("senderToken", senderToken)
                        localStorage.setItem("receiverToken", receiverToken)
                        localStorage.setItem("senderMobileNumber", "917090166621")
                        localStorage.setItem("receiverMobileNumber", receiverMobileNumber)
                        document.getElementById("oppName").innerText = `+${receiverMobileNumber}`;
                        document.getElementById("profileName").innerText = `+${receiverMobileNumber}`;
                        if (data.updatedAt) {
                            const time = formatMessageTimestamp(data?.updatedAt)
                            document.getElementById("active_time").innerText = `Active: ${time}`;
                        } else {
                            document.getElementById("active_time").innerText = "Not started a chat..!";
                        }
                        fetchMessages(senderToken, receiverToken);
                    })
                    .catch(error => {
                        console.error('Error fetching specific room data:', error);
                    });
            }
        })





    // Getting the input field to make the typing indicator
    const messageInput = document.querySelector('.form-control');
    const loader = document.getElementById('loader');
    const activeTime = document.getElementById('active_time');
    let typingStatusExists = false;

    messageInput.addEventListener('input', function () {
        socket.emit('typing', { socketSender, socketReceiver })
    });

    socket.on('user_typing', ({ socketSender }) => {
        console.log(`User with ID ${socketSender} is typing...`);
        activeTime.style.display = 'none';
        loader.style.display = 'block';

        if (!typingStatusExists) {
            showTypingStatus();
            typingStatusExists = true;
        }

        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            removeTypingStatus()
            loader.style.display = 'none';
            activeTime.style.display = 'block';
            typingStatusExists = false;
        }, 500);
    });

    function showTypingStatus() {
        const MessageContainer = document.getElementById("MSGContainer");
        MessageContainer.className = "w-100 align-self-end";

        const messageElement = document.createElement('div');
        messageElement.classList.add('d-flex', 'mb-4');

        const messageContent = document.createElement('div');
        messageContent.classList.add('align-self-center');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('px-3', 'py-2', 'rounded-m');
        messageBubble.classList.add('bg-theme', 'shadow-m', 'text-dark');

        const typingText = document.createElement('span');
        typingText.innerText = "typing";

        // Create the SVG element
        const svg = createTypingSVG();

        messageBubble.appendChild(typingText);
        messageBubble.appendChild(svg);

        const recipientImage = document.createElement('img');
        recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
        recipientImage.width = '45';
        recipientImage.height = '45';
        recipientImage.alt = 'img';
        recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');

        messageElement.appendChild(recipientImage);
        messageElement.appendChild(messageContent);
        messageContent.appendChild(messageBubble);
        MessageContainer.appendChild(messageElement);
    }

    function createTypingSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("viewBox", "0 0 200 200");
        svg.setAttribute("width", "30");
        svg.setAttribute("height", "30");

        // First circle
        const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle1.setAttribute("fill", "#8CC152");
        circle1.setAttribute("stroke", "#8CC152");
        circle1.setAttribute("stroke-width", "15");
        circle1.setAttribute("r", "15");
        circle1.setAttribute("cx", "40");
        circle1.setAttribute("cy", "100");

        const animate1 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate1.setAttribute("attributeName", "opacity");
        animate1.setAttribute("calcMode", "spline");
        animate1.setAttribute("dur", "2");
        animate1.setAttribute("values", "1;0;1;");
        animate1.setAttribute("keySplines", ".5 0 .5 1;.5 0 .5 1");
        animate1.setAttribute("repeatCount", "indefinite");
        animate1.setAttribute("begin", "-.4");

        circle1.appendChild(animate1);
        svg.appendChild(circle1);

        // Second circle
        const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle2.setAttribute("fill", "#8CC152");
        circle2.setAttribute("stroke", "#8CC152");
        circle2.setAttribute("stroke-width", "15");
        circle2.setAttribute("r", "15");
        circle2.setAttribute("cx", "100");
        circle2.setAttribute("cy", "100");

        const animate2 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate2.setAttribute("attributeName", "opacity");
        animate2.setAttribute("calcMode", "spline");
        animate2.setAttribute("dur", "2");
        animate2.setAttribute("values", "1;0;1;");
        animate2.setAttribute("keySplines", ".5 0 .5 1;.5 0 .5 1");
        animate2.setAttribute("repeatCount", "indefinite");
        animate2.setAttribute("begin", "-.2");

        circle2.appendChild(animate2);
        svg.appendChild(circle2);

        // Third circle
        const circle3 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle3.setAttribute("fill", "#8CC152");
        circle3.setAttribute("stroke", "#8CC152");
        circle3.setAttribute("stroke-width", "15");
        circle3.setAttribute("r", "15");
        circle3.setAttribute("cx", "160");
        circle3.setAttribute("cy", "100");

        const animate3 = document.createElementNS("http://www.w3.org/2000/svg", "animate");
        animate3.setAttribute("attributeName", "opacity");
        animate3.setAttribute("calcMode", "spline");
        animate3.setAttribute("dur", "2");
        animate3.setAttribute("values", "1;0;1;");
        animate3.setAttribute("keySplines", ".5 0 .5 1;.5 0 .5 1");
        animate3.setAttribute("repeatCount", "indefinite");
        animate3.setAttribute("begin", "0");

        circle3.appendChild(animate3);
        svg.appendChild(circle3);

        return svg;
    }

    function removeTypingStatus() {
        const MessageContainer = document.getElementById("MSGContainer");
        const lastChild = MessageContainer.lastElementChild;
        if (lastChild) {
            MessageContainer.removeChild(lastChild);
        }
    }

    // function fro fetching all the messages
    async function fetchMessages(senderToken, receiverToken) {
        try {
            const response = await fetch(`${BASE_URL}/chat/getAllMessage?from=${senderToken}&to=${receiverToken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            data.forEach(msg => {
                const time = formatMessageTimestamp(msg.updatedAt)
                if ((/^https:\/\/.*\.pdf$/i).test(msg?.message?.file?.pdfURL)) {
                    displayPdfMessage(time, msg?.message?.file?.filename, msg?.message?.file?.pdfURL, msg?.fromSelf); // Ensure 'fromSelf' is used here
                } else if ((/^https:\/\/.*\.png$/i).test(msg?.message?.photo?.imageURL) || (/^https:\/\/.*\.jpg$/i).test(msg?.message?.photo?.imageURL)) {
                    displayImageMessage(time, msg?.message?.photo?.filename, msg?.message?.photo?.imageURL, msg?.fromSelf)
                } else if ((/^https:\/\/.*\.mp4$/i).test(msg?.message?.video?.videoURL) || (/^https:\/\/.*\.mkv$/i).test(msg?.message?.video?.videoURL)) {
                    displayVideoMessage(time, msg?.message?.video?.filename, msg?.message?.video?.videoURL, msg?.fromSelf)
                } else if ((msg?.message?.location) && (msg?.message?.location.latitude) && (msg?.message?.location.longitude) && (msg?.message?.location.accuracy)) {
                    displayLocation(time, msg?.message?.location.latitude, msg?.message?.location.longitude, msg?.message?.location.accuracy, msg?.fromSelf)
                } else if ((msg?.message?.call) && (msg?.message?.call?.video) && (msg?.message?.call?.video?.is) && (msg?.message?.call?.video.enteredUsers.length < 2)) {
                    displayCall(time, msg?.id, "Video Call", msg?.fromSelf)
                } else if ((msg?.message?.call) && (msg?.message?.call?.video) && (msg?.message?.call?.video?.is) && (msg?.message?.call?.video.enteredUsers.length === 2)) {
                    displayMessage(time, "Video call is over", msg?.fromSelf)
                } else if ((msg?.message?.call) && (msg?.message?.call?.audio) && (msg?.message?.call?.audio?.is) && (msg?.message?.call?.audio.enteredUsers.length < 2)) {
                    displayCall(time, msg?.id, "Audio Call", msg?.fromSelf)
                } else if ((msg?.message?.call) && (msg?.message?.call?.audio) && (msg?.message?.call?.audio?.is) && (msg?.message?.call?.audio.enteredUsers.length === 2)) {
                    displayMessage(time, "Audio call is over", msg?.fromSelf)
                } else {
                    displayMessage(time, msg?.message?.text, msg?.fromSelf); // Ensure 'fromSelf' is used here
                }
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    }

    // Function to format message timestamp
    function formatMessageTimestamp(timestamp) {
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


    // Initialized and update the event for sending message.
    const arrowUpIcon = document.getElementById('sendMessage');
    arrowUpIcon.addEventListener('click', function () {
        const messageInput = document.querySelector('.form-control');
        const message = messageInput.value.trim();
        if (message !== '') {
            const time = Date.now()
            displayMessage(formatMessageTimestamp(time), message, true);
            fetch(`${BASE_URL}/chat/addMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: message }),
            });
            // after setting the message in database emiting the message to the receiver through socket.io
            socket.emit('send_message', { socketSender, socketReceiver, message });
            messageInput.value = '';
        } else {
            messageInput.value = '';
        }
    });

    // socket handler for receiving the message
    socket.on('receive_message', ({ senderToken, message }) => {
        const time = Date.now()
        displayMessage(formatMessageTimestamp(time), message, false);
    });

    // function for display the message with its same style in html file
    function displayMessage(time, message, isSelf) {

        if (isSelf) {
            document.getElementById("MSGContainer").className = "w-100 align-self-center ms-auto"
        } else {
            document.getElementById("MSGContainer").className = "w-100 align-self-end"
        }

        const MessageContainer = document.getElementById("MSGContainer");
        const messageElement = document.createElement('div');
        messageElement.classList.add('d-flex', 'mb-4');

        const messageContent = document.createElement('div');
        messageContent.classList.add('align-self-center');

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('px-3', 'py-2', 'rounded-m');
        messageBubble.innerText = message;
        messageBubble.style.fontSize = '13px'

        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;

        messageContent.appendChild(messageBubble);
        messageContent.appendChild(messageTimestamp);

        if (isSelf) {
            messageBubble.classList.add('bg-green-dark', 'shadow-m', 'text-white');
            messageElement.classList.add('justify-content-end');
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');

            messageElement.appendChild(messageContent);
            messageElement.appendChild(userImage);
            MessageContainer.appendChild(messageElement);

        } else {
            messageBubble.classList.add('bg-theme', 'shadow-m', 'text-dark');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');

            messageElement.appendChild(recipientImage);
            messageElement.appendChild(messageContent);
            MessageContainer.appendChild(messageElement);
        }
    }

    // Initializing all options for chat feature
    const fileOption = document.getElementById("fileOption")
    const photoOption = document.getElementById("photoOption")
    const videoOption = document.getElementById("videoOption")
    const cameraOption = document.getElementById("cameraOption")
    const locationOption = document.getElementById("locationOption")

    const closeMenu = () => {
        document.getElementById("menu-upload").classList.remove("menu-active");
        const menuHider = document.querySelector('.menu-hider');
        if (menuHider.classList.contains('menu-active')) {
            menuHider.classList.remove('menu-active');
        }
    }

    // Update the function to handle file selection and sending PDF
    fileOption.addEventListener("click", () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf'; // Limit to only PDF files

        // Set an event listener for when a file is selected
        input.addEventListener('change', async (event) => {
            const file = event.target.files[0]; // Get the selected file
            closeMenu()
            if (file) {
                try {
                    const reader = new FileReader();
                    reader.onload = async function (event) {
                        const fileContent = event.target.result; // Get the content of the file
                        const formData = new FormData();
                        formData.append('pdfFile', file);

                        const response = await fetch(`${BASE_URL}/chat/uploadPDF`, {
                            method: 'POST',
                            body: formData,
                        });

                        // Handle the response after uploading the PDF
                        if (response.ok) {
                            const data = await response.json();
                            const pdfURL = data.pdfURL; // URL of the uploaded PDF
                            const filename = data.filename; // URL of the uploaded PDF

                            fetch(`${BASE_URL}/chat/addMessage`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [pdfURL, filename] }),
                            });
                            const time = Date.now()
                            displayPdfMessage(formatMessageTimestamp(time), filename, pdfURL, true);

                            socket.emit('send_pdf', {
                                socketSender, socketReceiver, content: [pdfURL, filename]
                            });
                        } else {
                            console.error('Failed to upload PDF');
                        }
                    };
                    reader.readAsDataURL(file); // Read the file as data URL
                } catch (error) {
                    console.error('Error handling PDF file:', error);
                }
            }
        });

        input.click();
    });

    // // receiving the socket 
    socket.on('receive_pdf', (content) => {
        const time = Date.now()
        displayPdfMessage(formatMessageTimestamp(time), content[1], content[0], false);
    });

    // Modify the function for displaying PDF messages to create a download button
    async function displayPdfMessage(time, filename, pdfUrl, isSelf) {
        const MSGContainer = document.getElementById('MSGContainer');
        const pdfMessageContainer = document.createElement('div');
        pdfMessageContainer.classList.add('mb-5');
        const pdfDownloadLink = document.createElement('button');
        pdfDownloadLink.innerHTML = `<i class="fa-solid fa-circle-arrow-down"></i> <span style="font-style: italic;">${filename}</span>`;
        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;

        pdfDownloadLink.addEventListener('click', async (event) => {
            try {
                const response = await fetch(pdfUrl);
                const file = await response.blob();
                console.log("kjhgfd");
                const link = document.createElement("a")
                link.href = URL.createObjectURL(file);
                link.download = filename
                link.click(); // Trigger the download
            } catch (error) {
                alert("failed")
            }
        });

        if (isSelf === true) {
            pdfDownloadLink.classList.add('btn', 'bg-green-dark', 'shadow-m', 'text-white');
            pdfMessageContainer.classList.add("d-flex", "justify-content-end");
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');
            pdfMessageContainer.appendChild(messageTimestamp); // Append user image to the container
            pdfMessageContainer.appendChild(pdfDownloadLink); // Append download link to the container
            pdfMessageContainer.appendChild(userImage); // Append user image to the container
            MSGContainer.appendChild(pdfMessageContainer);
        } else {
            pdfDownloadLink.classList.add('btn', 'bg-theme', 'shadow-m', 'text-dark');
            pdfMessageContainer.classList.add('d-flex', 'recipient-pdf-message-container');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');
            pdfMessageContainer.appendChild(recipientImage);
            pdfMessageContainer.appendChild(pdfDownloadLink); // Append download link to the container
            pdfMessageContainer.appendChild(messageTimestamp); // Append user image to the container
            MSGContainer.appendChild(pdfMessageContainer);
        }
    }

    photoOption.addEventListener("click", () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.png, .jpg';
        input.multiple = true; // Allow selection of multiple files

        input.addEventListener('change', async (event) => {
            const files = event.target.files;
            closeMenu()
            if (files && files.length > 0) {
                try {
                    const formData = new FormData();

                    for (const file of files) {
                        formData.append('imageFile', file);
                    }

                    const response = await fetch(`${BASE_URL}/chat/uploadImage`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();

                        data.uploadedFiles.forEach(imageData => {
                            const imageUrl = imageData.imageUrl; // URL of the uploaded image
                            const filename = imageData.filename; // Name of the uploaded image
                            const time = Date.now()
                            displayImageMessage(formatMessageTimestamp(time), filename, imageUrl, true);
                            socket.emit('send_image', {
                                socketSender, socketReceiver, content: [imageUrl, filename]
                            });
                            fetch(`${BASE_URL}/chat/addMessage`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [imageUrl, filename] }),
                            });
                        })
                    } else {
                        console.error('Failed to upload image');
                    }
                } catch (error) {
                    console.error('Error handling image files:', error);
                }
            }
        });

        input.click();
    });

    // Receiving the socket
    socket.on('receive_image', (content) => {
        const time = Date.now()
        displayImageMessage(formatMessageTimestamp(time), content[1], content[0], false);
    });

    function displayImageMessage(time, filename, imageUrl, isSelf) {
        const MSGContainer = document.getElementById('MSGContainer');
        const imageMessageContainer = document.createElement('div');
        imageMessageContainer.classList.add('mb-5');

        const imagePreview = document.createElement('img');
        imagePreview.src = imageUrl;
        imagePreview.width = '60';
        imagePreview.height = '60';

        const imageDownloadLink = document.createElement('button');
        imageDownloadLink.innerHTML = `<i class="fa-solid fa-circle-arrow-down"></i> <span style="font-style: italic;">${filename}</span>`;

        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;

        imageDownloadLink.addEventListener('click', async (event) => {
            try {
                const response = await fetch(imageUrl);
                const file = await response.blob();
                const link = document.createElement("a")
                link.href = URL.createObjectURL(file);
                link.download = filename
                link.click(); // Trigger the download
            } catch (error) {
                alert("failed")
            }
        });

        if (isSelf === true) {
            // Style for self-sent images
            imageMessageContainer.classList.add("d-flex", "justify-content-end");
            imageDownloadLink.classList.add('btn', 'bg-green-dark', 'shadow-m', 'text-white');
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');
            imageMessageContainer.appendChild(messageTimestamp)
            imageMessageContainer.appendChild(imagePreview); // Append the image preview
            imageMessageContainer.appendChild(imageDownloadLink); // Append download link
            imageMessageContainer.appendChild(userImage)
            MSGContainer.appendChild(imageMessageContainer);
        } else {
            // Style for received images
            imageMessageContainer.classList.add('d-flex', 'recipient-image-message-container');
            imageDownloadLink.classList.add('btn', 'bg-theme', 'shadow-m', 'text-dark');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');
            imageMessageContainer.appendChild(recipientImage);
            imageMessageContainer.appendChild(imageDownloadLink); // Append download link
            imageMessageContainer.appendChild(imagePreview); // Append the image preview
            imageMessageContainer.appendChild(messageTimestamp)
            MSGContainer.appendChild(imageMessageContainer);
        }
    }

    videoOption.addEventListener("click", () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp4, .mkv';
        input.multiple = true; // Allow selection of multiple files

        input.addEventListener('change', async (event) => {
            const files = event.target.files;
            closeMenu()
            if (files && files.length > 0) {
                try {
                    const formData = new FormData();

                    for (const file of files) {
                        formData.append('videoFile', file);
                    }

                    const response = await fetch(`${BASE_URL}/chat/uploadVideo`, {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const data = await response.json();
                        data.uploadedFiles.forEach(videoData => {
                            const videoUrl = videoData.videoUrl; // URL of the uploaded image
                            const filename = videoData.filename; // Name of the uploaded image
                            const time = Date.now()
                            displayVideoMessage(formatMessageTimestamp(time), filename, videoUrl, true);
                            socket.emit('send_video', {
                                socketSender, socketReceiver, content: [videoUrl, filename]
                            });
                            fetch(`${BASE_URL}/chat/addMessage`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [videoUrl, filename] }),
                            });
                        })
                    } else {
                        console.error('Failed to upload image');
                    }
                } catch (error) {
                    console.error('Error handling image files:', error);
                }
            }
        });
        input.click();
    });

    // Receiving the socket
    socket.on('receive_video', (content) => {
        const time = Date.now()
        displayVideoMessage(formatMessageTimestamp(time), content[1], content[0], false);
    });

    async function displayVideoMessage(time, filename, videoUrl, isSelf) {
        const MSGContainer = document.getElementById('MSGContainer');
        const videoMessageContainer = document.createElement('div');
        videoMessageContainer.classList.add('mb-5');

        const videoPreview = document.createElement('video');
        videoPreview.src = videoUrl;
        videoPreview.autoplay = true
        videoPreview.width = '60';
        videoPreview.height = '60';

        const videoDownloadLink = document.createElement('button');
        videoDownloadLink.innerHTML = `<i class="fa-solid fa-circle-arrow-down"></i> <span style="font-style: italic;">${filename}</span>`;
        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;
        videoDownloadLink.addEventListener('click', async (event) => {
            try {
                const response = await fetch(videoUrl);
                const file = await response.blob();
                const link = document.createElement("a")
                link.href = URL.createObjectURL(file);
                link.download = filename
                link.click(); // Trigger the download
            } catch (error) {
                alert("failed")
            }
        });

        if (isSelf === true) {
            // Style for self-sent videos
            videoMessageContainer.classList.add("d-flex", "justify-content-end");
            videoDownloadLink.classList.add('btn', 'bg-green-dark', 'shadow-m', 'text-white');
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');
            videoMessageContainer.appendChild(messageTimestamp)
            videoMessageContainer.appendChild(videoPreview); // Append the video preview
            videoMessageContainer.appendChild(videoDownloadLink); // Append download link
            videoMessageContainer.appendChild(userImage)
            MSGContainer.appendChild(videoMessageContainer);
        } else {
            // Style for received images
            videoMessageContainer.classList.add('d-flex', 'recipient-image-message-container');
            videoDownloadLink.classList.add('btn', 'bg-theme', 'shadow-m', 'text-dark');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipientvideo source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');
            videoMessageContainer.appendChild(recipientImage);
            videoMessageContainer.appendChild(videoDownloadLink); // Append download link
            videoMessageContainer.appendChild(videoPreview); // Append the video preview
            videoMessageContainer.appendChild(messageTimestamp)
            MSGContainer.appendChild(videoMessageContainer);
        }
    }

    let camera = false;
    let currentStream = null;
    let canvas = document.createElement('canvas');
    canvas.id = "myCanvas";
    canvas.style.display = 'none';
    let ctx = canvas.getContext('2d');
    let capturedImage = false;

    const captureButton = document.createElement('button');
    captureButton.innerText = 'Capture';
    captureButton.classList.add("btn", "btn-primary");

    let videoContainer = document.createElement('video');
    videoContainer.autoplay = true;
    videoContainer.style.width = '100%';

    let videoTracks = null;

    cameraOption.addEventListener("click", () => {
        closeMenu();
        const modal = new bootstrap.Modal(document.getElementById('cameraModal'));
        modal.show();
        if (!camera) {
            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
                    currentStream = stream;
                    videoContainer.srcObject = currentStream;
                    camera = true;
                    videoTracks = currentStream.getVideoTracks();
                    console.log(videoTracks);
                    const modalBody = document.getElementById('cameraModalBody');
                    modalBody.innerHTML = '';
                    modalBody.appendChild(videoContainer);
                    modalBody.appendChild(canvas);
                    modalBody.appendChild(captureButton);
                }).catch(function (err) {
                    console.log(err);
                });
            }
        }
    });

    captureButton.addEventListener("click", async () => {
        document.querySelector('.modal-backdrop').remove();
        document.getElementById("cameraModal").classList.remove('show')
        try {
            if (camera) {
                ctx.drawImage(videoContainer, 0, 0, canvas.width, canvas.height);
                capturedImage = true;
                const imageDataURL = canvas.toDataURL();
                const formData = new FormData();
                formData.append('capturedImage', dataURItoBlob(imageDataURL), 'image.png');
                const response = await fetch(`${BASE_URL}/chat/captureUploadImage`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json()
                    const imageUrl = data.imageUrl;
                    const filename = data.filename;
                    canvas.style.display = 'none';
                    const time = Date.now();
                    displayImageMessage(formatMessageTimestamp(time), filename, imageUrl, true);
                    socket.emit('send_image', {
                        socketSender, socketReceiver, content: [imageUrl, filename]
                    });
                    fetch(`${BASE_URL}/chat/addMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [imageUrl, filename] }),
                    });
                } else {
                    console.error('Failed to upload image');
                }
            } else {
                window.alert('Please start the camera');
            }
            videoTracks.forEach(track => track.stop()); // Stop the tracks
            videoTracks = null;
        } catch (error) {
            console.error('Error handling image files:', error);
        }
    });

    // document.getElementById('cameraModal').addEventListener('hidden.bs.modal', () => {
    //     if (videoTracks) {
    //         videoTracks.forEach(track => track.stop()); // Stop the tracks
    //         videoTracks = null;
    //     }
    // });

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }



    // let camera = false;
    // let currentStream = null;
    // let canvas = document.getElementById("myCanvas");
    // let ctx = canvas.getContext('2d');
    // let capturedImage = false

    // const captureButton = document.createElement('button');
    // captureButton.innerText = 'Capture';
    // captureButton.classList.add("btn", "btn-primary");

    // let videoContainer = document.createElement('video');
    // videoContainer.autoplay = true;
    // videoContainer.style.width = '300px';
    // videoContainer.style.height = '300px';

    // cameraOption.addEventListener("click", () => {
    //     closeMenu()
    //     if (!camera) {
    //         if (navigator.mediaDevices.getUserMedia) {
    //             navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
    //                 currentStream = stream;
    //                 videoContainer.srcObject = currentStream;
    //                 videoContainer.style.display = 'block';
    //                 camera = true;
    //                 // Append the video container to the DOM
    //                 const container = document.getElementById('videoContainer');
    //                 container.innerHTML = '';
    //                 container.appendChild(videoContainer);
    //                 container.appendChild(captureButton);
    //             }).catch(function (err) {
    //                 console.log(err);
    //             });
    //         }
    //     } else {
    //         camera = false;
    //         currentStream.getTracks().forEach(track => track.stop());
    //         videoContainer.srcObject = null;
    //         const container = document.getElementById('videoContainer');
    //         container.innerHTML = '';
    //     }
    // });

    // captureButton.addEventListener("click", async () => {
    //     try {
    //         if (camera) {
    //             canvas.style.display = 'block';
    //             ctx.drawImage(videoContainer, 0, 0, canvas.width, canvas.height);
    //             capturedImage = true;
    //             const imageDataURL = canvas.toDataURL();
    //             const formData = new FormData();
    //             formData.append('capturedImage', dataURItoBlob(imageDataURL), 'image.png');
    //             const response = await fetch(`${BASE_URL}/chat/captureUploadImage`, {
    //                 method: 'POST',
    //                 body: formData,
    //             });

    //             if (response.ok) {
    //                 // Handle success
    //                 const data = await response.json()
    //                 const imageUrl = data.imageUrl; // URL of the uploaded image
    //                 const filename = data.filename; // Name of the uploaded image
    //                 canvas.style.display = 'none'
    //                 const time = Date.now()
    //                 displayImageMessage(formatMessageTimestamp(time), filename, imageUrl, true);
    //                 socket.emit('send_image', {
    //                     socketSender, socketReceiver, content: [imageUrl, filename]
    //                 });
    //                 fetch(`${BASE_URL}/chat/addMessage`, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [imageUrl, filename] }),
    //                 });
    //             } else {
    //                 console.error('Failed to upload image');
    //             }
    //         } else {
    //             window.alert('Please start the camera');
    //         }
    //     } catch (error) {
    //         console.error('Error handling image files:', error);
    //     }
    // });

    // // Function to convert Data URI to Blob
    // function dataURItoBlob(dataURI) {
    //     const byteString = atob(dataURI.split(',')[1]);
    //     const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    //     const ab = new ArrayBuffer(byteString.length);
    //     const ia = new Uint8Array(ab);
    //     for (let i = 0; i < byteString.length; i++) {
    //         ia[i] = byteString.charCodeAt(i);
    //     }
    //     return new Blob([ab], { type: mimeString });
    // }

    locationOption.addEventListener("click", () => {
        window.location.href = '/map'
        console.log("Mapping....");
    })

    socket.on('receive_location', (content) => {
        console.log(content);
        const time = Date.now()
        displayLocation(formatMessageTimestamp(time), content[0], content[1], content[2], false)
    })

    function displayLocation(time, lat, lng, accuracy, isSelf) {
        const MSGContainer = document.getElementById('MSGContainer');
        const locationContainer = document.createElement('div');
        locationContainer.classList.add('mb-5');
        const openLocation = document.createElement('button');
        openLocation.type = 'button'
        openLocation.setAttribute('data-bs-toggle', 'modal');
        openLocation.setAttribute('data-bs-target', '#locationModal');
        openLocation.innerHTML = '<i class="fa-solid fa-location-dot"></i> <span style="font-style: italic;">Click to view location</span>';
        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;

        const modal = new bootstrap.Modal(document.getElementById('locationModal'));

        openLocation.addEventListener('click', async (event) => {
            try {
                // Show the modal
                modal.show();

                // Add an event listener to initialize the map when the modal is shown
                modal._element.addEventListener('shown.bs.modal', function () {
                    const modalMap = L.map('mapModal').setView([lat, lng], 13);
                    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        maxZoom: 19,
                        attribution: '© OpenStreetMap'
                    }).addTo(modalMap);

                    const marker = L.marker([lat, lng]).addTo(modalMap);
                    marker.setLatLng([lat, lng]);
                    // Center map on the marker
                    modalMap.panTo([lat, lng]);
                    modalMap.invalidateSize(); // Refreshes map to fit the container properly
                    marker.bindPopup(`<b>Accuracy:</b> ${accuracy} meters`).openPopup();
                });

                modal._element.addEventListener('hidden.bs.modal', function (e) {
                    document.querySelector('.modal-backdrop').remove();
                });

                // modal.hide();
            } catch (error) {
                alert("Failed to display the map");
            }
        });

        if (isSelf === true) {
            openLocation.classList.add('btn', 'bg-green-dark', 'shadow-m', 'text-white');
            locationContainer.classList.add("d-flex", "justify-content-end");
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');
            locationContainer.appendChild(messageTimestamp); // Append user image to the container
            locationContainer.appendChild(openLocation); // Append download link to the container
            locationContainer.appendChild(userImage); // Append user image to the container
            MSGContainer.appendChild(locationContainer);
        } else {
            openLocation.classList.add('btn', 'bg-theme', 'shadow-m', 'text-dark');
            locationContainer.classList.add('d-flex', 'recipient-pdf-message-container');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');
            locationContainer.appendChild(recipientImage);
            locationContainer.appendChild(openLocation); // Append download link to the container
            locationContainer.appendChild(messageTimestamp); // Append user image to the container
            MSGContainer.appendChild(locationContainer);
        }
    }

    const deleteButton = document.getElementById("delete_now")
    deleteButton.addEventListener("click", () => {
        console.log(receiverToken);
        fetch(`${BASE_URL}/chat/destroyChat?userId=${receiverToken}`)
        window.history.go(-1)
    })

    const videoCallButton = document.getElementById('videoCall');
    const audioCallButton = document.getElementById('audioCall');

    // videoCallButton.addEventListener('click', async function (e) {
    //     const response = await socket.emit("initiate_VideoCall", { socketSender, socketReceiver })
    //     if (response.connected === true) {
    //         window.location.href = `/call?video=${socketSender}`; // Redirect to the call page
    //     }
    // });

    // socket.on("receive_videoCall", ({ socketSender, socketReceiver }) => {
    //     console.log("jhdsjfhjkdshkfhkds");
    //     alert(`Incoming call from +${receiverMobileNumber}`)
    //     window.location.href = `/call?video=${socketSender}`
    // });

    videoCallButton.addEventListener("click", async () => {
        const time = Date.now()
        document.getElementById("menu-user").className = "menu menu-box-right"
        const response = await fetch(`${BASE_URL}/chat/addMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: "Video Call" }),
        });
        const data = await response.json()
        console.log(data);
        displayCall(formatMessageTimestamp(time), data.data._id, "Video Call", true);
        socket.emit('send_video_call', { socketSender, socketReceiver, callId: data.data._id, message: "Video Call" });
    })

    socket.on('receive_video_call', ({ senderToken, callId, message }) => {
        const time = Date.now()
        displayCall(formatMessageTimestamp(time), callId, message, false);
    });

    audioCallButton.addEventListener("click", async () => {
        const time = Date.now()
        document.getElementById("menu-user").className = "menu menu-box-right"
        const response = await fetch(`${BASE_URL}/chat/addMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: "Audio Call" }),
        });
        const data = await response.json()
        console.log(data);
        displayCall(formatMessageTimestamp(time), data.data._id, "Audio Call", true);
        socket.emit('send_audio_call', { socketSender, socketReceiver, callId: data.data._id, message: "Audio Call" });
    })

    socket.on('receive_audio_call', ({ senderToken, callId, message }) => {
        const time = Date.now()
        displayCall(formatMessageTimestamp(time), callId, message, false);
    });

    function displayCall(time, callId, message, isSelf) {
        const MSGContainer = document.getElementById('MSGContainer');
        const callContainer = document.createElement('div');
        callContainer.classList.add('mb-5');
        const openCall = document.createElement('button');
        openCall.type = 'button'
        if (message === "Video Call") {
            openCall.innerHTML = `<i class="fa-solid fa-video"></i> <span style="font-style: italic;">${message}</span>`;
            openCall.addEventListener('click', async () => {
                const response = await fetch(`${BASE_URL}/chat/updateEnteredUsers?callId=${callId}&user=${senderToken}&type=video`)
                if (response?.status === 200) {
                    window.location.href = `/call?video=${callId}`;
                }
            });
        } else {
            openCall.innerHTML = `<i class="fa-solid fa-phone"></i> <span style="font-style: italic;">${message}</span>`;
            openCall.addEventListener('click', async () => {
                const response = await fetch(`${BASE_URL}/chat/updateEnteredUsers?callId=${callId}&user=${senderToken}&type=audio`)
                if (response?.status === 200) {
                    window.location.href = `/call?audio=${callId}`;
                }
            });
        }

        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('font-9', 'ps-2', 'd-block', 'mt-n1', 'opacity-50');
        messageTimestamp.innerText = time;

        if (isSelf === true) {
            openCall.classList.add('btn', 'bg-green-dark', 'shadow-m', 'text-white');
            callContainer.classList.add("d-flex", "justify-content-end");
            const userImage = document.createElement('img');
            userImage.src = 'images/user.png'; // Replace with the actual user image source
            userImage.width = '45';
            userImage.height = '45';
            userImage.alt = 'img';
            userImage.classList.add('rounded-xl', 'ms-3', 'mb-2');
            callContainer.appendChild(messageTimestamp); // Append user image to the container
            callContainer.appendChild(openCall); // Append download link to the container
            callContainer.appendChild(userImage); // Append user image to the container
            MSGContainer.appendChild(callContainer);
        } else {
            openCall.classList.add('btn', 'bg-theme', 'shadow-m', 'text-dark');
            callContainer.classList.add('d-flex', 'recipient-pdf-message-container');
            const recipientImage = document.createElement('img');
            recipientImage.src = 'images/lock.png'; // Replace with the actual recipient image source
            recipientImage.width = '45';
            recipientImage.height = '45';
            recipientImage.alt = 'img';
            recipientImage.classList.add('rounded-xl', 'me-3', 'mb-2');
            callContainer.appendChild(recipientImage);
            callContainer.appendChild(openCall); // Append download link to the container
            callContainer.appendChild(messageTimestamp); // Append user image to the container
            MSGContainer.appendChild(callContainer);
        }
    }



    // const audioCallButton = document.getElementById('audioCall');

    // audioCallButton.addEventListener('click', async function (e) {
    //     const response = await socket.emit("initiate_AudioCall", { socketSender, socketReceiver });
    //     if (response.connected === true) {
    //         window.location.href = `/call?audio=${socketSender}`; // Redirect to the audio call page
    //     }
    // });

    // socket.on("receive_audioCall", ({ socketSender, socketReceiver }) => {
    //     alert(`${socketReceiver} is trying to connect via AudioCall..!`);
    //     window.location.href = `/call?audio=${socketSender}`
    // });
})