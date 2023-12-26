document.addEventListener('DOMContentLoaded', async function () {
    const BASE_URL = process.env.BASE_URL;

    let peer = new Peer();
    let myStream;
    let peerList = [];

    const socketSender = localStorage.getItem("socketSender");
    const socketReceiver = localStorage.getItem("socketReceiver");
    const senderToken = localStorage.getItem("senderToken");

    const urlParams = new URLSearchParams(window.location.search);
    const isAudioCall = urlParams.has('audio');
    const isVideoCall = urlParams.has('video');
    let callId;

    if (isAudioCall) {
        callId =urlParams.get('audio')
        await audioInit(socketSender)
    } else {
        callId =urlParams.get('video')
        await init(socketSender);
    }

    async function init(userId) {
        peer = new Peer(userId);
        peer.on('open', (id) => {
            console.log(id + " connected");
            // if (socketReceiver) {
            //     makeCall(socketReceiver);
            // }
        });
        listenToCall();
    }

    function listenToCall() {
        peer.on('call', (call) => {
                answerCall(call);
        });
    }

    async function answerCall(call) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                handleStream(stream, call);
            }).catch((err) => {
                console.log("unable to connect because " + err);
            });
    }

    function handleStream(stream, call) {
        myStream = stream;
        addLocalVideo(stream);
        call.answer(stream);
        call.on('stream', (remoteStream) => {
            handleRemoteStream(remoteStream, call);
        });

        // notifyReceiver(socketReceiver);
        toggleVideo(true);
        document.getElementById("continue_button").style.display = 'none';
    }

    function handleRemoteStream(remoteStream, call) {
        if (!peerList.includes(call.peer)) {
            addRemoteVideo(remoteStream);
            peerList.push(call.peer);
            document.getElementById("continue_button").style.display = 'none';
        }
    }

    function makeCall(receiverId) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                myStream = stream;
                addLocalVideo(stream);
                let call = peer.call(receiverId, stream);
                call.on('stream', (remoteStream) => {
                    handleRemoteStream(remoteStream, call);
                });
            }).catch((err) => {
                console.log("unable to connect because " + err);
            });
    }

    function addLocalVideo(stream) {
        let video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.play();
        document.getElementById("localVideo").appendChild(video);
    }

    function addRemoteVideo(stream) {
        let video = document.createElement("video");
        video.srcObject = stream;
        video.classList.add("video");
        video.play();
        document.getElementById("remoteVideo").appendChild(video);
    }

    function toggleVideo(b) {
        if (b) {
            myStream.getVideoTracks()[0].enabled = true;
            peerList.forEach(peerId => {
                const remoteVideo = document.getElementById(peerId);
                if (remoteVideo) {
                    remoteVideo.play();
                }
            });
        } else {
            myStream.getVideoTracks()[0].enabled = false;
            peerList.forEach(peerId => {
                const remoteVideo = document.getElementById(peerId);
                if (remoteVideo) {
                    remoteVideo.pause();
                }
            });
        }
    }


    // if (isVideoCall) {
    //     answerVideoCall();
    // }

    function notifyReceiver(receiverId) {
        alert("Incoming call from " + receiverId);
    }

    // Add the continue call button if the user is the sender
    if (socketSender && isVideoCall) {
        const response = await fetch(`${BASE_URL}/chat/secondUser?type=video&callId=${callId}`)
        const secondUser = await response.json()
        const body = document.getElementById("remoteVideo");
        const continueCallButton = document.createElement('button');
        continueCallButton.id = "continue_button";
        continueCallButton.innerText = 'Join Call';
        continueCallButton.classList.add("btn", "btn-primary");
        continueCallButton.addEventListener('click', () => {
            if (socketReceiver) {
                makeCall(socketReceiver);
            }
        });
        if(secondUser?.secondUser === senderToken){
            body.appendChild(continueCallButton);
        }
    }


    async function audioInit(userId) {
        peer = new Peer(userId);
        peer.on('open', (id) => {
            console.log(id + " connected");
        });
        listenToAudioCall();

    }

    function listenToAudioCall() {
        peer.on("call", (call) => {
                answerAudioCall(call);
        });
    }

    function answerAudioCall(call) {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then((stream) => {
                handleAudioStream(stream, call);
            })
            .catch((err) => {
                console.error("Unable to connect:", err);
            });
    }

    function handleAudioStream(stream, call) {
        myStream = stream;
        addLocalAudio(stream);
        call.answer(stream);
        call.on('stream', (remoteStream) => {
            handleRemoteAudioStream(remoteStream, call);
        });

        // notifyAudioReceiver(socketReceiver);
        document.getElementById("continue_audio_button").style.display = 'none';
    }
    
    function handleRemoteAudioStream(remoteStream, call) {
        if (!peerList.includes(call.peer)) {
            addRemoteAudio(remoteStream);
            peerList.push(call.peer);
            document.getElementById("continue_audio_button").style.display = 'none';
        }
    }

    function makeAudioCall(receiverId) {
        navigator.mediaDevices.getUserMedia({ video: false, audio: true })
            .then((stream) => {
                myStream = stream;
                addLocalAudio(stream);
                let call = peer.call(receiverId, stream);
                call.on("stream", (remoteStream) => {
                    handleRemoteAudioStream(remoteStream, call);
                });
            })
            .catch((err) => {
                console.error("Unable to connect:", err);
            });
    }

    function addLocalAudio(stream) {
        let audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.classList.add("audio");
        audio.play();
        document.getElementById("localVideo").appendChild(audio);
    }

    function addRemoteAudio(stream) {
        let audio = document.createElement("audio");
        audio.srcObject = stream;
        audio.classList.add("audio");
        audio.play();
        document.getElementById("remoteVideo").appendChild(audio);
    }

    function toggleAudio(b) {
        if (b) {
            console.log(b);
            console.log( myStream.getAudioTracks()[0]);
            myStream.getAudioTracks()[0].enabled = true
        } else {
            console.log(b);
            console.log( myStream.getAudioTracks()[0]);
            myStream.getAudioTracks()[0].enabled = false
        }
    }

    function notifyAudioReceiver(receiverId) {
        alert("Incoming audio call from " + receiverId);
    }

    if (socketSender && isAudioCall) {
        const response = await fetch(`${BASE_URL}/chat/secondUser?type=audio&callId=${callId}`)
        const secondUser = await response.json()
        const body = document.getElementById("remoteVideo");
        const continueCallButton = document.createElement('button');
        continueCallButton.id = "continue_audio_button";
        continueCallButton.innerText = 'Join Audio Call';
        continueCallButton.classList.add("btn", "btn-primary");
        continueCallButton.addEventListener('click', () => {
            if (socketReceiver) {
                makeAudioCall(socketReceiver);
            }
        });
        if(secondUser?.secondUser === senderToken){
            body.appendChild(continueCallButton);
        }
    }

    // Expose functions to the global scope
    window.init = init;
    window.makeCall = makeCall;
    window.toggleVideo = toggleVideo;
    window.toggleAudio = toggleAudio;

    // Expose audio call functions to the global scope
    window.audioInit = audioInit;
    window.makeAudioCall = makeAudioCall;
    window.toggleAudio = toggleAudio;
});







