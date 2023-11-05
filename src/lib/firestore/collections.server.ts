import { BillSchema } from "./schemas/Bill";
import { FriendSchema } from "./schemas/Friend";
import { collection } from "./utils.server";

export const billCollection = collection(BillSchema, 'bills');
export const friendCollection = collection(FriendSchema, 'friends');