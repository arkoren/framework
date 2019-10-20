import { Handler, HTTPKernel } from './kernel.ts'
import { HTTPResponse, response } from './response.ts'
import { HTTPMiddleware, Middleware } from './middleware.ts'
import { Request, HTTPRequest, Parameters, Method } from './request.ts'

/**
 * Represents the route registrar callback type.
 *
 * @export
 * @type {RouteRegistrar}
 */
export type RouteRegistrar = (route: Router) => void

/**
 * Represents a parameter.
 *
 * @export
 * @class Parameter
 */
class Parameter {

    /**
     * Determines the name of the parameter.
     *
     * @type {string}
     * @memberof Parameter
     */
    name: string

    /**
     * Creates an instance of Parameter.
     *
     * @param {string} name
     * @memberof Parameter
     */
    constructor(name: string) {
        this.name = name
    }

}

/**
 * Represents the route options.
 *
 * @export
 * @interface RouteOptions
 */
export interface RouteOptions {
    middlewares: Middleware[]
}

/**
 * Represents the router options.
 *
 * @export
 * @interface RouteOptions
 */
export interface RouterOptions {
    middleware?: string | HTTPMiddleware | HTTPMiddleware[]
}

/**
 * Represents an application route.
 *
 * @class Route
 */
export class Route {

    /**
     * Stores the route path segments. It can either be
     * a literal string or a parameter.
     *
     * @protected
     * @type {((string | Parameter)[])}
     * @memberof Route
     */
    protected segments: (string | Parameter)[] = []

    /**
     * Representsthe route method.
     *
     * @type {Method}
     * @memberof Route
     */
    method: Method

    /**
     * Represents the route path.
     *
     * @type {string}
     * @memberof Route
     */
    path: string

    /**
     * Represents the route handler.
     *
     * @type {Handler}
     * @memberof Route
     */
    handler: Handler

    /**
     * Stores the options of the route.
     *
     * @type {RouteOptions}
     * @memberof Route
     */
    options: RouteOptions

    /**
     * Segmentates a given path.
     *
     * @static
     * @param {string} path
     * @returns {string[]}
     * @memberof Route
     */
    static segmentate(path: string): string[] {
        return path.split('/').slice(1)
    }

    /**
     * Transforms the router options into route options.
     *
     * @static
     * @param {RouterOptions} options
     * @returns {RouteOptions}
     * @memberof Route
     */
    static optionsFrom({ middleware }: RouterOptions, http_kernel: HTTPKernel): RouteOptions {
        let middlewares: Middleware[] = []
        if (middleware) {
            if (Array.isArray(middleware)) {
                middlewares = middleware.map(m => new m)
            } else if (typeof middleware === 'string') {
                middlewares = http_kernel.middlewares_of(middleware).map(m => new m)
            } else {
                middlewares = [ new middleware ]
            }
        }
        return {
            middlewares: middlewares
        }
    }

    /**
     * Merges two route options.
     *
     * @static
     * @param {RouteOptions} first
     * @param {RouteOptions} second
     * @returns {RouteOptions}
     * @memberof Route
     */
    static mergeOptions(first: RouteOptions, second: RouteOptions): RouteOptions {
        return {
            middlewares: [ ...first.middlewares, ...second.middlewares ]
        }
    }

    /**
     * Build the route segments.
     *
     * @private
     * @memberof Route
     */
    private buildSegments() {
        this.segments = Route.segmentate(this.path).map(segment =>
            (typeof segment === 'string' && segment[0] == ':')
                ? new Parameter(segment.substr(1))
                : segment
        )
    }

    /**
     * Creates an instance of Route.
     *
     * @param {Method} method
     * @param {string} path
     * @param {Handler} handler
     * @param {[RouteOptions, RouteOptions]} options
     * @memberof Route
     */
    constructor(method: Method, path: string, handler: Handler, options: [RouteOptions, RouteOptions]) {
        this.method = method
        this.path = path
        this.buildSegments()
        this.handler = handler
        this.options = Route.mergeOptions(options[0], options[1])
    }

