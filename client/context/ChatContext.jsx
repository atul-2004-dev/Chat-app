// src/context/ChatContext.jsx

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';

import { AuthContext } from './AuthContext'; // ✅ Correct import
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  // ✅ State setup
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // ✅ Get axios and socket from AuthContext
  const { socket, axios } = useContext(AuthContext);

  // ✅ Get all users and unseen messages
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      console.log("Fetched users from backend:", data);
      if (data.success) {
        //setUsers(data.users);
        setUsers(data.user);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Get message history with a user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send a message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Subscribe to real-time incoming messages
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.sender._id === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.post(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.sender._id]: prev[newMessage.sender._id]
            ? prev[newMessage.sender._id] + 1
            : 1,
        }));
      }
    });
  };

  // ✅ Cleanup message subscriptions
  const unsubscribeToMessages = () => {
    if (socket) {
      socket.off("newMessage");
    }
  };

  // ✅ Manage subscriptions on selectedUser/socket change
  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeToMessages();
    };
  }, [socket, selectedUser]);

  // ✅ Context value
  const value = {
    messages,
    setMessages,
    users,
    getUsers,
    getMessages,
    sendMessage,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
