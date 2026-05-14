import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: String,

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["owner", "admin", "staff"],
      default: "staff",
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model("User", userSchema);