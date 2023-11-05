import { firestore } from "$lib/firebase.server";
import type { CollectionReference, DocumentData, FirestoreDataConverter } from "firebase-admin/firestore";
import type { ZodSchema, z } from "zod";

export function collection<T>(schema: ZodSchema<T>, path: string): CollectionReference<z.input<typeof schema>> {
    return firestore.collection(path).withConverter(converter(schema));
}

export function converter<T>(schema: ZodSchema<T>): FirestoreDataConverter<z.input<typeof schema>> {
	return {
		toFirestore(obj: z.input<typeof schema>): DocumentData {
            const firestoreObj = schema.parse(obj);
			/* console.log(firestoreObj) */
			return firestoreObj as DocumentData;
		},
		fromFirestore(snapshot) {
			return snapshot.data() as z.input<typeof schema>;
		}
	};
}