// document.addEventListener('DOMContentLoaded', async function () {
//     let peer = new Peer();
//     let myStream;
//     let peerList = [];

//     const socketSender = localStorage.getItem("socketSender");
//     const socketReceiver = localStorage.getItem("socketReceiver");

//     const urlParams = new URLSearchParams(window.location.search);
//     const isAudioCall = urlParams.has('audio');
//     const isVideoCall = urlParams.has('video');

//     if (isAudioCall) {
//         await audioInit(socketSender)
//     } else {
//         await init(socketSender);
//     }

//     async function init(userId) {
//         peer = new Peer(userId);
//         peer.on('open', (id) => {
//             console.log(id + " connected");
//         });
//         listenToCall();
//     }

//     function listenToCall() {
//         peer.on('call', (call) => {
//             if (isAudioCall) {
//                 answerAudioCall(call);
//             } else {
//                 answerCall(call);
//             }
//         });
//     }

//     function answerCall(call) {
//         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//             .then((stream) => {
//                 handleStream(stream, call);
//             }).catch((err) => {
//                 console.log("unable to connect because " + err);
//             });
//     }

//     function handleStream(stream, call) {
//         myStream = stream;
//         addLocalVideo(stream);
//         call.answer(stream);
//         call.on('stream', (remoteStream) => {
//             handleRemoteStream(remoteStream, call);
//         });

//         notifyReceiver(socketReceiver);
//         toggleVideo(true);

//         document.getElementById("continue_button").style.display = 'none';
//     }

//     function handleRemoteStream(remoteStream, call) {
//         if (!peerList.includes(call.peer)) {
//             addRemoteVideo(remoteStream);
//             peerList.push(call.peer);
//             document.getElementById("continue_button").style.display = 'none';
//         }
//     }

//     function makeCall(receiverId) {
//         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//             .then((stream) => {
//                 myStream = stream;
//                 addLocalVideo(stream);
//                 let call = peer.call(receiverId, stream);
//                 call.on('stream', (remoteStream) => {
//                     handleRemoteStream(remoteStream, call);
//                 });
//             }).catch((err) => {
//                 console.log("unable to connect because " + err);
//             });
//     }

//     function addLocalVideo(stream) {
//         let video = document.createElement("video");
//         video.srcObject = stream;
//         video.classList.add("video");
//         video.play();
//         document.getElementById("localVideo").appendChild(video);
//     }

//     function addRemoteVideo(stream) {
//         let video = document.createElement("video");
//         video.srcObject = stream;
//         video.classList.add("video");
//         video.play();
//         document.getElementById("remoteVideo").appendChild(video);
//     }

