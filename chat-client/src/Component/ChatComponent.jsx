import { useState } from "react";
import SockJS from "sockjs-client";
import {over} from 'stompjs';

var client =null;
function ChatComponent(){
    
    const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const connectToWebSocket = () => {
    const enteredUsername = inputValue.trim();

    if (enteredUsername) {
      setInputValue(enteredUsername);
      setConnected(true);

      const socket = new SockJS('http://localhost:8080/ws');
      client = over(socket);
      client.connect({}, onConnected, onError);
    }
  };

  const onConnected = () => {
    // subcribe to the topics
    client.subscribe('/topic/public', onMessageRecived);

    // tell username to server
    client.send('/app/chat.addUser', {}, JSON.stringify({sender:inputValue , type : 'JOIN'}));

  }

  const onMessageRecived = (payload) => {
    const data = JSON.parse(payload.body);
    console.log(message)
    setMessages((prevMessages) => [...prevMessages, data]);
  }

  const onError = () =>{
    console.log('error connceting the webScoket');
  }

  const handleSendMessage = () => {
    const messageContent = message.trim();
    if (messageContent && client) {
      const chatMessage = {
        sender: inputValue,
        message: messageContent,
        type: 'CHAT',
      };
      client.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
      setMessage('');
    }
  };

  return (
    <div>
      {!connected && ( // Conditionally render the input field and connect button if not connected
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter connection URL"
          />
          <button onClick={connectToWebSocket}>Connect</button>
        </div>
      )}

{connected && (
        <div>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
                {messages.map((msg, index) => (
                    <li key={index}>
                        {msg.type === 'JOIN' && <span>{msg.sender} joined!</span>}
                        {msg.type === 'LEAVE' && <span>{msg.sender} left!</span>}
                        {msg.type === 'CHAT' && <span>{msg.sender}: {msg.message}</span>}
                    </li>
                 ))}
            </ul>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      )}
    </div>
  );

}

export default ChatComponent;