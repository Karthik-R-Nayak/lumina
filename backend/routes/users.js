import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { authenticate } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const buildProfilePicUrl = (req, profilePic) => {
  if (!profilePic) return '';
  if (profilePic.startsWith('http')) return profilePic;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}${profilePic}`;
};

const router = express.Router();

// Get current user profile with posts
router.get('/me/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic name')
      .populate('likes', 'username')
      .populate('comments.user', 'username profilePic');

    const formattedPosts = posts.map(post => ({
      id: post._id,
      image: post.image,
      caption: post.caption,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      createdAt: post.createdAt
    }));

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePic: buildProfilePicUrl(req, user.profilePic),
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: posts.length
      },
      posts: formattedPosts
    });
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:username', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username profilePic')
      .populate('following', 'username profilePic');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('likes', 'username')
      .populate('comments.user', 'username profilePic');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        bio: user.bio,
        profilePic: user.profilePic,
        followers: user.followers,
        following: user.following,
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: posts.length,
        isFollowing: user.followers.some(f => f._id.toString() === req.user._id.toString())
      },
      posts
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, upload.single('profilePic'), async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const userId = req.user._id;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`;
    } else if (req.body.profilePic) {
      updateData.profilePic = req.body.profilePic;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profilePic: buildProfilePicUrl(req, user.profilePic)
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Follow/Unfollow user
router.post('/:userId/follow', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following.some(
      id => id.toString() === userId
    );

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userId
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUserId.toString()
      );
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
      isFollowing: !isFollowing
    });
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings
router.put('/settings', authenticate, async (req, res) => {
  try {
    const { darkMode, notifications } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (darkMode !== undefined) updateData['settings.darkMode'] = darkMode;
    if (notifications !== undefined) updateData['settings.notifications'] = notifications;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Settings updated successfully',
      settings: user.settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

