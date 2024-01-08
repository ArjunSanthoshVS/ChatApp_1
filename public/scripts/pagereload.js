// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://chat-service-fhbc.onrender.com";

const token = localStorage.getItem("socketSender");

function sendDataUsingFetch(userId) {
    const data = JSON.stringify({ userId });
    fetch(`${BASE_URL}/userLeave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data
    })
        .then(response => {
            console.log('Data sent successfully (fetch)');
        })
        .catch(error => {
            console.error('Error sending data (fetch):', error);
        });
}

window.addEventListener('beforeunload', function (event) {
    console.log(performance.navigation.type);
    if (performance.navigation.type === 2) { // Check for back-navigation
        sendDataUsingFetch(token);
    }
});