//     function toggleVideo(b) {
//         if (b) {
//             myStream.getVideoTracks()[0].enabled = true;
//             peerList.forEach(peerId => {
//                 const remoteVideo = document.getElementById(peerId);
//                 if (remoteVideo) {
//                     remoteVideo.play();
//                 }
//             });
//         } else {
//             myStream.getVideoTracks()[0].enabled = false;
//             peerList.forEach(peerId => {
//                 const remoteVideo = document.getElementById(peerId);
//                 if (remoteVideo) {
//                     remoteVideo.pause();
//                 }
//             });
//         }
//     }

//     function notifyReceiver(receiverId) {
//         alert("Incoming call from " + receiverId);
//     }

//     // Add the continue call button if the user is the sender
//     if (socketSender && isVideoCall) {
//         const body = document.getElementById("remoteVideo");
//         const continueCallButton = document.createElement('button');
//         continueCallButton.id = "continue_button";
//         continueCallButton.innerText = 'Continue Call';
//         continueCallButton.classList.add("btn", "btn-primary");
//         continueCallButton.addEventListener('click', () => {
//             if (socketReceiver) {
//                 makeCall(socketReceiver);
//             }
//         });
//         body.appendChild(continueCallButton);
//     }

//     async function audioInit(userId) {
//         peer = new Peer(userId);
//         peer.on('open', (id) => {
//             console.log(id + " connected");
//         });
//         listenToAudioCall();

//     }

//     function listenToAudioCall() {
//         peer.on("call", (call) => {
//             // Check data channel message type
//             if (isAudioCall) {
//                 answerAudioCall(call);
//             }
//         });
//     }

//     function answerAudioCall(call) {
//         navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//             .then((stream) => {
//                 handleAudioStream(stream, call);
//             })
//             .catch((err) => {
//                 console.error("Unable to connect:", err);
//             });
//     }

//     function handleAudioStream(stream, call) {
//         myStream = stream;
//         addLocalAudio(stream);
//         call.answer(stream);
//         call.on('stream', (remoteStream) => {
//             handleRemoteAudioStream(remoteStream, call);
//         });

//         notifyAudioReceiver(socketReceiver);
//         document.getElementById("continue_audio_button").style.display = 'none';
//     }
    
//     function handleRemoteAudioStream(remoteStream, call) {
//         if (!peerList.includes(call.peer)) {
//             addRemoteAudio(remoteStream);
//             peerList.push(call.peer);
//             document.getElementById("continue_audio_button").style.display = 'none';
//         }
//     }

//     function makeAudioCall(receiverId) {
//         navigator.mediaDevices.getUserMedia({ video: false, audio: true })
//             .then((stream) => {
//                 myStream = stream;
//                 addLocalAudio(stream);

//                 // Send data channel notification to receiver
//                 // notifyReceiver(receiverId, "audioCall");

//                 // Create and answer call with audio stream
//                 let call = peer.call(receiverId, stream);
//                 call.on("stream", (remoteStream) => {
//                     handleRemoteAudioStream(remoteStream, call);
//                 });
//             })
//             .catch((err) => {
//                 console.error("Unable to connect:", err);
//             });
//     }

//     function addLocalAudio(stream) {
//         let audio = document.createElement("audio");
//         audio.srcObject = stream;
//         audio.classList.add("audio");
//         audio.play();
//         document.getElementById("localVideo").appendChild(audio);
//     }

//     function addRemoteAudio(stream) {
//         let audio = document.createElement("audio");
//         audio.srcObject = stream;
//         audio.classList.add("audio");
//         audio.play();
//         document.getElementById("remoteVideo").appendChild(audio);
//     }

//     function toggleAudio(b) {
//         if (b) {
//             myStream.getAudioTracks()[0].enabled = true
//         } else {
//             myStream.getAudioTracks()[0].enabled = false
//         }
//     }

//     function notifyAudioReceiver(receiverId) {
//         alert("Incoming audio call from " + receiverId);
//     }

//     if (socketSender && isAudioCall) {
//         const body = document.getElementById("remoteVideo");
//         const continueCallButton = document.createElement('button');
//         continueCallButton.id = "continue_audio_button";
//         continueCallButton.innerText = 'Continue Audio Call';
//         continueCallButton.classList.add("btn", "btn-primary");
//         continueCallButton.addEventListener('click', () => {
//             if (socketReceiver) {
//                 makeAudioCall(socketReceiver);
//             }
//         });
//         body.appendChild(continueCallButton);
//     }

//     // Expose functions to the global scope
//     window.init = init;
//     window.makeCall = makeCall;
//     window.toggleVideo = toggleVideo;
//     window.toggleAudio = toggleAudio;

//     // Expose audio call functions to the global scope
//     window.audioInit = audioInit;
//     window.makeAudioCall = makeAudioCall;
//     window.toggleAudio = toggleAudio;
// });
