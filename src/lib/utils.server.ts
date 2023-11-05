import type { Session } from '@auth/core/types';
import { error } from '@sveltejs/kit';

export type SessionContainer = App.Locals | (() => Promise<{ session: Session | null }>);
export async function getUser(
	sessionObj: SessionContainer
) {
	const session =
		typeof sessionObj === 'function' ? (await sessionObj()).session : await sessionObj?.getSession();
	if (!session?.user?.email) {
        console.log('User not logged in');
		throw error(401, { message: 'Not logged in' });
	}
	return {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
    };
}
