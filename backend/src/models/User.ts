import mongoose, {
  InferSchemaType,
  HydratedDocument,
  Model,
  Schema,
} from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

type User = InferSchemaType<typeof userSchema>;

type UserDocument = HydratedDocument<User>;

const UserModel: Model<User> = mongoose.model<User>("User", userSchema);

export default UserModel;
export type { User, UserDocument };
