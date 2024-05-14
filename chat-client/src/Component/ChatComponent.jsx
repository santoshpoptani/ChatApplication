import { useState } from "react";
import SockJS from "sockjs-client";
import {over} from 'stompjs';
import Sidebar from "./Sidebar";

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
    console.log('inside the onConnected Method')
    // tell username to server
    client.send('/app/chat.addUser', {}, JSON.stringify({sender:inputValue , type : 'JOIN'}));

  }

  const onMessageRecived = (payload) => {
    const data = JSON.parse(payload.body);
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
     {!connected && (
    <div className="justify-center h-screen flex flex-col items-center">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter connection URL"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-64"
      />
      <button onClick={connectToWebSocket} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Connect
      </button>
    </div>
  )}
  
  {connected && (
    <div className="flex items-center justify-center h-screen"> 
      <div className="flex items-center">
        {/* Sidebar */}
        <Sidebar />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-full border border-gray-300 rounded-md p-4 mb-4 h-96 overflow-auto">
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="mb-2 flex items-center">
                {(msg.type === 'JOIN' || msg.type === 'LEAVE') && (
                  <div className="text-sm text-gray-700 mr-3">
                    {msg.type === 'JOIN' ? `User ${msg.sender} joined the chat` : `User ${msg.sender} left the chat`}
                  </div>
                )}
                {msg.type === 'CHAT' && (
                  <>
                    <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">{msg.sender.substring(0, 1)}</span>
                    </div>
                    <div>
                      <span className="font-bold">{msg.sender}</span>: {msg.message}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
            className="border border-gray-300 rounded-md px-4 py-2 w-48 mr-2"
          />
          <button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Send Message
          </button>
        </div>
      </div>
    </div>
   
  )}
  </div>
  

  );

}

export default ChatComponent;