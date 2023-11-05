import type { VenmoPersonSchema } from '$lib/firestore/schemas/Venmo.js';
import { error, json } from '@sveltejs/kit';
import {parse} from 'node-html-parser';
import type { z } from 'zod';

export async function GET({params}) {
    const venmo = params.venmo.toLowerCase().replaceAll(/[^a-z0-9-_]/g, "");
    const response = await fetch(`https://account.venmo.com/u/${venmo}`);
    if(response.status === 404) throw error(404, {message: 'User not found'});
    
    const parsedHtml = parse(await response.text());
	const nextDataScriptTag = parsedHtml.querySelector('#__NEXT_DATA__');
	const nextData = JSON.parse(nextDataScriptTag?.innerText || '{}');
	const userData = nextData?.props?.pageProps?.user;

    return json({
        venmo,
        id: `${userData.id}`,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        avatar: userData.profilePictureUrl,
    } satisfies z.infer<typeof VenmoPersonSchema>)
}