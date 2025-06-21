const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Start or get a conversation between two users
exports.startConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
    
    const userA = req.user.id;
    const userB = userId;
    
    // Get both users to check their roles
    const userAObj = await User.findById(userA);
    const userBObj = await User.findById(userB);
    
    if (!userAObj || !userBObj) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Role-based conversation restrictions
    const canStartConversation = () => {
      switch (userAObj.role) {
        case 'guest':
          // Guests can only start conversations with hosts
          return userBObj.role === 'host';
        case 'host':
          // Hosts can start conversations with guests AND admins
          return userBObj.role === 'guest' || userBObj.role === 'admin';
        case 'admin':
          // Admins can only start conversations with hosts
          return userBObj.role === 'host';
        default:
          return false;
      }
    };
    
    if (!canStartConversation()) {
      return res.status(403).json({ 
        success: false, 
        message: `As a ${userAObj.role}, you can only start conversations with ${userAObj.role === 'host' ? 'guests or admins' : 'hosts'}.` 
      });
    }
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({ 
      participants: { $all: [userA, userB], $size: 2 } 
    });
    
    // If it doesn't exist, create it
    if (!conversation) {
      conversation = await Conversation.create({ participants: [userA, userB] });
    }
    
    // ALWAYS return the conversation ID
    res.status(200).json({ success: true, conversationId: conversation._id });

  } catch (err) {
    console.error('Start conversation error:', err);
    res.status(500).json({ success: false, message: 'Server error: Failed to start conversation' });
  }
};

// Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    const currentUser = req.user;
    
    console.log('Getting conversations for user:', {
      id: currentUser.id,
      role: currentUser.role
    });
    
    // Get all conversations for this user
    const allConversations = await Conversation.find({ participants: currentUser.id })
      .populate('participants', 'name email role')
      .sort({ updatedAt: -1 });
    
    console.log('All conversations found:', allConversations.length);
    
    // Apply role-based filtering
    const filteredConversations = allConversations.filter(conversation => {
      const otherParticipant = conversation.participants.find(p => p._id.toString() !== currentUser.id);
      
      if (!otherParticipant) {
        console.log('No other participant found for conversation:', conversation._id);
        return false;
      }
      
      console.log('Checking conversation:', {
        conversationId: conversation._id,
        currentUserRole: currentUser.role,
        otherUserRole: otherParticipant.role,
        otherUserName: otherParticipant.name,
        shouldShow: false // We'll calculate this
      });
      
      // Role-based filtering logic
      let shouldShow = false;
      switch (currentUser.role) {
        case 'guest':
          // Guests can only see conversations with hosts
          shouldShow = otherParticipant.role === 'host';
          break;
        case 'host':
          // Hosts can see conversations with guests AND admins
          shouldShow = otherParticipant.role === 'guest' || otherParticipant.role === 'admin';
          console.log(`Host conversation check: otherUser=${otherParticipant.role}, shouldShow=${shouldShow}`);
          break;
        case 'admin':
          // Admins can only see conversations with hosts
          shouldShow = otherParticipant.role === 'host';
          break;
        default:
          console.log('Unknown user role:', currentUser.role);
          shouldShow = false;
      }
      
      console.log(`Final decision for conversation ${conversation._id}: ${shouldShow ? 'SHOW' : 'HIDE'}`);
      return shouldShow;
    });
    
    console.log('Filtered conversations:', filteredConversations.length);
    
    // Get last messages and unread counts for filtered conversations
    const conversationsWithDetails = await Promise.all(
      filteredConversations.map(async (conversation) => {
        const otherParticipant = conversation.participants.find(p => p._id.toString() !== currentUser.id);
        
        // Get the last message
        const lastMessage = await Message.findOne({ conversation: conversation._id })
          .sort({ createdAt: -1 })
          .select('content createdAt');
        
        // Get unread count
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: currentUser.id },
          readBy: { $ne: currentUser.id }
        });
        
        return {
          ...conversation.toObject(),
          otherUser: otherParticipant,
          unreadCount,
          lastMessage: lastMessage?.content || null
        };
      })
    );
    
    console.log('Returning conversations:', conversationsWithDetails.length);
    
    res.json({ success: true, data: conversationsWithDetails });
  } catch (err) {
    console.error('Get conversations error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUser = req.user;
    
    console.log('Getting messages for conversation:', conversationId);
    console.log('Current user:', { id: currentUser.id, role: currentUser.role });
    
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });
    
    console.log('Found messages:', messages.length);
    console.log('Messages with sender info:', messages.map(m => ({
      id: m._id,
      sender: m.sender,
      senderId: m.sender._id,
      senderName: m.sender.name,
      content: m.content.substring(0, 30) + '...'
    })));
    
    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: 'Message content required' });
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      content,
      readBy: [req.user.id],
    });
    // Update lastMessage and updatedAt
    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id, updatedAt: new Date() });
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// Mark conversation as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await Message.updateMany({ conversation: conversationId, readBy: { $ne: req.user.id } }, { $push: { readBy: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
}; 

