import mongoose, {
  InferSchemaType,
  HydratedDocument,
  Schema,
  Model,
} from "mongoose";

const sessionSchema = new Schema(
  {
    problemTitle: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // Stream video-call id
    callId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

type Session = InferSchemaType<typeof sessionSchema>;

type SessionDocument = HydratedDocument<Session>;

const SessionModel: Model<Session> = mongoose.model<Session>(
  "Session",
  sessionSchema,
);

export default SessionModel;
export type { Session, SessionDocument };
