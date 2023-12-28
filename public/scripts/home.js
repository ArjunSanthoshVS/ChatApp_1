
document.addEventListener('DOMContentLoaded', function () {
  const BASE_URL = "http://localhost:3000";
  // const BASE_URL = "https://chat-service-fhbc.onrender.com";

  // const socket = io();


  localStorage.clear()
  // localStorage.setItem("socketReceiver", "656eaad81a36eeacd8cb6898")

  //   socket.emit('join_room', { token: "656eaad81a36eeacd8cb6898", room: "No room" });
  //   socket.on("admin_receive_videoCall", ({ socketSender, socketReceiver }) => {
  //     console.log("jhdsjfhjkdshkfhkds");
  //     alert(`Incoming call from +`)
  //     window.location.href = `/call?video=${socketReceiver}`
  // });

  const startChatBtn = document.getElementById('startChatBtn');
  startChatBtn.addEventListener('click', function () {
    const whatsappNumber = document.getElementById('form1').value;
    const message = document.getElementById('form7').value;

    fetch(`${BASE_URL}/sendLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ whatsappNumber, message }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error sending link:', error);
      });
  });

  fetch(`${BASE_URL}/activeChats`)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('tab-8');
      data.forEach(user => {
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.className = 'd-flex pb-3';
        anchor.addEventListener('click', function (event) {
          event.preventDefault();
          const roomId = user.roomId;
          window.location.href = `/chat?roomId=${roomId}`;
        });

        const div1 = document.createElement('div');
        div1.className = 'align-self-center';

        const userImage = document.createElement('img');
        userImage.src = "images/user.png"; // Set the image URL
        userImage.width = '45';
        userImage.className = 'rounded-xl me-3';
        userImage.alt = 'User Image';

        const div2 = document.createElement('div');
        div2.className = 'align-self-center';

        const div3 = document.createElement('div');
        div3.className = 'position-absolute end-0 pe-3';

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'font-9 opacity-40 color-theme';
        timestampSpan.innerText = user.lastMessageTime;

        const unreadCount = user.unreadMessagesCount || 0; // Use unread message count from the fetched data
        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'float-end mt-n1 pt-1 badge rounded-pill bg-blue-dark font-9 font-400 scale-switch';
        badgeSpan.innerText = unreadCount > 0 ? unreadCount.toString() : '';

        div3.appendChild(timestampSpan);
        div3.appendChild(document.createElement('br'));
        div3.appendChild(badgeSpan);

        const userName = `+${user.user.number}`;
        const userLastMessage = user.lastMessage;

        const userNameElement = document.createElement('p');
        userNameElement.className = 'font-14 font-600 color-theme mb-0 line-height-s';
        userNameElement.innerText = userName;

        const userMessageElement = document.createElement('p');
        userMessageElement.className = 'font-11 mb-0 line-height-s';
        userMessageElement.innerText = userLastMessage || '';

        div1.appendChild(userImage);
        div2.appendChild(userNameElement);
        div2.appendChild(userMessageElement);

        anchor.appendChild(div1);
        anchor.appendChild(div2);
        anchor.appendChild(div3);

        container.appendChild(anchor);
      });
    });

  fetch(`${BASE_URL}/archivedChats`)
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('tab-9');

      data.forEach(user => {
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.className = 'd-flex pb-3';

        anchor.addEventListener('click', function (event) {
          event.preventDefault();
          const roomId = user.roomId;
          window.location.href = `/chat?roomId=${roomId}`;
        });

        const div1 = document.createElement('div');
        div1.className = 'align-self-center';

        const userImage = document.createElement('img');
        userImage.src = "images/user.png"; // Set the image URL
        userImage.width = '45';
        userImage.className = 'rounded-xl me-3';
        userImage.alt = 'User Image';

        const div2 = document.createElement('div');
        div2.className = 'align-self-center';

        const div3 = document.createElement('div');
        div3.className = 'position-absolute end-0 pe-3';

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'font-9 opacity-40 color-theme';
        timestampSpan.innerText = user.lastMessageTime;

        const badgeSpan = document.createElement('span');
        badgeSpan.className = 'float-end mt-n1 pt-1 badge rounded-pill bg-blue-dark font-9 font-400 scale-switch';
        badgeSpan.innerText = '5';

        div3.appendChild(timestampSpan);
        div3.appendChild(document.createElement('br'));
        div3.appendChild(badgeSpan);

        const userName = `+${user.user.number}`;
        const userLastMessage = user.lastMessage;

        const userNameElement = document.createElement('p');
        userNameElement.className = 'font-14 font-600 color-theme mb-0 line-height-s';
        userNameElement.innerText = userName;

        const userMessageElement = document.createElement('p');
        userMessageElement.className = 'font-11 mb-0 line-height-s';
        userMessageElement.innerText = userLastMessage || '';

        div1.appendChild(userImage);
        div2.appendChild(userNameElement);
        div2.appendChild(userMessageElement);

        anchor.appendChild(div1);
        anchor.appendChild(div2);
        anchor.appendChild(div3);

        container.appendChild(anchor);
      });
    });
})
