import type { Cookies } from '@sveltejs/kit';
import { gql } from 'graphql-request';
import { graphQlRequest } from '../../../__route/util.server';

export async function rememberDevice(cookies: Cookies) {
	await graphQlRequest(cookies, REMEMBER_DEVICE_QUERY);
	return 'success';
}

const REMEMBER_DEVICE_QUERY = gql`
	mutation authorizeDevice {
		authorizeDevice {
			id
			fingerprint
			userAgent
			location
			platform
			browser
			currentDevice
			createdAt
			__typename
		}
	}
`;
