import { Router, Response, Status } from './http.ts'
import { serve, ServerRequest } from 'https://deno.land/std@v0.12.0/http/server.ts'
import { HTTPRequest, Method } from './http/request.ts'
import { HTTPResponse } from './http/response.ts'

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
     * Stores the application router.
     *
     * @type {Router}
     * @memberof App
     */
    router: Router = new Router()

    /**
     * Creates a new application.
     *
     * @param {string} host
     * @param {number} port
     * @memberof App
     */
    constructor(host: string, port: number) {
        this.host = host
        this.port = port
    }

    /**
     * Registers the given routes to the application.
     *
     * @param {(route: Router) => void} routes
     * @returns {App}
     * @memberof App
     */
    public routes(routes: (route: Router) => void): App {
        routes(this.router)
        return this
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
        if (res instanceof HTTPResponse) {
            return this.respond(req, res)
        }
        let response: HTTPResponse
        switch (typeof res) {
            case 'string': {
                response = new HTTPResponse(Status.OK, new TextEncoder().encode(res))
                response.headers.set('Content-Type', 'text/html')
                break
            }
            default: {
                response = new HTTPResponse(Status.OK, new TextEncoder().encode(JSON.stringify(res)))
                response.headers.set('Content-Type', 'application/json')
                break
            }
        }
        this.respond(req, response)
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
        const [route, parameters] = this.router.matchRoute(request)
        if (route) {
            const response = route.handle(request, parameters)
            this.handleResponse(req, response)
        } else {
            req.respond({ body: new TextEncoder().encode('404') })
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
