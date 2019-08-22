import { Status } from './status.ts'

export class HTTPError extends Error {

    /**
     * Stores the HTTP status code of the error.
     *
     * @type {Status}
     * @memberof HTTPError
     */
    public status: Status = 500

    /**
     * Stores the error description.
     *
     * @type {string}
     * @memberof HTTPError
     */
    public description: string = 'Internal Server Error'

    /**
     * Stores additional error information.
     *
     * @type {{ [key: string]: any }}
     * @memberof HTTPError
     */
    public additional: { [key: string]: any }

    /**
     * Creates an instance of HTTPError.
     *
     * @param {{ [key: string]: any }} additional
     * @memberof HTTPError
     */
    constructor(additional: { [key: string]: any } = {}) {
        super()
        this.message = this.description
        this.additional = additional
    }

}

/**
 * Not found HTTP error.
 *
 * @class NotFound
 * @extends {Error}
 */
export class NotFound extends HTTPError {

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
export class ValidationFail extends HTTPError {

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
