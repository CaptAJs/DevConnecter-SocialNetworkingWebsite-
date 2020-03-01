const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const validatePostInput = require("../../validation/post");
const validateCommentInput = require("../../validation/comment");

router.get("/test", (req, res) =>
  res.json({
    msg: "post works"
  })
);

//@route  GET /api/post
//@desc   Get Post
//@access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json({ posts }))
    .catch(err =>
      res.status(404).json({ noposts: "No Post found with that id" })
    );
});

//@route  GET /api/post
//@desc   Get Post
//@access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json({ post }))
    .catch(err =>
      res.status(404).json({ nopost: "No Post found with that id" })
    );
});

//@route  POST /api/post
//@desc   create Post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };
    new Post(newPost).save().then(post => res.json(post));
  }
);

//@route  POST /api/post/comment/:id
//@desc   post comment on Post
//@access Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        post.comment.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => {
        res.status(404).json({ noComment: "No Comment Found" });
      });
  }
);

//@route  POST /api/post/like/:id
//@desc   Like on post
//@access Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "User already liked this post" });
          }
          //add user id
          post.likes.unshift({ user: req.user.id });
          post.save().then(post => {
            res.json(post);
          });
        });
      })
      .catch(err =>
        res.status(404).json({ nopost: "No Post found with that id" })
      );
  }
);

//@route  POST /api/post/unlike/:id
//@desc   Unlike on post
//@access Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.params.id })
      .then(profile => {
        Post.findById(req.params.id).then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notLiked: "User has not liked this post" });
          }
          //remove user id
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then(post => {
            res.json(post);
          });
        });
      })
      .catch(err =>
        res.status(404).json({ nopost: "No Post found with that id" })
      );
  }
);

//@route  DELETE /api/post/:id
//@desc   Delete Post
//@access Public
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notAuthorized: "User not Authorized" });
            }
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err =>
            res.status(404).json({ postNotFound: "No post Found" })
          );
      })
      .catch(err =>
        res.status(404).json({ nopost: "No Post found with that id" })
      );
  }
);

//@route  Delete /api/post/comment/:id/:comment_id
//@desc   remove comment on Post
//@access Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id).then(post => {
        if (
          post.comment.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res.status.json({ commentnotexists: "comment do not exist" });
        }
        const removeIndex = post.comment
          .map(comment => comment._id.toString())
          .indexOf(req.params.comment_id);
        post.comment.splice(removeIndex, 1);
        post.save().then(post => {
          res.json(post);
        });
      });
    });
  }
);

module.exports = router;
