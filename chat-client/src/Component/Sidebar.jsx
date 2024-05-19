function Sidebar({ onlineuser, setSelectedUser }) {

  const handleUserClick = (username) => {
    setSelectedUser(username); // Set the selected user when clicked
  };
  const handleChatRoomClick = () => {
    setSelectedUser(null); // Set selectedUser to null when ChatRoom is clicked
  };
  return (
    <div className="flex flex-col h-full">
      <div className="w-32 border border-gray-300 rounded-md p-4 mr-4 h-96 mb-14 overflow-auto">
        <ul className="whitespace-normal">
          {onlineuser.map((user, index) => (
            <li key={index} onClick={() => handleUserClick(user.name)}>{user.name}</li>
          ))}

          <li onClick={()=>handleChatRoomClick()}>ChatRoom</li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;