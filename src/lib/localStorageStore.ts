import { derived, writable } from 'svelte/store';

const isBrowser = !!(typeof window !== 'undefined' && localStorage);
const initialValue = (isBrowser && JSON.parse(localStorage.localStorageStore || '{}')) || {};
const storage = writable(initialValue);
storage.subscribe((s) => {
	isBrowser && (localStorage.localStorageStore = JSON.stringify(s));
});

export function localStorageStore<T>(key: string, initialValue: T) {
	storage.update((s) => ({ [key]: initialValue, ...s }));
	const { subscribe } = derived(storage, ($local) => $local[key] as T);

	return {
		subscribe,
		set(n: T) {
			storage.update((s) => ({ ...s, [key]: n }));
		},
		update(callback: (n: T) => T) {
			storage.update((s) => ({ ...s, [key]: callback(s[key]) }));
		}
	};
}
