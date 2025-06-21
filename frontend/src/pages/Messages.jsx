"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { messagesAPI } from "../services/api"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { MessageCircle, Send, User } from "lucide-react"
import toast from "react-hot-toast"

const Messages = () => {
    const { user } = useAuth()
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [loading, setLoading] = useState(true)
    const [sendingMessage, setSendingMessage] = useState(false)
    const [availableUsers, setAvailableUsers] = useState([])
    const [showAvailableUsers, setShowAvailableUsers] = useState(false)

    useEffect(() => {
        if (user) {
        fetchConversations()
        }
    }, [user])

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id)
        }
    }, [selectedConversation])

    const fetchConversations = async () => {
        try {
            console.log('Current user:', user);
            const response = await messagesAPI.getConversations()
            console.log('Conversations response:', response.data)
            const conversationsData = response.data.data || []
            console.log('Processed conversations:', conversationsData)
            
            // Add additional validation for conversations
            const validConversations = conversationsData.filter(conversation => {
                if (!conversation.otherUser) {
                    console.warn('Conversation missing otherUser:', conversation);
                    return false;
                }
                return true;
            });
            
            console.log('Valid conversations:', validConversations.length);
            setConversations(validConversations)
            
            // If no conversations, fetch available users to start conversations with
            if (validConversations.length === 0) {
                await fetchAvailableUsers();
            }
        } catch (error) {
            console.error("Error fetching conversations:", error)
            toast.error("Failed to load conversations")
        } finally {
            setLoading(false)
        }
    }

    const fetchAvailableUsers = async () => {
        try {
            console.log('Fetching available users...');
            const response = await messagesAPI.getAvailableUsers();
            console.log('Available users response:', response.data);
            
            // Show debug information if available
            if (response.data.debug) {
                console.log('Debug info:', response.data.debug);
                toast.success(`Found ${response.data.debug.allHosts} hosts (${response.data.debug.hostsWithoutConversations} without conversations)`);
            }
            
            setAvailableUsers(response.data.data || []);
            setShowAvailableUsers(true);
        } catch (error) {
            console.error("Error fetching available users:", error);
            if (error.response?.status === 404) {
                toast.error("Available users endpoint not found. Please restart the server.");
            } else {
                toast.error("Failed to load available users: " + (error.response?.data?.message || error.message));
            }
        }
    }

    const testMessagesRoutes = async () => {
        try {
            console.log('Testing messages routes...');
            
            // Test basic route
            const testResponse = await messagesAPI.getAvailableUsersTest();
            console.log('Test route response:', testResponse.data);
            toast.success("Messages routes are working!");
            
            // Try the actual route
            const actualResponse = await messagesAPI.getAvailableUsers();
            console.log('Actual route response:', actualResponse.data);
            toast.success("Available users route is working!");
            
        } catch (error) {
            console.error("Test failed:", error);
            toast.error("Route test failed: " + (error.response?.data?.message || error.message));
        }
    }

    const testUserConversations = async () => {
        try {
            console.log('Testing user conversations...');
            const response = await messagesAPI.testConversations();
            console.log('Test conversations response:', response.data);
            
            if (response.data.success) {
                toast.success(`Found ${response.data.totalConversations} total conversations`);
                console.log('Current user:', response.data.currentUser);
                console.log('All conversations:', response.data.conversations);
            }
        } catch (error) {
            console.error("Test conversations failed:", error);
            toast.error("Test conversations failed: " + (error.response?.data?.message || error.message));
        }
    }

    const handleStartConversation = async (userId) => {
        try {
            const response = await messagesAPI.startConversation({ userId });
            console.log('Start conversation response:', response.data);
            
            if (response.data.success) {
                // Refresh conversations to show the new one
                await fetchConversations();
                setShowAvailableUsers(false);
                toast.success("Conversation started successfully");
            }
        } catch (error) {
            console.error("Error starting conversation:", error);
            toast.error("Failed to start conversation");
        }
    }

    const fetchMessages = async (conversationId) => {
        try {
            const response = await messagesAPI.getMessages(conversationId)
            console.log('Messages response:', response.data)
            setMessages(response.data.data || [])
            // Mark as read
            await messagesAPI.markAsRead(conversationId)
        } catch (error) {
            console.error("Error fetching messages:", error)
            toast.error("Failed to load messages")
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConversation) return

        setSendingMessage(true)
        try {
            const response = await messagesAPI.sendMessage({
                conversationId: selectedConversation.id,
                content: newMessage.trim(),
            })
            setMessages((prev) => [...prev, response.data.data])
            setNewMessage("")
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error("Failed to send message")
        } finally {
            setSendingMessage(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
                <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-8rem)] sm:h-[600px] flex flex-col lg:flex-row overflow-hidden">
                    {/* Conversations List */}
                    <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r flex-shrink-0 flex flex-col min-h-0">
                        <div className="p-3 sm:p-4 border-b flex-shrink-0">
                            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                            <p className="text-sm text-gray-500">Role: {user?.role || 'Unknown'}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {conversations.length === 0 && (
                                    <button
                                        onClick={fetchAvailableUsers}
                                        className="text-xs bg-primary-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-primary-700"
                                    >
                                        Refresh Available Users
                                    </button>
                                )}
                                <button
                                    onClick={testMessagesRoutes}
                                    className="text-xs bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700"
                                >
                                    Test Routes
                                </button>
                                <button
                                    onClick={testUserConversations}
                                    className="text-xs bg-green-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-green-700"
                                >
                                    Test Conversations
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {conversations.length > 0 ? (
                                conversations.map((conversation) => {
                                    // The backend now provides otherUser directly
                                    const otherUser = conversation.otherUser;
                                    
                                    // Additional safety check
                                    if (!otherUser) {
                                        console.warn('Skipping conversation with no otherUser:', conversation);
                                        return null;
                                    }
                                    
                                    console.log('Conversation:', {
                                        conversationId: conversation._id,
                                        otherUser,
                                        currentUserRole: user?.role
                                    });
                                    
                                    return (
                                        <div
                                            key={conversation._id}
                                            onClick={() => setSelectedConversation({
                                                ...conversation,
                                                id: conversation._id
                                            })}
                                            className={`p-3 sm:p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === conversation._id ? "bg-primary-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{otherUser?.name || 'Unknown User'}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-600 truncate">{conversation.lastMessage || 'No messages yet'}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{otherUser?.role || 'Unknown Role'}</p>
                                            </div>
                                            {conversation.unreadCount > 0 && (
                                                <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 flex-shrink-0">
                                                    {conversation.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    );
                                }).filter(Boolean) // Remove any null entries
                            ) : showAvailableUsers && availableUsers.length > 0 ? (
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                                        Available {user?.role === 'admin' ? 'Hosts' : user?.role === 'guest' ? 'Hosts' : 'Guests & Admins'} to Message
                                    </h3>
                                    {availableUsers.map((availableUser) => (
                                        <div
                                            key={availableUser._id}
                                            onClick={() => handleStartConversation(availableUser._id)}
                                            className="p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 mb-2"
                                        >
                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{availableUser.name}</h4>
                                                    <p className="text-xs text-gray-500 capitalize">{availableUser.role}</p>
                                                </div>
                                                <button className="text-xs bg-primary-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded hover:bg-primary-700 flex-shrink-0">
                                                    Start Chat
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 text-center text-gray-500">
                                    <p>No conversations yet</p>
                                    {user?.role === 'admin' && (
                                        <div className="mt-2">
                                            <p className="text-xs mb-2">Click "Refresh Available Users" to see hosts you can message</p>
                                            <button
                                                onClick={fetchAvailableUsers}
                                                className="text-xs bg-primary-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-primary-700"
                                            >
                                                Refresh Available Users
                                            </button>
                                        </div>
                                    )}
                                    {user?.role === 'host' && (
                                        <div className="mt-2">
                                            <p className="text-xs mb-2">Click "Refresh Available Users" to see guests and admins you can message</p>
                                            <button
                                                onClick={fetchAvailableUsers}
                                                className="text-xs bg-primary-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-primary-700"
                                            >
                                                Refresh Available Users
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="p-3 sm:p-4 border-b flex-shrink-0">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedConversation.otherUser?.name || 'Unknown User'}</h3>
                                            <p className="text-xs sm:text-sm text-gray-500 capitalize">{selectedConversation.otherUser?.role || 'Unknown Role'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages List */}
                                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0 w-full">
                                    {messages.map((message) => {
                                        // Check if current user is the sender
                                        // Handle both populated sender object and sender ID
                                        const messageSenderId = message.sender?._id || message.sender;
                                        const isCurrentUserMessage = messageSenderId === user?._id || messageSenderId === user?.id;
                                        
                                        console.log('Message alignment check:', {
                                            messageId: message._id,
                                            messageSender: message.sender,
                                            messageSenderId,
                                            currentUserId: user?._id,
                                            currentUserIdAlt: user?.id,
                                            isCurrentUserMessage,
                                            content: message.content.substring(0, 20) + '...'
                                        });
                                        
                                        return (
                                            <div key={message._id || message.id} className={`flex w-full ${isCurrentUserMessage ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`max-w-[75%] sm:max-w-xs lg:max-w-sm px-3 sm:px-4 py-2 rounded-lg break-words overflow-hidden word-break-break-all flex-shrink-0 ${isCurrentUserMessage ? "bg-primary-600 text-white" : "bg-gray-200 text-gray-900"
                                                    }`}
                                            >
                                                <p className="text-sm sm:text-base whitespace-pre-wrap break-words overflow-wrap-anywhere w-full">{message.content}</p>
                                                    <p className={`text-xs mt-1 ${isCurrentUserMessage ? "text-primary-100" : "text-gray-500"}`}>
                                                    {new Date(message.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t flex-shrink-0">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 input text-sm sm:text-base"
                                            disabled={sendingMessage}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sendingMessage}
                                            className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                        >
                                            {sendingMessage ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="text-center">
                                    <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                                    <p className="text-sm sm:text-base text-gray-600">Choose a conversation from the list to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Messages