// Get available users for starting conversations
exports.getAvailableUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    
    console.log('Getting available users for:', {
      id: currentUser.id,
      role: currentUser.role
    });
    
    let targetRole;
    switch (currentUser.role) {
      case 'guest':
        targetRole = 'host';
        break;
      case 'host':
        // Hosts can start conversations with guests AND admins
        // We'll handle this differently by getting both roles
        break;
      case 'admin':
        targetRole = 'host';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid user role' });
    }
    
    // First, let's see all users in the database for debugging
    const allUsers = await User.find({}).select('name email role');
    console.log('All users in database:', allUsers.map(u => ({ name: u.name, role: u.role })));
    
    // Get users with the target role(s)
    let availableUsers;
    if (currentUser.role === 'host') {
      // Hosts can see guests and admins
      availableUsers = await User.find({ 
        role: { $in: ['guest', 'admin'] },
        _id: { $ne: currentUser.id } // Exclude current user
      }).select('name email role');
    } else {
      // Other roles have single target role
      availableUsers = await User.find({ 
        role: targetRole,
        _id: { $ne: currentUser.id } // Exclude current user
      }).select('name email role');
    }
    
    console.log(`Found ${availableUsers.length} available ${targetRole}s for ${currentUser.role}`);
    console.log('Available users:', availableUsers.map(u => ({ name: u.name, role: u.role, id: u._id })));
    
    // Also check if there are any existing conversations with these users
    const existingConversations = await Conversation.find({ participants: currentUser.id });
    console.log('Existing conversations for current user:', existingConversations.length);
    
    // Filter out users that already have conversations
    const usersWithoutConversations = availableUsers.filter(user => {
      const hasConversation = existingConversations.some(conv => 
        conv.participants.includes(user._id.toString())
      );
      return !hasConversation;
    });
    
    console.log(`Users without existing conversations: ${usersWithoutConversations.length}`);
    console.log('Final available users:', usersWithoutConversations.map(u => ({ name: u.name, role: u.role })));
    
    // For now, return ALL available users (not just those without conversations)
    // This will help us see if there are other hosts in the database
    res.json({ 
      success: true, 
      data: availableUsers, // Changed from usersWithoutConversations to availableUsers
      debug: {
        totalUsers: allUsers.length,
        allHosts: availableUsers.length,
        hostsWithoutConversations: usersWithoutConversations.length,
        existingConversations: existingConversations.length
      }
    });
  } catch (err) {
    console.error('Get available users error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch available users' });
  }
}; 

// Test endpoint to debug user roles and conversations
exports.testUserConversations = async (req, res) => {
  try {
    const currentUser = req.user;
    
    console.log('=== TEST USER CONVERSATIONS ===');
    console.log('Current user:', {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    });
    
    // Get all conversations for this user
    const allConversations = await Conversation.find({ participants: currentUser.id })
      .populate('participants', 'name email role');
    
    console.log('All conversations found:', allConversations.length);
    
    // Show each conversation and its participants
    allConversations.forEach((conv, index) => {
      console.log(`Conversation ${index + 1}:`, {
        id: conv._id,
        participants: conv.participants.map(p => ({
          id: p._id,
          name: p.name,
          role: p.role
        }))
      });
    });
    
    res.json({
      success: true,
      currentUser: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role
      },
      totalConversations: allConversations.length,
      conversations: allConversations.map(conv => ({
        id: conv._id,
        participants: conv.participants.map(p => ({
          id: p._id,
          name: p.name,
          role: p.role
        }))
      }))
    });
  } catch (err) {
    console.error('Test user conversations error:', err);
    res.status(500).json({ success: false, message: 'Failed to test user conversations' });
  }
}; 