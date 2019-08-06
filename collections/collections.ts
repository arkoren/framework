/**
 * Helper to create a new collection.
 *
 * @export
 * @template T
 * @param {(Collection<T> | T[])} [data]
 * @returns {Collection<T>}
 */
export function collect<T>(data?: Collection<T> | T[]): Collection<T> {
    return new Collection(data)
}

/**
 * Collection class.
 *
 * @export
 * @class Collection
 * @implements {Iterable<T>}
 * @template T
 */
export class Collection<T> implements Iterable<T> {

    /**
     * Stores the collection data.
     *
     * @protected
     * @type {T[]}
     * @memberof Collection
     */
    protected data: T[]

    /**
     * Collection iterator.
     *
     * @returns {Iterator<string>}
     * @memberof Collection
     */
    *[Symbol.iterator](): Iterator<T> {
        for (const element of this.data) {
            yield element;
        }
    }

    /**
     * Creates an instance of Collection.
     *
     * @param {(Collection<T> | T[])} [data]
     * @memberof Collection
     */
    constructor(data?: Collection<T> | T[]) {
        if (!data) {
            this.data = []
        } else if (data instanceof Collection) {
            this.data = [...data.data]
        } else {
            this.data = data
        }
    }

    /**
     * The all method returns the underlying array represented by the collection.
     *
     * @returns {T[]}
     * @memberof Collection
     */
    all(): T[] {
        return this.data
    }

    /**
     * Alias for the avg method.
     *
     * @param {(string | ((item: T) => number))} [callback]
     * @returns {number}
     * @memberof Collection
     */
    average(callback?: string | ((item: T) => number)): number {
        return this.avg(callback)
    }

    /**
     * The avg method returns the average value of a given key.
     *
     * @param {(item: T) => number} [callback]
     * @returns {number}
     * @memberof Collection
     */
    avg(callback?: string | ((item: T) => number)): number {
        const length = this.count()
        if (length == 0) {
            return 0
        }
        return this.sum(callback) / length
    }

    /**
     * Counts the element of the collection.
     *
     * @returns {number}
     * @memberof Collection
     */
    count(): number {
        return this.data.length
    }

    /**
     * The chunk method breaks the collection into multiple,
     * smaller collections of a given size.
     *
     * @param {number} size
     * @returns {Collection<Collection<T>>}
     * @memberof Collection
     */
    chunk(size: number): Collection<Collection<T>> {
        const result = new Collection<Collection<T>>()
        const length = this.count()
        const total = Math.ceil(length / size)
        for (let i = 0; i < total; i++) {
            const inner = new Collection<T>()
            for (let k = 0; k < size; k++) {
                if ((i * size) + k < length) {
                    inner.push(this.data[(i * size) + k])
                }
            }
            result.push(inner)
        }
        return result
    }

    /**
     * The collapse method collapses a collection of arrays into a single, flat collection.
     *
     * @returns {Collection<T>}
     * @memberof Collection
     */
    collapse<K>(): Collection<K> {
        const result = new Collection<K>()
        if (this.count() > 0) {
            for (const item of this) {
                if (Array.isArray(item) || item instanceof Collection) {
                    for (const element of item) {
                        result.push(element)
                    }
                }
            }
            return result
        }
        return result
    }

    /**
     * The filter method filters the collection using the given callback,
     * keeping only those items that pass a given truth test.
     * If no callback is supplied, all entries of the collection that
     * are equivalent to false will be removed:
     *
     * @param {(value: T, key?: number) => boolean} [callback]
     * @returns {Collection<T>}
     * @memberof Collection
     */
    filter(callback?: (value: T, key?: number) => boolean): Collection<T> {
        const result = new Collection<T>()
        for (let i = 0; i < this.count(); i++) {
            if (callback) {
                if (callback(this.data[i], i)) {
                    result.push(this.data[i])
                }
            } else if (this.data[i]) {
                result.push(this.data[i])
            }
        }
        return result
    }

    /**
     * The first method returns the first element in the collection
     * that passes a given truth test. You may also call the first method
     * with no arguments to get the first element in the collection.
     * If the collection is empty, undefined is returned.
     *
     * @param {(value: T, index?: number) => boolean} [callback]
     * @returns {(T | undefined)}
     * @memberof Collection
     */
    first(callback?: (value: T, index?: number) => boolean): T | undefined {
        if (this.count() > 0) {
            if (!callback) {
                return this.data[0]
            }
            for (let i = 0; i < this.count(); i++) {
                if (callback(this.data[i], i)) {
                    return this.data[i]
                }
            }
        }
        return undefined
    }

    /**
     * The firstWhere method returns the first element in the
     * collection with the given key / value pair.
     *
     * @param {string} key
     * @param {*} value
     * @returns {(T | undefined)}
     * @memberof Collection
     */
    firstWhere(key: string, value: any): T | undefined {
        return this.first(v => {
            if (typeof v === 'object') {
                return (v as { [key: string]: any })[key] == value
            }
            return false
        })
    }

