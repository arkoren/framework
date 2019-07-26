/**
 * Not found HTTP error.
 *
 * @class NotFound
 * @extends {Error}
 */
export class NotFound extends Error {

    /**
     * Creates an instance of NotFound.
     *
     * @param {string} message
     * @memberof NotFound
     */
    constructor(message: string = '404 - Not Found') {
        super(message)
        Object.setPrototypeOf(this, NotFound.prototype)
    }

}
