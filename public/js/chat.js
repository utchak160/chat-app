const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

messageForm = document.querySelector('#msgform');
// message = document.querySelector('input');
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Message sent');
    const message = e.target.elements.message.value;
    socket.emit('messageSent', message);
});

document.querySelector('#send-location').addEventListener('click', (e) => {
    e.preventDefault();
    const status = document.querySelector('#status');
    const mapLink = document.querySelector('#map-link');
    status.textContent = 'loading...';

    mapLink.href = '';
    mapLink.textContent = '';
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
      socket.emit('location', {latitude, longitude});
      status.textContent = '';
    })
})
