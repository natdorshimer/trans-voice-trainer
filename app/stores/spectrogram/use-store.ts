import {useEffect, useState} from 'react';
import create, {GetState, SetState, StoreApi} from 'zustand';
import {devtools, persist, PersistOptions as PersistOptionsV3, StateStorage} from 'zustand/middleware';

type StoreInitializer<T extends object> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

interface CreateHydrationSafeStoreOptions<T> {
    persistOptions?: Omit<PersistOptionsV3<T>, 'name' | 'serialize' | 'deserialize' | 'getStorage'>;
    getStorage?: () => StateStorage;
}

declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

declare type StorageValue<S> = {
    state: DeepPartial<S>;
    version?: number;
};

function replacer(key: string, value: any): any {
    if (value instanceof Float32Array) {
        return {
            __type: 'Float32Array',
            data: Array.from(value),
        };
    }
    // Add other type checks if needed (Int8Array, Map, etc.)
    return value;
}

function reviver(key: string, value: any): any {
    if (typeof value === 'object' && value !== null && value.__type === 'Float32Array' && Array.isArray(value.data)) {
        return new Float32Array(value.data);
    }
    // Add other type checks if needed
    return value;
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

    const deserialize = (persistedString: string): StorageValue<Partial<T>> => { // Assuming T is your AnalyzedResultStore type
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
        getStorage: options?.getStorage ?? (() => localStorage),
        ...(options?.persistOptions ?? {}),
    };

    const useStoreBase = create<T>(
        devtools(
            persist(
                initializer,
                finalPersistOptions
            ),
            {
                name: name
            }
        )
    );

    // --- Hydration-safe hook wrapper (Unaffected) ---
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

    type FinalHookType = typeof useWrappedStore & { destroy?: () => void; };
    return useWrappedStore as FinalHookType;
}
