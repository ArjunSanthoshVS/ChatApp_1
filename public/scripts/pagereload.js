const BASE_URL = "http://localhost:3000"
const token = localStorage.getItem("socketSender")
let previousRoute;

console.log(token);


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



window.addEventListener('load', () => {
    previousRoute = window.location.href;
});

window.addEventListener('popstate', () => {
    previousRoute = window.location.href;
});

window.addEventListener('beforeunload', function (event) {
    const currentUrl = window.location.href;
    const excludedRoutes = [
        'http://localhost:3000/call',
        'http://localhost:3000/map',
        'http://localhost:3000/chat'
    ];

    console.log(currentUrl);
    console.log(!excludedRoutes.some(route => currentUrl.startsWith(route)));
    console.log(performance.navigation.type);
    console.log(previousRoute);

    if (!excludedRoutes.some(route => currentUrl.startsWith(route)) &&
        performance.navigation.type === 2 &&
        (!previousRoute || !excludedRoutes.some(route => previousRoute.startsWith(route)))) {
        console.log("gewr rtwedqfcv");
        sendDataUsingFetch(token);
    }
});
