import { Status } from './status.ts'

export abstract class HTTPError extends Error {

    /**
     * Stores the HTTP status code of the error.
     *
     * @abstract
     * @type {Status}
     * @memberof HTTPError
     */
    public abstract status: Status

    /**
     * Stores the error description.
     *
     * @abstract
     * @type {string}
     * @memberof HTTPError
     */
    public abstract description: string

    /**
     * Creates an instance of HTTPError.
     *
     * @param {string} [description='Internal Server Error']
     * @param {Status} [status=500]
     * @memberof HTTPError
     */
    constructor(description: string = 'Internal Server Error', status: Status = 500) {
        super(description)
        // Object.setPrototypeOf(this, HTTPError.prototype)
    }

}

/**
 * Not found HTTP error.
 *
 * @class NotFound
 * @extends {Error}
 */
export class NotFound extends Error {

    /**
     * Stores the HTTP status code of the error.
     *
     * @type {Status}
     * @memberof NotFound
     */
    public status: Status = 404

    /**
     * Stores the error description.
     *
     * @abstract
     * @type {string}
     * @memberof HTTPError
     */
    public description: string = 'Not Found'

}

/**
 * Not found HTTP error.
 *
 * @class ValidationFail
 * @extends {Error}
 */
export class ValidationFail extends Error {

    /**
     * Stores the HTTP status code of the error.
     *
     * @type {Status}
     * @memberof ValidationFail
     */
    public status: Status = 422

    /**
     * Stores the error description.
     *
     * @abstract
     * @type {string}
     * @memberof HTTPError
     */
    public description: string = 'Unprocessable Entity'

}
