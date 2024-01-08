// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://chat-service-fhbc.onrender.com";

const token = localStorage.getItem("socketSender");
console.log(performance.navigation.type);

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
    if (performance.navigation.type === 2) {
        sendDataUsingFetch(token);
    }
});
