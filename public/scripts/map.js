document.addEventListener('DOMContentLoaded', function () {
    const BASE_URL = "https://chat-service-fhbc.onrender.com";
    // const BASE_URL = "http://localhost:3000";
    const socket = io();

    const socketSender = localStorage.getItem("socketSender")
    const socketReceiver = localStorage.getItem("socketReceiver")
    const senderToken = localStorage.getItem("senderToken")
    const receiverToken = localStorage.getItem("receiverToken")

    const map = L.map('map');
    map.setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    let marker, circle, zoomed, lat, lng, accuracy;

    function success(pos) {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;

        if (marker) {
            map.removeLayer(marker);
            map.removeLayer(circle);
        }

        marker = L.marker([lat, lng]).addTo(map);
        circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);

        if (!zoomed) {
            zoomed = map.fitBounds(circle.getBounds());
        }

        map.setView([lat, lng]);

        console.log("Your coordinate is: Lat: " + lat + " Long: " + lng + " Accuracy: " + accuracy);
    }

    function error(err) {
        if (err.code === 1) {
            alert("Please allow geolocation access");
        } else {
            alert("Cannot get current location");
        }
    }

    const sendLocation = document.getElementById("send_location")
    sendLocation.addEventListener("click", () => {
        console.log(lat, lng, accuracy);
        socket.emit('send_location', { socketSender, socketReceiver, content: [lat, lng, accuracy] })
        fetch(`${BASE_URL}/chat/addMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender: senderToken, receiver: receiverToken, message: [lat, lng, accuracy] }),
        });
        window.history.go(-1)
    })

    // Request location access when the page loads
    navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
        if (result.state === 'granted') {
            navigator.geolocation.getCurrentPosition(success, error);
        } else if (result.state === 'prompt') {
            navigator.geolocation.getCurrentPosition(success, error);
        } else if (result.state === 'denied') {
            error({ code: 1 });
        }
    });
});
