const socket = io();

socket.on('message', (message) => {
    console.log(message);
});

//Elements
const messageForm = document.querySelector('#msgform');
const messageInput = messageForm.querySelector('input');
const sendButton = messageForm.querySelector('button');
const locationButton = document.querySelector('#send-location');
const messages = document.querySelector('#messages');
const status = document.querySelector('#status');


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const linkTemplate = document.querySelector('#link-template').innerHTML;

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        message
    });
    messages.insertAdjacentHTML('beforeend', html);
})

socket.on('locationMessage', (url) => {
    console.log(url);
    const linkHTML = Mustache.render(linkTemplate, {
        url
    });
    messages.insertAdjacentHTML('beforeend', linkHTML);
})

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


locationButton.addEventListener('click', (e) => {
    e.preventDefault();
    status.textContent = 'loading...';
    locationButton.setAttribute('disabled', 'disabled');

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
