import { Status } from './status.ts'

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
            response.headers.set('Content-Type', 'text/html')
            break
        }
        default: {
            response = new HTTPResponse(status, new TextEncoder().encode(JSON.stringify(res)))
            response.headers.set('Content-Type', 'application/json')
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
     * @type {number}
     * @memberof HTTPResponse
     */
    version: number

    /**
     * Represents the response status code.
     *
     * @type {Status}
     * @memberof HTTPResponse
     */
    status: Status

    /**
     * Represents the response headers.
     *
     * @type {Headers}
     * @memberof HTTPResponse
     */
    headers: Headers

    /**
     * Represents the response body.
     *
     * @type {Uint8Array}
     * @memberof HTTPResponse
     */
    body: Uint8Array

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
        this.status = status
        this.body = body
        this.headers = headers
        this.version = version
    }

}

/**
 * A response may be either an Http respose, or a string or an object.
 *
 * @export
 * @type {Response}
 */
export type Response = string | object | HTTPResponse