    /**
     * The implode method joins the items in a collection. Its arguments
     * depend on the type of items in the collection. If the collection
     * contains arrays or objects, you should pass the key of the attributes
     * you wish to join, and the "glue" string you wish to place between the values.
     * If the collection contains simple strings or numeric values, pass the
     * "keyOrSeparator" as the only argument to the method:
     *
     * @param {string} keyOrSeparator
     * @param {string} [separator]
     * @returns {string}
     * @memberof Collection
     */
    implode(keyOrSeparator: string, separator?: string): string {
        let result: string = ''
        for (const item of this.data) {
            if (typeof item === 'object' && separator) {
                result += `${(item as { [key: string]: any })[keyOrSeparator]}${separator}`
            } else {
                result += `${item}${keyOrSeparator}`
            }
        }
        return result
    }

    /**
     * The isEmpty method returns true if the collection is empty;
     * otherwise, false is returned.
     *
     * @returns {boolean}
     * @memberof Collection
     */
    isEmpty(): boolean {
        return this.count() == 0
    }

    /**
     * The isNotEmpty method returns true if the collection is not empty;
     * otherwise, false is returned.
     *
     * @returns {boolean}
     * @memberof Collection
     */
    isNotEmpty(): boolean {
        return !this.isEmpty()
    }

    /**
     * The join method joins the collection's values with a string.
     *
     * @param {string} [separator='']
     * @returns {string}
     * @memberof Collection
     */
    join(separator: string = ''): string {
        let result: string = ''
        for (const item of this.data) {
            result += `${item}${separator}`
        }
        return result
    }

    /**
     * The last method returns the last element in the collection
     * that passes a given truth test.
     *
     * @param {(value: T, index: number) => boolean} [callback]
     * @returns {(T | undefined)}
     * @memberof Collection
     */
    last(callback?: (value: T, index: number) => boolean): T | undefined {
        let last = undefined
        if (this.count() > 0) {
            if (!callback) {
                return this.data[0]
            }
            for (let i = 0; i < this.count(); i++) {
                if (callback(this.data[i], i)) {
                    last = this.data[i]
                }
            }
        }
        return last
    }

    /**
     * The reduce method reduces the collection to a single value, passing the result
     * of each iteration into the subsequent iteration.
     *
     * @template K
     * @param {(carry: K, item: T) => K} callback
     * @param {K} initial
     * @returns {K}
     * @memberof Collection
     */
    reduce<K>(callback: (carry: K, item: T) => K, initial: K): K {
        for (const element of this) {
            initial = callback(initial, element)
        }
        return initial
    }

    /**
     * The map method iterates through the collection and passes each value to the given callback.
     * The callback is free to modify the item and return it, thus forming a new collection of modified items.
     *
     * @template K
     * @param {(item: T) => K} callback
     * @returns {Collection<K>}
     * @memberof Collection
     */
    map<K>(callback: (item: T) => K): Collection<K> {
        const collection = new Collection<K>()
        for (const item of this.data) {
            collection.push(callback(item))
        }
        return collection
    }

    /**
     * The push method appends an item to the end of the collection.
     *
     * @param {T} element
     * @returns {Collection<T>}
     * @memberof Collection
     */
    push(element: T): this {
        this.data.push(element)
        return this
    }

    /**
     * The pop method removes and returns the last item from the collection.
     *
     * @returns {(T | undefined)}
     * @memberof Collection
     */
    pop(): T | undefined {
        const value = this.data.pop()
        return value
    }

    /**
     * The sum method returns the sum of all items in the collection.
     *
     * @param {(item: T) => number} callback
     * @returns {number}
     * @memberof Collection
     */
    sum(callback?: string | ((item: T) => number)): number {
        let result = 0
        if (this.count() > 0) {
            for (const item of this.data) {
                if (typeof item === 'number') {
                    result += item
                } else if (typeof item === 'object' && typeof callback === 'string') {
                    result += (item as { [param: string]: any })[callback]
                } else if (typeof callback === 'function') {
                    result += callback(item)
                }
            }
        }
        return result
    }

    /**
     * Returns the result as a plain TS array.
     *
     * @returns {T[]}
     * @memberof Collection
     */
    toArray(): any[] {
        return this
            .map(item => item instanceof Collection ? item.toArray() : item)
            .all()
    }

    /**
     * The transform method iterates over the collection and calls the given
     * callback with each item in the collection. The items in the collection
     * will be replaced by the values returned by the callback.
     *
     * @param {(item: T) => T} callback
     * @returns {Collection<T>}
     * @memberof Collection
     */
    transform(callback: (item: T) => T): this {
        for (let i = 0; i < this.count(); i++) {
            this.data[i] = callback(this.data[i])
        }
        return this
    }

}
