import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import summaryApi from "../Common/SummaryApi.js";
import { useSelector } from "react-redux";
import Axios from '../Utils/Axios.js'
import Picker from "emoji-picker-react";
import { Smile } from "lucide-react"; // nice emoji icon

const socket = io(import.meta.env.VITE_BASE_URL, {
  withCredentials: true,
  transports: ["websocket"], // force WS, avoids long polling issues
  auth: {
    token: localStorage.getItem("accesstoken"), // or however you store JWT
  },
});


export default function Discussion() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const onEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  // ✅ get logged-in user from redux store
  const user = useSelector((state) => state.auth).userData;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await Axios({
          ...summaryApi.discussionHistory,
          data: { classNum: user.class , batch:user.batch , limit:50 }
        });

        if (response.data.success) {
          setMessages(response.data.data.messages);
        }
      } catch (error) {
        console.error("Error fetching discussion history:", error);
      }
    };

    fetchMessages();

    // ✅ socket listener
    socket.on("receive_message", (msg) => {
      console.log(socket.id)
      setMessages((prev) => [...prev, msg]);
    });


    return () => {
      socket.off("receive_message");
    };
  }, []);
  
  useEffect(() => {
  socket.emit("join_room", { classNum: user.class, batch: user.batch });
}, [user.class, user.batch]);
  
  
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      sender: user?._id,
      senderName: user?.username,
      text: newMessage,
      school: user?.school,
      class: user?.class,
      batch: user?.batch,
      timestamp: new Date(),
    };
    
    console.log(socket.id)
    socket.emit("send_message", messageData);
    // setMessages((prev) => [...prev, messageData]); // optimistic update
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[95vh] max-w-3xl mx-auto bg-gray-100 border shadow-md">
      {/* Header */}
      <div className="bg-blue-400 text-white px-4 py-3  flex items-center justify-between">
        <h2 className="text-lg font-semibold">Class: {user.class}{user.batch}</h2>
        <span className="text-xs opacity-80">Group Chat</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-chat-pattern">
        {messages && messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isOwn = msg.sender === user?._id;

            return (
              <div
                key={idx}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg shadow-sm ${
                    isOwn
                      ? "bg-green-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none"
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold text-blue-600 mb-1">
                      {msg.senderName || "User"}
                    </p>
                  )}
                  <p className="text-sm">{msg.text}</p>
<p className="text-[10px] text-gray-200 text-right mt-1">
  {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-center mt-10">No messages yet.</p>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex items-center bg-white rounded-b-lg">
          {/* Emoji Button */}
  <button
    type="button"
    onClick={() => setShowEmojiPicker((prev) => !prev)}
    className="mr-2 text-gray-600 hover:text-blue-600"
  >
    <Smile size={22} />
  </button>

  {/* Emoji Picker */}
  {showEmojiPicker && (
    <div className="absolute bottom-14 left-2 z-50 shadow-lg">
      <Picker onEmojiClick={onEmojiClick} />
    </div>
  )}

  {/* Input */}
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-3 bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
