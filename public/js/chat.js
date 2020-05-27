const socket = io();

socket.on('message', (message, username) => {
    console.log(message, username);
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
const sideTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true});

const autoScroll = () => {
    //New message element
    const $newMessage = messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = messages.offsetHeight

    //Height of message container
    const containerHeight = messages.scrollHeight

    //How far I have scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        UserName: message.name,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage', (url) => {
    const linkHTML = Mustache.render(linkTemplate, {
        url: url.url,
        UserName: url.name,
        createdAt: moment(url.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend', linkHTML);
    autoScroll()
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});
