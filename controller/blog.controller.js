import Blog from "../Schema/Blog.js";
import Notification from "../Schema/Notification.js";
import User from "../Schema/User.js";
import Comment from "../Schema/Comment.js";
import { nanoid } from "nanoid";
import Follow from "../Schema/Follow.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

const blogController = {};

blogController.latestBlogs = (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;

  Blog.find({ draft: false })
    .populate(
      "author",
      " personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .select("blog_id title des banner activity tags publishedAt -_id")
    .sort({ publishedAt: -1 })
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.latestBlogsWithAuth = async (req, res) => {
  try {
    let user_id = req.user;
    let { page } = req.body;
    let maxLimit = 5;

    let aggregate = await Follow.aggregate([
      { $match: { author: new ObjectId(user_id), status: true } },
      { $project: { target_user: 1 } },
      { $sort: { createdAt: -1 } },
    ]);

    let ObjectIdArr = aggregate.map((item) => {
      return new ObjectId(item.target_user.toString()); // Use target_user instead of _id
    });

    if (!aggregate.length) {
      const blogs = Blog.find({ draft: false })
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .select("blog_id title des banner activity tags publishedAt -_id")
        .sort({ publishedAt: -1 })
        .skip(maxLimit * (page - 1))
        .limit(maxLimit)
        .then((blogs) => {
          return res.status(200).json({ blogs });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    } else {
      const blogs = Blog.find({
        draft: false,
        author: { $in: ObjectIdArr },
      })
        .populate(
          "author",
          "personal_info.profile_img personal_info.username personal_info.fullname -_id"
        )
        .select("blog_id title des banner activity tags publishedAt -_id")
        .sort({ publishedAt: -1 })
        .then((blogsIn) => {
          const blogs = Blog.find({
            draft: false,
            author: { $nin: ObjectIdArr },
          })
            .populate(
              "author",
              "personal_info.profile_img personal_info.username personal_info.fullname -_id"
            )
            .select("blog_id title des banner activity tags publishedAt -_id")
            .sort({ publishedAt: -1 })
            .then((blogsNin) => {
              blogsNin.forEach((item) => blogsIn.push(item));
              const blogs = blogsIn.slice(
                maxLimit * (page - 1),
                maxLimit * page
              );
              return res.status(200).json({
                blogs,
              });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
blogController.allLatestBlogsCount = (req, res) => {
  Blog.countDocuments({ draft: false })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
};
blogController.trendingBlogs = (req, res) => {
  let maxLimit = 5;
  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id title activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.searchBlogs = (req, res) => {
  let { tag, query, page, author, limit, eliminate_blog } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
  } else if (query) {
    findQuery = { title: { $regex: query, $options: "i" }, draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  let maxLimit = limit ? limit : 2;
  Blog.find(findQuery)
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({
      "activity.total_reads": -1,
      "activity.total_likes": -1,
      publishedAt: -1,
    })
    .select("blog_id des banner title activity tags publishedAt -_id")
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.searchBlogsCount = (req, res) => {
  let { tag, query, author } = req.body;
  let findQuery;
  if (tag) {
    findQuery = { tags: tag, draft: false };
  } else if (query) {
    findQuery = { title: { $regex: query, $options: "i" }, draft: false };
  } else if (author) {
    findQuery = { author, draft: false };
  }
  Blog.countDocuments(findQuery)
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.createBlog = (req, res) => {
  let authorId = req.user;
  let isAdmin = req.admin;
  if (isAdmin) {
    let { title, banner, content, des, tags, draft, id } = req.body;
    tags = tags.map((tag) => tag.toLowerCase());
    let blog_id =
      id ||
      title
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, "-")
        .trim() + nanoid();
    if (id) {
      Blog.findOneAndUpdate(
        { blog_id },
        { title, des, banner, content, tags, draft: draft ? draft : false }
      )
        .then(() => {
          return res.status(200).json({ id: blog_id });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    } else {
      let blog = new Blog({
        title,
        banner,
        tags,
        des,
        content,
        author: authorId,
        blog_id,
        draft: Boolean(draft),
      });
      let incrementVal = Boolean(draft) ? 0 : 1;
      blog
        .save()
        .then((blog) => {
          User.findOneAndUpdate(
            { _id: authorId },
            {
              $inc: { "account_info.total_posts": incrementVal },
              $push: { blogs: blog._id },
            }
          )
            .then((user) => {
              return res.status(200).json({ id: blog.blog_id });
            })
            .catch((err) => {
              console.log(incrementVal);
              return res.status(500).json({ error: err });
            });
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });
    }
  } else {
    return res.status(500).json({ error: "You dont have permission to post" });
  }
};
blogController.getBlog = (req, res) => {
  let { blog_id, draft, mode } = req.body;
  let incrementVal = mode !== "edit" ? 1 : 0;
  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img "
    )
    .select("title des content banner activity publishedAt blog_id tags")
    .then((blog) => {
      User.findOneAndUpdate(
        {
          "personal_info.username": blog.author.personal_info.username,
        },
        {
          $inc: {
            "account_info.total_reads": incrementVal,
          },
        }
      ).catch((err) => {
        return res.status(500).json({ error: err.message });
      });
      if (blog.draft && !draft) {
        return res.status(500).json({ error: "you cannot access draft blogs" });
      }
      return res.status(200).json({ blog });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.likeBlog = (req, res) => {
  let user_id = req.user;
  let { _id, isLikedByUser } = req.body;
  let incrementVal = !isLikedByUser ? 1 : -1;
  Blog.findOneAndUpdate(
    { _id },
    { $inc: { "activity.total_likes": incrementVal } }
  )
    .then((blog) => {
      if (!isLikedByUser) {
        let like = new Notification({
          type: "like",
          blog: _id,
          notification_for: blog.author,
          user: user_id,
        });
        like.save().then((notification) => {
          return res.status(200).json({ liked_by_user: true });
        });
      } else {
        Notification.findOneAndDelete({
          user: user_id,
          blog: _id,
          type: "like",
        })
          .then((data) => {
            return res.status(200).json({ liked_by_user: false });
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }
    })

    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.isLikedByUser = (req, res) => {
  let user_id = req.user;
  let { _id } = req.body;
  Notification.exists({ user: user_id, type: "like", blog: _id })
    .then((result) => {
      return res.status(200).json({ result });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.userWrittenBlogs = (req, res) => {
  let user_id = req.user;
  let { page, draft, query, deletedDocCount } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;
  if (deletedDocCount) {
    skipDocs -= deletedDocCount;
  }
  if (!query) {
    query = "";
  }
  Blog.find({
    author: user_id,
    draft,
    title: { $regex: query, $options: "i" },
  })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ publishedAt: -1 })
    .select("title banner publishedAt blog_id des activity -_id")
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.userWrittenBlogsCount = (req, res) => {
  let user_id = req.user;
  let { draft, query } = req.body;
  Blog.countDocuments({
    author: user_id,
    draft,
    title: { $regex: query, $options: "i" },
  })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.likedBlogs = (req, res) => {
  let user_id = req.user;
  let { page } = req.body;
  let maxLimit = 5;
  let skipDocs = (page - 1) * maxLimit;

  Notification.find({ user: user_id, type: "like" })
    .select("blog -_id")
    .populate({
      path: "blog",
      select: "title banner author publishedAt blog_id des activity -_id",
      populate: { path: "author", select: "personal_info -_id" },
    })
    .skip(skipDocs)
    .limit(maxLimit)
    .sort({ createdAt: -1 })
    .then((blogs) => {
      blogs = blogs.map((blog) => blog.blog);
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.likedBlogsCount = (req, res) => {
  let user_id = req.user;
  Notification.countDocuments({ user: user_id, type: "like" })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};
blogController.deleteBlog = (req, res) => {
  let user_id = req.user;
  let isAdmin = req.admin;
  let { blog_id } = req.body;

  if (isAdmin) {
    Blog.findOneAndDelete({ blog_id })
      .then((blog) => {
        Notification.deleteMany({ blog: blog._id }).then((data) =>
          console.log("notification deleted")
        );
        Comment.deleteMany({ blog_id: blog._id }).then((data) =>
          console.log("comments deleted")
        );
        User.findOneAndUpdate(
          { _id: user_id },
          {
            $pull: { blog: blog._id },
            $inc: { "account_info.total_posts": -1 },
          }
        ).then((data) => console.log("comments deleted"));
        return res.status(200).json({ status: "done" });
      })
      .catch((err) => {
        return res.status(500).json({ error: err.message });
      });
  } else {
    return res
      .status(500)
      .json({ error: "you dont have the permission to delete" });
  }
};
export default blogController;
