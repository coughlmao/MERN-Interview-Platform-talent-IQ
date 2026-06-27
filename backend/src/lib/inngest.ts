import { EventSchemas, Inngest } from "inngest";

import connectDB from "./db.js";
import UserModel from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

interface Events {
  "clerk/user.created": {
    data: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
      first_name: string | null;
      last_name: string | null;
      image_url: string | null;
    };
  },
  "clerk/user.deleted": {
    data: {
      id: string;
    }
  }
}

export const inngest = new Inngest({ 
  id: "talent-iq",
});

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" as const },
  async ({ event }: { event: Events["clerk/user.created"]}) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } =
      event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      profileImage: image_url || "",
    };

    await UserModel.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId,
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" as const },
  async ({ event }: { event: Events["clerk/user.deleted"] }) => {
    await connectDB();

    const { id } = event.data;

    await UserModel.deleteOne({ clerkId: id });

    await deleteStreamUser(id);
  }
);

export const functions = [syncUser, deleteUserFromDB];