    /**
     * Returns true if the route matches the current one.
     *
     * @param {HTTPRequest} request
     * @returns {[boolean, Parameters]}
     * @memberof Route
     */
    match(request: HTTPRequest): [boolean, Parameters] {
        const segments = Route.segmentate(request.path())
        if (segments.length !== this.segments.length || this.method !== request.method()) {
            return [ false, {} ]
        }
        const parameters: Parameters = {}
        // Don't replace this for loop with any high order
        // function for perforamnce reasons, this is a
        // sensitive function.
        for (let i = 0; i < segments.length; ++i) {
            const current = this.segments[i]
            if (typeof current === 'string') {
                if (current !== segments[i]) {
                    return [ false, {} ]
                }
            } else {
                parameters[current.name] = segments[i]
            }
        }
        return [ true, parameters ]
    }

    /**
     * Handles the route request.
     *
     * @param {HTTPRequest} request
     * @param {Parameters} parameters
     * @param {Middleware[]} [globals=[]]
     * @returns {HTTPResponse}
     * @memberof Route
     */
    handle(request: HTTPRequest, params: Parameters, globals: Middleware[] = []): HTTPResponse {
        const middlewares = [ ...globals, ...this.options.middlewares ]
        const full_request: Request = { request, params }
        // Execute the before middlewares.
        for (const middleware of middlewares) {
            const possible_response = middleware.before(full_request)
            if (possible_response) {
                return response(possible_response)
            }
        }
        // Execute the route handler.
        const res = this.handler(full_request)
        // Execute the after middlewares.
        for (const middleware of middlewares) {
            const possible_response = middleware.after(full_request, res)
            if (possible_response) {
                return response(possible_response)
            }
        }
        return response(res)
    }

}

/**
 * Represents the application router used to store and add routes.
 *
 * @export
 * @class Router
 */
export class Router {

    /**
     * Stores the HTTP Kernel instance where this router is located.
     *
     * @protected
     * @type {HTTPKernel}
     * @memberof Router
     */
    protected http_kernel: HTTPKernel

    /**
     * Stores the router options that will be
     * applied to each route.
     *
     * @type {RouteOptions}
     * @memberof Router
     */
    options: RouterOptions

    /**
     * Stores all the routes of the application.
     *
     * @type {Route[]}
     * @memberof Router
     */
    routes: Route[] = []

    /**
     * Adds a new route to the application and returns it.
     *
     * @private
     * @param {Method} method
     * @param {string} path
     * @param {Handler} handler
     * @returns {Route}
     * @memberof Router
     */
    private addRoute(method: Method, path: string, handler: Handler, options: RouterOptions): Route {
        const route = new Route(
            method,
            path,
            handler,
            [
                Route.optionsFrom(this.options, this.http_kernel),
                Route.optionsFrom(options, this.http_kernel)
            ]
        )
        this.routes.push(route)
        return route
    }

    /**
     * Creates an instance of Router.
     *
     * @param {RouteOptions} [options={}]
     * @memberof Router
     */
    constructor(http_kernel: HTTPKernel, options: RouterOptions = {}) {
        this.http_kernel = http_kernel
        this.options = options
    }

    /**
     * Returns the current maching route. If no route
     * matches, a 404 route is returned.
     *
     * @param {HTTPRequest} request
     * @returns {([Route | null, Parameters])}
     * @memberof Router
     */
    matchRoute(request: HTTPRequest): [Route | null, Parameters] {
        for (const route of this.routes) {
            const [match, params] = route.match(request)
            if (match) {
                return [route, params]
            }
        }
        return [null, {}]
    }

    /**
     * Adds a new GET route the the application.
     *
     * @param {string} path
     * @param {Handler} handler
     * @returns {Route}
     * @memberof Router
     */
    get(path: string, handler: Handler, options: RouterOptions = {}): Route {
        return this.addRoute(Method.Get, path, handler, options)
    }

    /**
     * Adds a new POST route the the application.
     *
     * @param {string} path
     * @param {Handler} handler
     * @returns {Route}
     * @memberof Router
     */
    post(path: string, handler: Handler, options: RouterOptions = {}): Route {
        return this.addRoute(Method.Post, path, handler, options)
    }

    /**
     * Creates a new group of routes with the given options.
     *
     * @param {RouteOptions} options
     * @param {RouteRegistrar} callback
     * @memberof Router
     */
    group(options: RouterOptions, callback: RouteRegistrar) {
        const router = new Router(this.http_kernel, { ...this.options, ...options })
        callback(router)
        this.routes = [ ...this.routes, ...router.routes ]
    }

}
