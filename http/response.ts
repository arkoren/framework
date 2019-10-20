import { Status } from './status.ts'
// export { Status } from '../deno.ts'

/**
 * Helper to create a new HTTP response.
 *
 * @export
 * @param {Response} res
 * @param {Status} [status=Status.OK]
 * @returns {HTTPResponse}
 */
export function response(res: Response, status: Status = Status.OK): HTTPResponse {
    if (res instanceof HTTPResponse) {
        return res
    }
    let response: HTTPResponse
    switch (typeof res) {
        case 'string': {
            response = new HTTPResponse(status, new TextEncoder().encode(res))
            response.header('Content-Type', 'text/html')
            break
        }
        default: {
            response = new HTTPResponse(status, new TextEncoder().encode(JSON.stringify(res)))
            response.header('Content-Type', 'application/json')
            break
        }
    }
    return response
}

/**
 * Represents an HTTP Response.
 *
 * @export
 * @class HTTPResponse
 */
export class HTTPResponse {

    /**
     * Represents the response HTTP version.
     *
     * @protected
     * @type {number}
     * @memberof HTTPResponse
     */
    protected version: number

    /**
     * Represents the response status code.
     *
     * @protected
     * @type {Status}
     * @memberof HTTPResponse
     */
    protected http_status: Status

    /**
     * Represents the response headers.
     *
     * @protected
     * @type {Headers}
     * @memberof HTTPResponse
     */
    protected headers: Headers

    /**
     * Represents the response body.
     *
     * @protected
     * @type {Uint8Array}
     * @memberof HTTPResponse
     */
    protected body: Uint8Array

    /**
     * Creates an instance of HTTPResponse.
     *
     * @param {Status} status
     * @param {string} [body='']
     * @param {Header[]} [headers=[]]
     * @param {number} [version=1.1]
     * @memberof HTTPResponse
     */
    constructor(status: Status, body: Uint8Array = new Uint8Array, headers: Headers = new Headers, version: number = 1.1) {
        this.http_status = status
        this.body = body
        this.headers = headers
        this.version = version
    }

    /**
     * Set a header on the Response.
     *
     * @param {string} key
     * @param {string} value
     * @param {boolean} [replace=true]
     * @returns {this}
     * @memberof HTTPResponse
     */
    header(key: string, value: string, replace: boolean = true): this {
        const header = this.headers.get(key)
        if (!header || (header && replace)) {
            this.headers.set(key, value)
        }
        return this
    }

    /**
     * Get the raw HTTP headers.
     *
     * @returns {Headers}
     * @memberof HTTPResponse
     */
    getHeaders(): Headers {
        return this.headers
    }

    /**
     * Get the content of the response.
     *
     * @returns {Uint8Array}
     * @memberof HTTPResponse
     */
    content(): Uint8Array {
        return this.body
    }

    /**
     * Returns the HTTP status code of the response.
     *
     * @returns {Status}
     * @memberof HTTPResponse
     */
    status(): Status {
        return this.http_status
    }

}

/**
 * A response may be either an Http respose, or a string or an object.
 *
 * @export
 * @type {Response}
 */
export type Response = string | { [key: string]: any } | HTTPResponse

/**
 * A possible http response.
 *
 * @export
 * @type {Response}
 */
export type PossibleResponse = Response | void
