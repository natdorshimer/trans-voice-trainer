/**
 * Implements a fixed-size circular buffer (Ring Buffer) using a single array.
 * Provides array-like access with push and get(index).
 * When the buffer is full and push is called, the oldest element is overwritten.
 * get(index) accesses elements relative to the oldest element (logical index 0).
 * @template T The type of elements stored in the buffer.
 */
export class CircularBuffer<T> {
    /** The maximum number of elements the buffer can hold. */
    public readonly maxSize: number;
    private readonly buffer: (T | undefined)[]; // Underlying storage, allows undefined for empty slots
    private head: number = 0; // Index of the logical start (oldest element, index 0)
    private tail: number = 0; // Index where the next element will be inserted
    private currentSize: number = 0; // Number of elements currently in the buffer

    /**
     * @param {number} maxSize The maximum number of elements the buffer can hold. Must be a positive integer.
     */
    constructor(maxSize: number) {
        if (typeof maxSize !== 'number' || maxSize <= 0 || !Number.isInteger(maxSize)) {
            throw new Error("maxSize must be a positive integer.");
        }
        this.maxSize = maxSize;
        // Initialize buffer with undefined placeholders
        this.buffer = new Array<T | undefined>(this.maxSize).fill(undefined);
    }

    /**
     * Adds a value to the end of the logical buffer.
     * If the buffer is full, the oldest element (at logical index 0) is overwritten.
     * @param {T} value The value to add.
     * @returns {boolean} Always returns true as overwrite is allowed.
     */
    public pushInner(value: T): boolean {
        // Place the new value at the current tail position
        this.buffer[this.tail] = value;

        // Check if the buffer was already full *before* this insertion
        const wasFull = this.isFull();

        // Advance the tail pointer, wrapping around if necessary
        this.tail = (this.tail + 1) % this.maxSize;

        if (wasFull) {
            // If it was full, the head also moves forward because we overwrote the oldest element
            this.head = (this.head + 1) % this.maxSize;
        } else {
            // If it wasn't full, just increase the size
            this.currentSize++;
        }

        return true; // Indicate successful push
    }

    public push(...items: T[]) {
        items.forEach(val => this.pushInner(val));
    }

    /**
     * Retrieves the element at the specified logical index.
     * Index 0 is the oldest element currently in the buffer.
     * Index size-1 is the newest element.
     * Does not modify the buffer.
     * @param {number} index The logical index (0 to size-1).
     * @returns {T | undefined} The element at the index, or undefined if the index is invalid or out of bounds.
     */
    public get(index: number): T | undefined {
        // Validate index bounds (Type check less necessary due to TS signature)
        if (!Number.isInteger(index) || index < 0 || index >= this.currentSize) {
            // console.warn(`Index ${index} out of bounds (current size: ${this.currentSize})`);
            return undefined; // Index out of bounds or not an integer
        }

        // Calculate the physical index in the underlying array
        // It's the head position + logical index, wrapped around by maxSize
        const physicalIndex = (this.head + index) % this.maxSize;

        // Return the value (might be undefined if cleared, but typically T)
        return this.buffer[physicalIndex];
    }

    // --- Standard Helper Methods ---

    /**
     * Returns the current number of elements in the buffer.
     * @returns {number}
     */
    public size(): number {
        return this.currentSize;
    }

    /**
     * Returns the maximum capacity of the buffer.
     * @returns {number}
     */
    public capacity(): number {
        return this.maxSize;
    }

    /**
     * Checks if the buffer is full.
     * @returns {boolean}
     */
    public isFull(): boolean {
        return this.currentSize === this.maxSize;
    }

    /**
     * Checks if the buffer is empty.
     * @returns {boolean}
     */
    public isEmpty(): boolean {
        return this.currentSize === 0;
    }

    /**
     * Returns the logical contents of the buffer as a standard array,
     * ordered from oldest (index 0) to newest (index size-1).
     * Filters out potential undefined slots if any exist internally, though
     * typical usage ensures only T values are present in the logical view.
     * @returns {T[]}
     */
    public toArray(): T[] {
        const result: T[] = [];
        for (let i = 0; i < this.currentSize; i++) {
            const physicalIndex = (this.head + i) % this.maxSize;
            const value = this.buffer[physicalIndex];
            // Ensure we only push defined values of type T
            // This check is robust, though `get` logic implies these slots are populated.
            if (value !== undefined) {
                result.push(value);
            }
        }
        return result;
    }


    /**
     * Clears the buffer, resetting its state.
     * @returns {void}
     */
    public clear(): void {
        // Filling with undefined is good practice in TS
        this.buffer.fill(undefined);
        this.head = 0;
        this.tail = 0;
        this.currentSize = 0;
    }

    // --- Iteration & Array-like Methods ---

    /**
     * Returns an iterator for the logical elements in the buffer (oldest to newest).
     * Allows using `for...of` loops and spread syntax (`...`).
     */
    public* [Symbol.iterator](): IterableIterator<T> {
        for (let i = 0; i < this.currentSize; i++) {
            // We know elements from 0 to currentSize-1 are valid via get()
            yield this.get(i) as T;
        }
    }

    /**
     * Executes a provided function once for each element in the logical buffer order.
     * @param callbackfn Function to execute for each element.
     * @param thisArg Value to use as `this` when executing callbackfn.
     */
    public forEach(callbackfn: (value: T, index: number, buffer: this) => void, thisArg?: any): void {
        let logicalIndex = 0;
        for (const value of this) {
            callbackfn.call(thisArg, value, logicalIndex, this);
            logicalIndex++;
        }
    }

