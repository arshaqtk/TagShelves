import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    plan: {
      type: String,
      default: "free",
    },
    subscriptionStatus: {
      type: String,
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);