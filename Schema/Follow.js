import mongoose, { Schema } from "mongoose";

const followSchema = mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    target_user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("follow", followSchema);
