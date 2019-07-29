/**
 * Represents an HTTP request method.
 *
 * @export
 * @enum {string}
 */
export enum Method {

    // The GET method requests a representation of the specified resource.
    // Requests using GET should only retrieve data.
    Get = 'GET',
    // The HEAD method asks for a response identical to that of a GET request,
    // but without the response body.
    Head = 'HEAD',
    // The POST method is used to submit an entity to the specified resource,
    // often causing a change in state or side effects on the server.
    Post = 'POST',
    // The PUT method replaces all current representations of the target resource
    // with the request payload.
    Put = 'PUT',
    // The DELETE method deletes the specified resource.
    Delete = 'DELETE',
    // The CONNECT method establishes a tunnel to the server identified by
    // the target resource.
    Connect = 'CONNECT',
    // The OPTIONS method is used to describe the communication options
    // for the target resource.
    Options = 'OPTIONS',
    // The TRACE method performs a message loop-back test along the path
    // to the target resource.
    Trace = 'TRACE',
    // The PATCH method is used to apply partial modifications to a resource.
    Patch = 'PATCH'

}

/**
 * Represents an HTTP request.
 *
 * @export
 * @class HTTPRequest
 */
export class HTTPRequest {

    /**
     * Represents the request HTTP version.
     *
     * @type {number}
     * @memberof HTTPRequest
     */
    version: number

    /**
     * Represents the request method.
     *
     * @type {Method}
     * @memberof HTTPRequest
     */
    method: Method

    /**
     * Represents the request URL.
     *
     * @type {string}
     * @memberof HTTPRequest
     */
    URI: string

    /**
     * Represents the request headers.
     *
     * @type {Header}
     * @memberof HTTPRequest
     */
    headers: Headers

    /**
     * Represents the request body.
     *
     * @type {Uint8Array}
     * @memberof HTTPRequest
     */
    body: Uint8Array

    /**
     * Creates an instance of HTTPRequest.
     *
     * @param {Method} method
     * @param {string} URI
     * @param {Uint8Array} [body]
     * @param {Headers} [headers]
     * @param {number} [version=1.1]
     * @memberof HTTPRequest
     */
    constructor(
        method: Method,
        URI: string,
        body: Uint8Array = new Uint8Array,
        headers: Headers = new Headers,
        version: number = 1.1
    ) {
        this.method = method
        this.URI = URI
        this.body = body
        this.headers = headers
        this.version = version
    }

}

/**
 * A request is represented by an HTTPRequest class.
 *
 * @export
 * @type {Request}
 */
export type Request = HTTPRequest
