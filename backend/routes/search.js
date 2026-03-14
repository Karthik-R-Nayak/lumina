import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Search posts and users
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim() === '') {
      return res.json({ posts: [], users: [] });
    }

    const searchQuery = q.trim();

    let posts = [];
    let users = [];

    if (type === 'all' || type === 'posts') {
      // Search posts by caption
      posts = await Post.find({
        $text: { $search: searchQuery }
      })
      .limit(20)
      .populate('user', 'username profilePic')
      .populate('likes', 'username')
      .sort({ createdAt: -1 });

      // If text search doesn't work, use regex
      if (posts.length === 0) {
        posts = await Post.find({
          caption: { $regex: searchQuery, $options: 'i' }
        })
        .limit(20)
        .populate('user', 'username profilePic')
        .populate('likes', 'username')
        .sort({ createdAt: -1 });
      }
    }

    if (type === 'all' || type === 'users') {
      // Search users by username or name
      users = await User.find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { name: { $regex: searchQuery, $options: 'i' } }
        ]
      })
      .select('-password')
      .limit(20)
      .sort({ username: 1 });
    }

    const formattedPosts = posts.map(post => ({
      id: post._id,
      image: post.image,
      caption: post.caption,
      user: post.user,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      createdAt: post.createdAt
    }));

    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      name: user.name,
      profilePic: user.profilePic,
      bio: user.bio,
      followersCount: user.followers.length
    }));

    res.json({
      posts: formattedPosts,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

