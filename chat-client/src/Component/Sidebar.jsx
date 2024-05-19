function Sidebar({ onlineuser, setSelectedUser }) {

  const handleUserClick = (username) => {
    setSelectedUser(username); // Set the selected user when clicked
  };
  const handleChatRoomClick = () => {
    setSelectedUser(null); // Set selectedUser to null when ChatRoom is clicked
  };
  return (
    <div className="flex flex-col h-full">
  <div className="flex flex-col border border-gray-300 rounded-md p-4 mr-4 h-96 mb-14 bg-white shadow-lg">
    <div className="flex-grow overflow-auto">
      <ul className="space-y-2">
        {onlineuser.map((user, index) => (
          <li
            key={index}
            onClick={() => handleUserClick(user.name)}
            className="cursor-pointer p-2 rounded-md hover:bg-blue-100"
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
    <div className="pt-2 mt-2 border-t border-gray-300">
      <ul>
      <li
        onClick={() => handleChatRoomClick()}
        className="cursor-pointer p-2 rounded-md hover:bg-blue-100"
      >
        ChatRoom
      </li>
      </ul>
     
    </div>
  </div>
</div>

  );
}

export default Sidebar;