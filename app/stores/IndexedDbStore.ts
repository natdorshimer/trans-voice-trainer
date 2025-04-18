'use client';

import {useEffect, useState} from 'react';
import create, {GetState, SetState, StoreApi} from 'zustand';
import {devtools, persist, PersistOptions as PersistOptionsV3, StateStorage} from 'zustand/middleware';
import {IDBPDatabase, openDB} from 'idb';

const DB_NAME = 'zustand-db';
const STORE_NAME = 'keyval-store';

const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

let dbPromise: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
    if (!dbPromise) {
        dbPromise = await openDB(DB_NAME, 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
}

const idbRealStorageAdapter: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            const db = await getDb();
            const value = await db.get(STORE_NAME, name);
            if (typeof value === 'string') {
                return value;
            }
            return null;
        } catch (error) {
            console.error(`[idbStorageAdapter] Failed to get item "${name}":`, error);
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            const db = await getDb();
            await db.put(STORE_NAME, value, name);
        } catch (error) {
            console.error(`[idbStorageAdapter] Failed to set item "${name}":`, error);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            const db = await getDb();
            await db.delete(STORE_NAME, name);
        } catch (error) {
            console.error(`[idbStorageAdapter] Failed to remove item "${name}":`, error);
        }
    },
};

const ssrDummyStorageAdapter: StateStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
};

const storageAdapter = isBrowser ? idbRealStorageAdapter : ssrDummyStorageAdapter;

function replacer(key: string, value: any): any {
    if (value instanceof Float32Array) {
        return {
            __type: 'Float32Array',
            data: Array.from(value),
        };
    }
    return value;
}

function reviver(key: string, value: any): any {
    if (typeof value === 'object' && value !== null && value.__type === 'Float32Array' && Array.isArray(value.data)) {
        return new Float32Array(value.data);
    }
    return value;
}

declare type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
declare type StorageValue<S> = { state: DeepPartial<S>; version?: number };

type StoreInitializer<T extends object> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

interface CreateHydrationSafeStoreOptions<T> {
    persistOptions?: Omit<PersistOptionsV3<T>, 'name' | 'serialize' | 'deserialize' | 'getStorage'>;
}

export function createHydrationSafeStore<T extends object>(
    name: string,
    initializer: StoreInitializer<T>,
    options?: CreateHydrationSafeStoreOptions<T>
) {

    const serialize = (storageValue: StorageValue<T>): string => {
        try {
            return JSON.stringify(storageValue, replacer);
        } catch (error) {
            console.error(`[zustand persist] Error serializing state for "${name}":`, error);
            throw error;
        }
    };

    const deserialize = (persistedString: string): StorageValue<Partial<T>> => {
        if (!persistedString) {
            throw new Error(`[zustand persist] Received empty/null string for deserialization for "${name}"`);
        }
        try {
            const parsedValue = JSON.parse(persistedString, reviver);
            if (typeof parsedValue === 'object' && parsedValue !== null && 'state' in parsedValue) {
                return parsedValue as StorageValue<Partial<T>>;
            }
            throw new Error(`[zustand persist] Invalid data structure after parsing for "${name}". Missing "state" property.`);
        } catch (error) {
            console.error(`[zustand persist] Error deserializing state for "${name}":`, error);
            throw error;
        }
    };

    const finalPersistOptions: PersistOptionsV3<T> = {
        name: name,
        serialize: serialize,
        deserialize: deserialize,
        getStorage: () => storageAdapter, // Use the conditionally selected adapter
        ...(options?.persistOptions ?? {}),
    };

    const useStoreBase = create<T>(
        devtools(
            persist(
                initializer,
                finalPersistOptions
            )
        )
    );


    const useWrappedStore = <F>(
        selector: (state: T) => F,
        equalityFn?: (a: F, b: F) => boolean
    ): F | undefined => {
        const stateSlice = useStoreBase(selector, equalityFn);
        const [hydratedState, setHydratedState] = useState<F | undefined>(undefined);
        useEffect(() => {
            setHydratedState(stateSlice);
        }, [stateSlice]);
        return hydratedState;
    };

    useWrappedStore.getState = useStoreBase.getState;
    useWrappedStore.setState = useStoreBase.setState;
    useWrappedStore.subscribe = useStoreBase.subscribe;

    const baseStoreWithDestroy = useStoreBase as StoreApi<T> & { destroy?: () => void };
    type FinalHookType = typeof useWrappedStore & {
        getState: typeof useStoreBase.getState;
        setState: typeof useStoreBase.setState;
        subscribe: typeof useStoreBase.subscribe;
        destroy?: () => void;
    };
    const finalHook = useWrappedStore as FinalHookType;
    if (baseStoreWithDestroy.destroy) {
        finalHook.destroy = baseStoreWithDestroy.destroy;
    }

    return finalHook;
}