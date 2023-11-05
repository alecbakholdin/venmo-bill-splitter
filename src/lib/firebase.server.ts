import {
	FIREBASE_CLIENT_EMAIL,
	FIREBASE_PRIVATE_KEY,
	FIREBASE_PROJECT_ID
} from '$env/static/private';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const apps = getApps();
const app = apps.length
	? apps[0]
	: initializeApp({
			credential: cert({
				projectId: FIREBASE_PROJECT_ID,
				clientEmail: FIREBASE_CLIENT_EMAIL,
				privateKey: FIREBASE_PRIVATE_KEY.replaceAll('\\n', '\n')
			}),
			databaseURL: `https://${FIREBASE_PROJECT_ID}.firebaseio.com`
	  });

export const firestore = getFirestore(app);
export const storage = getStorage(app);
