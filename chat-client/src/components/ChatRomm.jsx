import { useState } from "react";
import { over } from "stompjs";
import SockJS from "sockjs-client";

var stompClient = null;
function ChatRomm() {
    const [chat , setchat] = useState([])
    const [privateChat , setPrivateChat] = useState(new Map())
    const [tab ,setTab] = useState("CHATROOM")
    const [userData, setUserData] = useState({
        username: "",
        recivername: "",
        connected: false,
        message: ""
    });

    const handelValue = (event)=>{
        const {value , name} = event.target;
        setUserData({...userData , [name] : value}); 

    }
    const handelMessage = (event)=>{
        const {value} = event.target;
        setUserData({...userData , "message" : value}); 

    }
    const registerUser = ()=>{
       let Sock = new SockJS("http://localhost:8080/ws");
       stompClient = over(Sock);
       stompClient.connect({},onConnected , onError)  
       setPrivateChat(new Map([[userData.username, []]]));
    }

    const onConnected = ()=>{
        setUserData({...userData , "connected" : true});
        stompClient.subscribe("/chatroom/public",onPublicMessageRecived);
        stompClient.subscribe(`/user/${userData.username}/private`,onPrivateMEssageRecived);
        userJoin();

    }

    const userJoin = ()=>{
        if(stompClient){
            let chatMessage ={
                    senderName : userData.username,
                    status : "JOIN"
                }
                stompClient.send("/app/message",{},JSON.stringify(chatMessage))
            }
    }

    const onError = (err)=>{
        console.log(err);
    }

    const onPrivateMEssageRecived = (payload)=>{
        let payLoadData = JSON.parse(payload);
        if(payLoadData.status === "JOIN"){
            setPrivateChat((prevPrivateChat) => {
                const updatedPrivateChat = new Map(prevPrivateChat);
                if (!updatedPrivateChat.has(payLoadData.senderName)) {
                    updatedPrivateChat.set(payLoadData.senderName, []);
                }
                return updatedPrivateChat;
            });
        } else{
            let list = [];
            list.push(payload);
            privateChat.set(payLoadData.senderName,list)
            setPrivateChat(new Map(privateChat))
        }
    }


    const onPublicMessageRecived = (payload)=>{
        let payLoadData = JSON.parse(payload.body);

        switch(payLoadData.status){
            case "JOIN" :
                if(!privateChat.get(payLoadData.senderName)){
                    privateChat.set(payLoadData.senderName,[])
                    setPrivateChat(new Map(privateChat))
                }
                break;
            case "MESSAGE" :
                chat.push(payLoadData)
                setchat([...chat])
                break;
            case "LEAVE":
        }
    }

    const sendPublicMessage = ()=>{
        if(stompClient){
        let chatMessage ={
                senderName : userData.username,
                message : userData.message,
                status : "MESSAGE"
            }
            stompClient.send("/app/message",{},JSON.stringify(chatMessage))
            setUserData({...userData,"message":""})
        }
    }

    const sendPrivateMessage = ()=>{
        if(stompClient){
        let chatMessage ={
                senderName : userData.username,
                reciverName : tab,
                message : userData.message,
                status : "MESSAGE"
            }
            if(userData.username !==tab){
                privateChat.get(tab).push(chatMessage)
                setPrivateChat(new Map(privateChat))
            }
            stompClient.send("/app/priavte-message",{},JSON.stringify(chatMessage))
            setUserData({...userData,"message":""})
        }
    }

    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        {userData.connected ? (
          <div>
            <div>
              <ul>
                <li onClick={() => setTab("CHATROOM")}>Chatroom</li>
                {[...privateChat.keys()].map((name, index) => (
                  <li key={index} onClick={() => setTab(name)}>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
            {tab === "CHATROOM" && (
              <div>
                <ul>
                  {chat.map((chats, index) => (
                    <li key={index}>
                      {chats.senderName !== userData.username && (
                        <div> {chats.senderName}</div>
                      )}
                      <div>{chats.message}</div>
                      {chats.senderName == userData.username && (
                        <div> {chats.senderName}</div>
                      )}
                    </li>
                  ))}
                </ul>

                <div>
                  <input
                    type="text"
                    name="message"
                    className="input-message"
                    placeholder="enter the message"
                    value={userData.message}
                    onChange={handelValue}
                  />
                  <button
                    type="button"
                    className="send-button"
                    onClick={sendPublicMessage}
                  >
                    send
                  </button>
                </div>
              </div>
            )}
            {tab !== "CHATROOM" && (
              <div>
                <ul>
                  {privateChat.get(tab)?.map((message, index) => (
                    <li key={index}>
                      {message.senderName !== userData.username && (
                        <div>{message.senderName}</div>
                      )}
                      <div>{message.message}</div>
                      {message.senderName === userData.username && (
                        <div>{message.senderName}</div>
                      )}
                    </li>
                  ))}
                </ul>
                <div>
                  <input
                    type="text"
                    name="message"
                    className="input-message"
                    placeholder="Enter the message"
                    value={userData.message}
                    onChange={handelMessage}
                  />
                  <button
                    type="button"
                    className="send-button"
                    onClick={sendPrivateMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <input
              id="username"
              name="username"
              placeholder="Enter the Username"
              value={userData.username}
              onChange={handelValue}
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={registerUser}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Connect
            </button>
          </div>
        )}
      </div>
    );
}


export default ChatRomm;