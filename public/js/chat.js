const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

const messageForm = document.querySelector('#msgform');
const messageInput = messageForm.querySelector('input');
const sendButton = messageForm.querySelector('button');

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendButton.setAttribute('disabled', 'disabled');
    console.log('Message sent');
    messageInput.focus();
    const message = e.target.elements.message.value;
    socket.emit('messageSent', message, (error) => {
        sendButton.removeAttribute('disabled');
        if (error) {
            return console.log(error);
        }
        console.log('Message delivered');
        messageInput.value = '';
    });
});

const locationButton = document.querySelector('#send-location');

locationButton.addEventListener('click', (e) => {
    e.preventDefault();
    const status = document.querySelector('#status');
    const mapLink = document.querySelector('#map-link');
    status.textContent = 'loading...';
    locationButton.setAttribute('disabled', 'disabled');

    mapLink.href = '';
    mapLink.textContent = '';
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
      socket.emit('location', {latitude, longitude}, () => {
          console.log('Location Shared');
          locationButton.removeAttribute('disabled');
      });
      status.textContent = '';
    })
});
