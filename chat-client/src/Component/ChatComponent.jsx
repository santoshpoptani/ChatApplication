import { useState , useEffect} from "react";
import SockJS from "sockjs-client";
import {over} from 'stompjs';
import axios from "axios";
import Sidebar from "./Sidebar";

var client =null;
function ChatComponent(){
    
    const [inputValue, setInputValue] = useState('');
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connectedUser , setConnectedUser] = useState([]);
  const [selectedUser , setSelectedUser] = useState(null);
  const [privateMessaage , setPrivateMessage] = useState();
  const [getprivateChats, setPrivateChats] = useState([]);
 


  useEffect(() => {
    //second approach is to send the fetch methon in side bar and trigger from there
   if (selectedUser) {
    fetchPrivateMessagefromDB(selectedUser);
    }
  }, [selectedUser])

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

    client.subscribe(`/user/${inputValue}/queue/messages`, onPrivateMessageRecived);
    client.subscribe(`/user/private`, onPrivateMessageRecived);

    console.log('inside the onConnected Method')
    
    // tell username to server
    client.send('/app/chat.addUser', {}, JSON.stringify({sender:inputValue , type : 'JOIN'}));

    //register new User
    client.send(`/app/chat.addUser/${inputValue}/private`,
    {},
    JSON.stringify({name:inputValue , status : 'ONLINE'})
    );

    findUserandDisplay().then()

  }

  async function findUserandDisplay(){
    await axios.get(`http://localhost:8080/users`)
    .then(
      (res)=>{
        let connecteduser=res.data.filter(user => user.name !== inputValue);
        setConnectedUser(connecteduser);
      }
    )
  }

  
    


   const onPrivateMessageRecived = (payload) => {
    const data = JSON.parse(payload.body);
    console.log("Data ->>>>>>>>>>>>>>"+data);

    setPrivateChats((prevMessages) => [...prevMessages, data]);

  }

  const onMessageRecived = (payload) => {
    const data = JSON.parse(payload.body);
    setMessages((prevMessages) => [...prevMessages, data]);
    if (data.type === 'JOIN') {
      findUserandDisplay(); // Update the connected users list when a new user joins
    }
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

  const handlePrivateMessage  = () => {
    if(privateMessaage && client){
      const privateChatMessage  = {
          senderId :inputValue,
          reciverId : selectedUser,
          content : privateMessaage,
          timestamp : new Date()
      };

      client.send('/app/chat',{}, JSON.stringify(privateChatMessage));

        // Update the state to reflect the new message
        setPrivateChats((prevMessages) => [...prevMessages, privateChatMessage]);

        // Clear the input field
        setPrivateMessage('');
    }

  }

   const fetchPrivateMessagefromDB = async() => {
    try {
      const response = await axios.get(`http://localhost:8080/message/${inputValue}/${selectedUser}`);
      setPrivateChats(response.data);
    } catch (error) {
      console.error('Error fetching user chat:', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
  {!connected && (
    <div className="flex flex-col items-center justify-center h-screen">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter connection URL"
        className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-64 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        onClick={connectToWebSocket} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
        Connect
      </button>
    </div>
  )}

  {connected && selectedUser == null && (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center">
        <Sidebar onlineuser={connectedUser} setSelectedUser={setSelectedUser} />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-full border border-gray-300 rounded-md p-4 mb-4 h-96 overflow-auto bg-white shadow-md">
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
            className="border border-gray-300 rounded-md px-4 py-2 w-48 mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSendMessage} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
            Send Message
          </button>
        </div>
      </div>
    </div>
  )}

  {connected && selectedUser && (
    <div className="flex items-center justify-center h-screen">
      <div className="flex items-center">
        <Sidebar onlineuser={connectedUser} setSelectedUser={setSelectedUser} />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-full border border-gray-300 rounded-md p-4 mb-4 h-96 overflow-auto bg-white shadow-md">
          <ul>
            {getprivateChats
              .filter((msg) => (msg.senderId === inputValue && msg.reciverId === selectedUser) || (msg.senderId === selectedUser && msg.reciverId === inputValue))
              .map((msg, index) => (
                <li key={index} className="mb-2 flex items-center">
                  <div>
                    <span className="font-bold">{msg.senderId === inputValue ? inputValue : msg.senderId}</span>: {msg.content}
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex">
          <input
            type="text"
            onChange={(e) => setPrivateMessage(e.target.value)}
            placeholder="Enter private message"
            className="border border-gray-300 rounded-md px-4 py-2 w-48 mr-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handlePrivateMessage} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
            Send Private Message
          </button>
        </div>
      </div>
    </div>
  )}
</div>


  );

}

export default ChatComponent;