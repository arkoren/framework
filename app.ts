import { serve, ServerRequest } from 'https://deno.land/std@v0.12.0/http/server.ts'
import {
    Method,
    Router,
    Status,
    NotFound,
    Provider,
    Response,
    response,
    isProvider,
    HTTPKernel,
    HTTPRequest,
    HTTPResponse,
    isHTTPKernel,
} from './http.ts'

/**
 * Application options interface.
 *
 * @export
 * @interface AppOptions
 */
export interface AppOptions {
    host: string
    port: number
    http_kernel: isHTTPKernel
    providers: isProvider[]
}

/**
 * Represents a web application.
 *
 * @export
 * @class App
 */
export class App {

    /**
     * Stores the HTTPKernel used by this app.
     *
     * @protected
     * @type {HTTPKernel}
     * @memberof App
     */
    protected http_kernel: HTTPKernel

    /**
     * Stores the ServiceProviders of the application.
     *
     * @protected
     * @type {isProvider[]}
     * @memberof App
     */
    protected providers: isProvider[]

    /**
     * Stores the instances of the providers.
     *
     * @protected
     * @type {Provider[]}
     * @memberof App
     */
    protected provider_instances: Provider[] = []

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
     * Stores the application services.
     *
     * @type {{ [key: string]: any }}
     * @memberof App
     */
    services: { [key: string]: any } = {}

    /**
     * Creates a new application.
     *
     * @param {AppOptions} { host, port, http_kernel, providers }
     * @memberof App
     */
    constructor({ host, port, http_kernel, providers }: AppOptions) {
        this.host = host
        this.port = port
        this.http_kernel = new http_kernel
        this.providers = providers
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
     * Returns the application router instance.
     *
     * @returns {Router}
     * @memberof App
     */
    router(): Router {
        return this.http_kernel.router
    }

    /**
     * Starts the application.
     *
     * @memberof App
     */
    async start() {
        const address = `${this.host}:${this.port}`
        console.log('Initializing service providers...')
        this.provider_instances = this.providers.map(
            provider => new provider(this)
        )
        console.log('Registering services...')
        for (const provider of this.provider_instances) {
            provider.register()
        }
        console.log('Booting services...')
        for (const provider of this.provider_instances) {
            provider.boot()
        }
        console.log('Bootstrapping HTTP Kernel...')
        this.http_kernel.bootstrap()
        console.log(`Starting application on: ${address}`)
        for await (const req of serve(address)) {
            this.handleRequest(req)
        }
    }

}
