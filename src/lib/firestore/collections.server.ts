import { BillSchema } from "./schemas/Bill";
import { FriendSchema } from "./schemas/Friend";
import { InviteLinkSchema } from "./schemas/InviteLink";
import { collection } from "./utils.server";

export const billCollection = collection(BillSchema, 'bills');
export const friendCollection = collection(FriendSchema, 'friends');
export const inviteLinkCollection = collection(InviteLinkSchema, 'inviteLinks');