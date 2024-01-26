import Comment from "../Schema/Comment.js";
import Notification from "../Schema/Notification.js";
import Blog from "../Schema/Blog.js";

const deleteComment = (_id) => {
  Comment.findOneAndDelete({ _id }).then((comment) => {
    if (comment.parent) {
      Comment.findOneAndUpdate(
        { _id: comment.parent },
        { $pull: { children: _id } }
      )
        .then((data) => {
          console.log("comment deleted from parent");
        })
        .catch((err) => console.log(err));
    }
    Notification.findOneAndDelete({ comment: _id }).then((notification) =>
      console.log("comment notification deleted")
    );
    Notification.findOneAndUpdate(
      { replied_on_comment: _id },
      { $unset: { replied_on_comment: 1 } }
    ).then((notification) => console.log("Reply removed from noti"));
    Blog.findOneAndUpdate(
      { _id: comment.blog_id },
      {
        $pull: { comments: _id },
        $inc: {
          "activity.total_comments": -1,
          "activity.total_parent_comments": comment.parent ? 0 : -1,
        },
      }
    )
      .then((blog) => {
        if (comment.children.length) {
          comment.children.map((replies) => {
            deleteComment(replies);
          });
        }
      })
      .catch((err) => console.log(err.message));
  });
};

const commentController = {};

commentController.addComment = (req, res) => {
  let user_id = req.user;
  let { _id, comment, blog_author, replying_to, notification_id } = req.body;
  if (!comment.length) {
    return res
      .status(402)
      .json({ error: "Write something to leave a comment" });
  }
  let commentObj = {
    blog_id: _id,
    blog_author,
    comment,
    commented_by: user_id,
  };
  if (replying_to) {
    commentObj.parent = replying_to;
    commentObj.isReply = true;
  }
  new Comment(commentObj).save().then(async (commentFile) => {
    let { comment, commentedAt, children } = commentFile;

    Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": replying_to ? 0 : 1,
        },
      }
    ).then((blog) => {
      console.log("New comment creeated");
    });
    let notificationObj = {
      type: replying_to ? "reply" : "comment",
      blog: _id,
      notification_for: blog_author,
      user: user_id,
      comment: commentFile._id,
    };
    if (replying_to) {
      notificationObj.replied_on_comment = replying_to;
      await Comment.findOneAndUpdate(
        { _id: replying_to },
        { $push: { children: commentFile._id } }
      ).then((replyingToCommentDoc) => {
        notificationObj.notification_for = replyingToCommentDoc.commented_by;
      });
      if (notification_id) {
        Notification.findOneAndUpdate(
          { _id: notification_id },
          { reply: commentFile._id }
        ).then((notification) => console.log("Notification Updated"));
      }
    }
    new Notification(notificationObj)
      .save()
      .then((notification) => console.log("New notification created"));
    return res.status(200).json({
      comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children,
    });
  });
};
commentController.getBlogComments = (req, res) => {
  let { blog_id, skip } = req.body;
  let maxLimit = 5;
  Comment.find({ blog_id, isReply: false })
    .populate(
      "commented_by",
      "personal_info.username personal_info.fullname personal_info.profile_img"
    )
    .skip(skip)
    .limit(maxLimit)
    .sort({ commentedAt: -1 })
    .then((comments) => {
      return res.status(200).json(comments);
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
commentController.getReplies = (req, res) => {
  let { _id, skip } = req.body;
  let maxLimit = 5;
  Comment.findOne({ _id })
    .populate({
      path: "children",
      options: { limit: maxLimit, skip: skip, sort: { commentedAt: -1 } },
      populate: {
        path: "commented_by",
        select:
          "personal_info.profile_img personal_info.username personal_info.fullname",
      },
      select: "-blog_id -updatedAt",
    })
    .select("children")
    .then((doc) => {
      return res.status(200).json({ replies: doc.children });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
commentController.deleteComment = (req, res) => {
  let { _id } = req.body;
  let user_id = req.user;
  Comment.findOne({ _id })
    .then((comment) => {
      if (user_id == comment.commented_by || user_id == comment.blog_author) {
        deleteComment(_id);
        return res.status(200).json({ status: "done" });
      } else {
        return res
          .status(403)
          .json({ error: "You cannot delete this comment" });
      }
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};
export default commentController;
