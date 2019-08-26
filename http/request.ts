import { ValidationFail } from './errors.ts'
import { Validator } from './validator.ts'
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
 * An HTTP parameter name.
 *
 * @export
 * @type {HTTPParamName}
 */
export type HTTPParamName = string

/**
 * An HTTP parameter value.
 *
 * @export
 * @type {HTTPParamValue}
 */
export type HTTPParamValue = string | null

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
     * @protected
     * @type {number}
     * @memberof HTTPRequest
     */
    protected version: number

    /**
     * Represents the request method.
     *
     * @protected
     * @type {Method}
     * @memberof HTTPRequest
     */
    protected http_method: Method

    /**
     * Represents the request URL.
     *
     * @protected
     * @type {URL}
     * @memberof HTTPRequest
     */
    protected url: URL

    /**
     * Represents the request headers.
     *
     * @protected
     * @type {Header}
     * @memberof HTTPRequest
     */
    protected headers: Headers

    /**
     * Represents the request body.
     *
     * @protected
     * @type {Uint8Array}
     * @memberof HTTPRequest
     */
    protected body: Uint8Array

    /**
     * Input parameters.
     *
     * @protected
     * @type {{ [key: string]: string }}
     * @memberof HTTPRequest
     */
    protected input_params: { [key: string]: HTTPParamValue } = {}

    /**
     * Query parameters.
     *
     * @protected
     * @type {{ [key: string]: string }}
     * @memberof HTTPRequest
     */
    protected query_params: { [key: string]: HTTPParamValue } = {}

    /**
     * Creates an instance of HTTPRequest.
     *
     * @param {Method} method
     * @param {URL} url
     * @param {Uint8Array} [body=new Uint8Array]
     * @param {Headers} [headers=new Headers]
     * @param {number} [version=1.1]
     * @memberof HTTPRequest
     */
    constructor(
        method: Method,
        url: URL,
        body: Uint8Array = new Uint8Array,
        headers: Headers = new Headers,
        version: number = 1.1
    ) {
        this.http_method = method
        this.url = url
        this.body = body
        this.headers = headers
        this.version = version
        this.url.searchParams
        for (const [ name, value ] of this.url.searchParams.entries()) {
            this.query_params[name] = value
        }
        if (this.isForm()) {
            const form_params = new URLSearchParams(new TextDecoder().decode(this.body))
            for (const [ name, value ] of form_params.entries()) {
                this.input_params[name] = value
            }
        }
    }

    /**
     * Determine if the request is sending form data.
     *
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    isForm(): boolean {
        const [ header ] = this.header('Content-Type')
        return header.includes('application/x-www-form-urlencoded')
    }

    /**
     * Determine if the request is sending JSON.
     *
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    isJson(): boolean {
        const [ header ] = this.header('Content-Type')
        return header.includes('application/json')
            || header.includes('application/ld+json')
    }

    /**
     * Determine if the current request accepts any content type.
     *
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    acceptsAnyContentType(): boolean {
        return this.accept('*/*', true)
            || this.accept('*' , true)
    }

    /**
     * Determines whether a request accepts JSON.
     *
     * @returns {boolean}
     * @memberof HTTPResponse
     */
    acceptsJson(): boolean {
        return this.accept('application/json')
            || this.accept('application/ld+json')
    }

    /**
     * Determines whether a request accepts HTML.
     *
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    acceptsHtml(): boolean {
        return this.accept('text/html')
    }

    /**
     * Returns true if the request accepts a given mime type.
     *
     * @param {string} type
     * @param {boolean} [strict=false]
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    accept(type: string, strict: boolean = false): boolean {
        const [ header ] = this.header('Accept')
        if (strict) {
            return header.includes(type)
        }
        return header.includes(type)
            || header.includes('*/*')
            || header.includes('*')
    }

    /**
     * Determine if a header is set on the request.
     *
     * @param {string} key
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    hasHeader(key: string): boolean {
        return this.headers.has(key)
    }

    /**
     * Determines if the request input data has a given
     * key or a list of keys.
     *
     * @param {(string | string[])} key
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    has(key: string | string[]): boolean {
        return [ ...typeof key === 'string' ? [ key ] : key ]
            .every(key =>
                this.input_params.hasOwnProperty(key)
                || this.query_params.hasOwnProperty(key)
            )
    }

    /**
     * Retrieve a header from the request.
     *
     * @param {string} [key]
     * @param {string} [def]
     * @returns {string[]}
     * @memberof HTTPRequest
     */
    header(key?: string, def?: string[]): string[] {
        if (!key) {
            const result: string[] = []
            for (const [ h ] of this.headers) {
                result.push(h)
            }
            return result
        }
        const header = this.headers.get(key)
        if (!header) {
            // Will be changed to a null coalescing operator when available.
            return def ? def : [ '' ]
        }
        return [ header ]
    }

    /**
     * Returns the HTTP methods used in the request.
     *
     * @returns {Method}
     * @memberof HTTPRequest
     */
    method(): Method {
        return this.http_method
    }

    /**
     * Determines if the request method matches a given one.
     *
     * @param {Method} input
     * @returns {boolean}
     * @memberof HTTPRequest
     */
    isMethod(input: Method): boolean {
        return this.method() === input
    }

    /**
     * Returns the
     *
     * @returns {string}
     * @memberof HTTPRequest
     */
    path(): string {
        return this.url.pathname
    }

    /**
     * Returns a query parameter of the HTTP request.
     *
     * @param {HTTPParamName} search
     * @returns {HTTPParamValue}
     * @memberof HTTPRequest
     */
    query(search: HTTPParamName): HTTPParamValue {
        return this.query_params.hasOwnProperty(search)
            ? this.query_params[search]
            : null
    }

    /**
     * Returns an input parameter from the HTTP request.
     *
     * @param {HTTPParamName} search
     * @returns {HTTPParamValue}
     * @memberof HTTPRequest
     */
    input(search: HTTPParamName): HTTPParamValue {
        return this.input_params.hasOwnProperty(search)
            ? this.input_params[search]
            : this.query(search)
    }

    /**
     * Transforms the request input fields and query string.
     *
     * @param {(name: HTTPParamName, value: HTTPParamValue) => HTTPParamValue} input_callback
     * @param {(name: HTTPParamName, value: HTTPParamValue) => HTTPParamValue} query_callback
     * @memberof HTTPRequest
     */
    transformInputAndQuery(
        input_callback: (name: HTTPParamName, value: HTTPParamValue) => HTTPParamValue,
        query_callback: (name: HTTPParamName, value: HTTPParamValue) => HTTPParamValue
    ) {
        for (const name in this.input_params) {
            this.input_params[name] = input_callback(name, this.input_params[name])
        }
        for (const name in this.query_params) {
            this.query_params[name] = input_callback(name, this.query_params[name])
        }
    }

    /**
     * Returns only the fields of the request input.
     *
     * @param {string[]} fields
     * @returns {({ [key: string]: HTTPParamValue })}
     * @memberof HTTPRequest
     */
    only(fields: HTTPParamName[]): { [key: string]: HTTPParamValue } {
        const result: { [key: string]: HTTPParamValue } = {}
        for (const field of fields) {
            result[field] = this.input(field)
        }
        return result
    }

    /**
     * Returns all the input data.
     *
     * @returns {{ [key: string]: HTTPParamValue }}
     * @memberof HTTPRequest
     */
    all(): { [key: string]: HTTPParamValue } {
        return { ...this.query_params, ...this.input_params }
    }

    /**
     * Validates the request and returns only the inputs validated.
     *
     * @param {{ [key: string]: string }} rules
     * @returns {{ [key: string]: HTTPParamValue }}
     * @memberof HTTPRequest
     */
    validate(rules: { [key: string]: string }): { [key: string]: HTTPParamValue } {
        const validator = new Validator(this, rules)
        const [ didPassValidation, validationErrors ] = validator.validate()
        if (!didPassValidation) {
            throw new ValidationFail(validationErrors)
        }
        return this.only(Object.keys(rules))
    }

}

/**
 * Parameters.
 *
 * @export
 * @interface Parameters
 */
export interface Parameters {
    [key: string]: string
}

/**
 * A request is represented by an HTTPRequest class.
 *
 * @export
 * @type {Request}
 */
export interface Request {
    request: HTTPRequest
    params: Parameters
}
