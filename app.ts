import {
    Method,
    Router,
    Status,
    NotFound,
    Response,
    response,
    HTTPKernel,
    HTTPRequest,
    HTTPResponse,
    isHTTPKernel,
} from './http.ts'
import { serve, ServerRequest } from 'https://deno.land/std@v0.12.0/http/server.ts'

export interface AppOptions {
    host: string
    port: number
    routes: (route: Router) => void
    http_kernel: isHTTPKernel
}

/**
 * Represents a web application.
 *
 * @export
 * @class App
 */
export class App {

    /**
     * Stores the application host.
     *
     * @type {string}
     * @memberof App
     */
    host: string

    /**
     * Stores the application port.
     *
     * @type {number}
     * @memberof App
     */
    port: number

    /**
     * Stores the HTTPKernel used by this app.
     *
     * @type {HTTPKernel}
     * @memberof App
     */
    http_kernel: HTTPKernel

    /**
     * Creates a new application.
     *
     * @param {string} host
     * @param {number} port
     * @memberof App
     */
    constructor(options: AppOptions) {
        this.host = options.host
        this.port = options.port
        this.http_kernel = new options.http_kernel(options.routes)
    }

    /**
     * Responds to the request.
     *
     * @private
     * @param {ServerRequest} req
     * @param {HTTPResponse} res
     * @memberof App
     */
    private respond(req: ServerRequest, res: HTTPResponse) {
        req.respond({
            status: res.status,
            headers: res.headers,
            body: res.body
        })
    }

    /**
     * Handles the request response.
     *
     * @private
     * @param {ServerRequest} req
     * @param {Response} res
     * @returns
     * @memberof App
     */
    private handleResponse(req: ServerRequest, res: Response) {
        this.respond(req, response(res))
    }

    /**
     * Handles the HTTP request.
     *
     * @private
     * @param {ServerRequest} req
     * @memberof App
     */
    private async handleRequest(req: ServerRequest) {
        const hasBody = req.headers.has('Content-Length') && req.headers.get('Content-Length') !== '0'
        const request = new HTTPRequest(
            req.method as Method,
            req.url,
            hasBody ? await req.body() : new Uint8Array(),
            req.headers,
            parseFloat(`${req.protoMajor}.${req.protoMinor}`)
        )
        try {
            const response = this.http_kernel.handle(request)
            this.handleResponse(req, response)
        } catch (error) {
            if (error instanceof NotFound) {
                // Route not found.
                this.handleResponse(req, response(error.message, Status.NotFound))
            } else {
                // Another kind of error. Probably developer's code.
                this.handleResponse(req, response(error.message, Status.InternalServerError))
            }
        }
    }

    /**
     * Starts the application.
     *
     * @memberof App
     */
    async start() {
        // Create the server address.
        const address = `${this.host}:${this.port}`
        // Start the server.
        console.log(`Starting application on: ${address}`)
        const server = serve(address)
        // Wait for requests.
        for await (const req of server) {
            this.handleRequest(req)
        }
    }

}
