import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Create a new post
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const { caption } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    const post = new Post({
      user: req.user._id,
      image: imageUrl,
      caption: caption || ''
    });

    await post.save();
    await post.populate('user', 'username profilePic name');

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: post._id,
        user: post.user,
        image: post.image,
        caption: post.caption,
        likes: [],
        comments: [],
        likesCount: 0,
        commentsCount: 0,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts (feed)
router.get('/feed', authenticate, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const followingIds = [...currentUser.following, req.user._id];

    const posts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('likes', 'username')
      .populate('comments.user', 'username profilePic')
      .limit(50);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      user: post.user,
      image: post.image,
      caption: post.caption,
      likes: post.likes,
      comments: post.comments,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: post.likes.some(like => like._id.toString() === req.user._id.toString()),
      createdAt: post.createdAt
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all posts (explore - public)
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePic')
      .populate('likes', 'username')
      .limit(100);

    const formattedPosts = posts.map(post => ({
      id: post._id,
      user: post.user,
      image: post.image,
      caption: post.caption,
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isLiked: req.user ? post.likes.some(like => like._id.toString() === req.user._id.toString()) : false,
      createdAt: post.createdAt
    }));

    res.json({ posts: formattedPosts });
  } catch (error) {
    console.error('Get explore error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a single post
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePic')
      .populate('likes', 'username profilePic')
      .populate('comments.user', 'username profilePic');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({
      post: {
        id: post._id,
        user: post.user,
        image: post.image,
        caption: post.caption,
        likes: post.likes,
        comments: post.comments,
        likesCount: post.likes.length,
        commentsCount: post.comments.length,
        isLiked: req.user ? post.likes.some(like => like._id.toString() === req.user._id.toString()) : false,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.some(
      like => like.toString() === req.user._id.toString()
    );

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    await post.populate('likes', 'username profilePic');

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a comment
router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      text: text.trim()
    });

    await post.save();
    await post.populate('comments.user', 'username profilePic');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        user: newComment.user,
        text: newComment.text,
        createdAt: newComment.createdAt
      },
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

