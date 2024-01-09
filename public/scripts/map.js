document.addEventListener('DOMContentLoaded', function () {
    // const BASE_URL = "https://chat-service-fhbc.onrender.com";
    const BASE_URL = "http://localhost:3000";

    const socket = io();

    const socketSender = localStorage.getItem("socketSender")
    const socketReceiver = localStorage.getItem("socketReceiver")
    const senderToken = localStorage.getItem("senderToken")
    const receiverToken = localStorage.getItem("receiverToken")

    const map = L.map('map');
    // Initializes map

    map.setView([51.505, -0.09], 13);
    // Sets initial coordinates and zoom level

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);
    // Sets map data source and associates with map

    let marker, circle, zoomed, lat, lng, accuracy;

    navigator.geolocation.getCurrentPosition(success, error, {
        enableHighAccuracy: true, // Optional: request high accuracy
        timeout: 5000,            // Optional: set a timeout
        prompt: "Would you like to allow this app to access your location?"
    });


    function success(pos) {

        console.log(pos);
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        accuracy = pos.coords.accuracy;

        if (marker) {
            map.removeLayer(marker);
            map.removeLayer(circle);
        }
        // Removes any existing marker and circule (new ones about to be set)

        marker = L.marker([lat, lng]).addTo(map);
        circle = L.circle([lat, lng], { radius: accuracy }).addTo(map);
        // Adds marker to the map and a circle for accuracy

        if (!zoomed) {
            zoomed = map.fitBounds(circle.getBounds());
        }
        // Set zoom to boundaries of accuracy circle

        map.setView([lat, lng]);
        // Set map focus to current user position

        console.log("Your coordinate is: Lat: " + lat + " Long: " + lng + " Accuracy: " + accuracy)
        // console.log(`https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`);
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
})