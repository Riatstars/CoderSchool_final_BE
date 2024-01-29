import Follow from "../Schema/Follow.js";
import Notification from "../Schema/Notification.js";
import User from "../Schema/User.js";

const followController = {};

followController.checkFollow = (req, res) => {
  const user_id = req.user;
  const target_user = req.body.target;

  User.findOne({ "personal_info.username": target_user })
    .then((user) => {
      Follow.findOne({
        author: user_id,
        target_user: user._id,
      })
        .then((follow) => {
          if (!follow) {
            let newFollow = new Follow({
              author: user_id,
              target_user: user._id,
              status: false,
            });
            newFollow.save().then((follow) => {
              return res.status(200).json(follow);
            });
          } else {
            return res.status(200).json(follow);
          }
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json({ error: err.message });
        });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

followController.updateFollow = (req, res) => {
  const user_id = req.user;
  const targetUserId = req.body.target;
  const status = req.body.status;

  Follow.findOneAndUpdate(
    {
      author: user_id,
      target_user: targetUserId,
    },
    { status: status }
  )
    .then((follow) => {
      follow.status = status;
      if (status) {
        let noti = new Notification({
          type: "follow",
          notification_for: targetUserId,
          user: user_id,
        });
        noti
          .save()
          .then((noti) => {
            console.log("notification created");
          })
          .catch((err) => console.log(err));
      } else {
        Notification.findOneAndDelete({
          type: "follow",
          notification_for: targetUserId,
          user: user_id,
        })
          .then((noti) => console.log("notification deleted"))
          .catch((err) => console.log(err));
      }
      return res.status(200).json(follow);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

followController.getFollowings = (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  const user_id = req.user;
  Follow.find({ author: user_id, status: true })
    .populate("target_user", "joinedAt personal_info account_info -_id")
    .sort({ joinedAt: -1 })
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((followings) => {
      return res.status(200).json({ followings });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

followController.allFollowingsCount = (req, res) => {
  const user_id = req.user;
  Follow.countDocuments({ author: user_id, status: true })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
};

followController.getFollowers = (req, res) => {
  let { page } = req.body;
  let maxLimit = 5;
  const user_id = req.user;
  Follow.find({ target_user: user_id, status: true })
    .populate("author", "joinedAt personal_info account_info -_id")
    .sort({ joinedAt: -1 })
    .skip(maxLimit * (page - 1))
    .limit(maxLimit)
    .then((followers) => {
      return res.status(200).json({ followers });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

followController.allFollowersCount = (req, res) => {
  const user_id = req.user;
  Follow.countDocuments({ target_user: user_id, status: true })
    .then((count) => {
      return res.status(200).json({ totalDocs: count });
    })
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
};

export default followController;