    /**
     * Creates a new array populated with the results of calling a provided function
     * on every element in the logical buffer order.
     * @template U The type of the elements in the new array.
     * @param callbackfn Function that produces an element of the new array.
     * @param thisArg Value to use as `this` when executing callbackfn.
     * @returns {U[]} A new array with each element being the result of the callback function.
     */
    public map<U>(callbackfn: (value: T, index: number, buffer: this) => U, thisArg?: any): U[] {
        const result: U[] = [];
        let logicalIndex = 0;
        for (const value of this) {
            result.push(callbackfn.call(thisArg, value, logicalIndex, this));
            logicalIndex++;
        }
        return result;
    }

    /**
     * Creates a new array with all elements that pass the test implemented by the
     * provided function. Iterates in logical buffer order.
     * @param predicate Function to test each element. Return true to keep the element.
     * @param thisArg Value to use as `this` when executing predicate.
     * @returns {T[]} A new array with the elements that pass the test.
     */
    public filter(predicate: (value: T, index: number, buffer: this) => unknown, thisArg?: any): T[] {
        const result: T[] = [];
        let logicalIndex = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, logicalIndex, this)) {
                result.push(value);
            }
            logicalIndex++;
        }
        return result;
    }

    /**
     * Executes a reducer function on each element of the buffer (in logical order),
     * resulting in single output value.
     * @template U The type of the accumulated value.
     * @param callbackfn Function to execute on each element.
     * @param initialValue Value to use as the first argument to the first call of the callbackfn.
     * @returns {U} The value that results from the reduction.
     */
    public reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, buffer: this) => U, initialValue: U): U;
    public reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, buffer: this) => T, initialValue?: T): T; // Overload for T
    public reduce<U>(callbackfn: (previousValue: U | T, currentValue: T, currentIndex: number, buffer: this) => U | T, initialValue?: U | T): U | T {
        let accumulator: U | T;
        let startIndex = 0;

        if (arguments.length < 2) {
            // Requires initial value if buffer is empty or no T->T overload used safely
            if (this.isEmpty()) {
                throw new TypeError('Reduce of empty buffer with no initial value');
            }
            accumulator = this.get(0) as T; // First element as initial value
            startIndex = 1; // Start iteration from the second element
        } else {
            accumulator = initialValue as U | T;
        }

        for (let i = startIndex; i < this.currentSize; i++) {
            const currentValue = this.get(i) as T;
            accumulator = callbackfn(accumulator, currentValue, i, this);
        }

        return accumulator;
    }


    /**
     * Checks if at least one element in the logical buffer passes the test implemented
     * by the provided function.
     * @param predicate Function to test for each element.
     * @param thisArg Value to use as `this` when executing predicate.
     * @returns {boolean} True if the callback function returns a truthy value for any element.
     */
    public some(predicate: (value: T, index: number, buffer: this) => unknown, thisArg?: any): boolean {
        let logicalIndex = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, logicalIndex, this)) {
                return true;
            }
            logicalIndex++;
        }
        return false;
    }

    /**
     * Checks if all elements in the logical buffer pass the test implemented by the
     * provided function.
     * @param predicate Function to test for each element.
     * @param thisArg Value to use as `this` when executing predicate.
     * @returns {boolean} True if the callback function returns a truthy value for every element.
     */
    public every(predicate: (value: T, index: number, buffer: this) => unknown, thisArg?: any): boolean {
        let logicalIndex = 0;
        for (const value of this) {
            if (!predicate.call(thisArg, value, logicalIndex, this)) {
                return false;
            }
            logicalIndex++;
        }
        return true;
    }

    /**
     * Returns the first element in the logical buffer that satisfies the provided
     * testing function.
     * @param predicate Function to execute on each value.
     * @param thisArg Value to use as `this` when executing predicate.
     * @returns {T | undefined} The first element that satisfies the condition, or undefined.
     */
    public find(predicate: (value: T, index: number, buffer: this) => unknown, thisArg?: any): T | undefined {
        let logicalIndex = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, logicalIndex, this)) {
                return value;
            }
            logicalIndex++;
        }
        return undefined;
    }

    /**
     * Returns the index of the first element in the logical buffer that satisfies the
     * provided testing function. Otherwise, it returns -1.
     * @param predicate Function to execute on each value.
     * @param thisArg Value to use as `this` when executing predicate.
     * @returns {number} The logical index of the first element passing the test, or -1.
     */
    public findIndex(predicate: (value: T, index: number, buffer: this) => unknown, thisArg?: any): number {
        let logicalIndex = 0;
        for (const value of this) {
            if (predicate.call(thisArg, value, logicalIndex, this)) {
                return logicalIndex;
            }
            logicalIndex++;
        }
        return -1;
    }

    /**
     * For debugging: Logs the internal state to the console.
     * @returns {void}
     */
    public _internalState(): void {
        console.log(`--- Internal State ---`);
        console.log(`MaxSize:      ${this.maxSize}`);
        console.log(`Current Size: ${this.currentSize}`);
        console.log(`Head Index:   ${this.head}`);
        console.log(`Tail Index:   ${this.tail}`);
        const bufferStr = this.buffer.map((val, i) => {
            const v = val === undefined ? 'u' : JSON.stringify(val);
            if (this.currentSize > 0 && i === this.head) return `[${v} H]`;
            if (this.currentSize === 0 && i === this.head && i === this.tail) return `[${v} H T]`;
            return `${v}`;
        }).join(', ');
        console.log(`Buffer:       ${bufferStr}`);
        console.log(`Logical View: [${this.toArray().map(v => JSON.stringify(v)).join(', ')}]`);
        console.log(`----------------------`);
    }
}