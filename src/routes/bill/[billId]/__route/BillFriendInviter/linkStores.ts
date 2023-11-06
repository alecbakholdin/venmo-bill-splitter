import { writable } from 'svelte/store';

export const linkStore = writable<{ invite?: string; split?: string }>({});
