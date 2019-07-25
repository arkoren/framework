import { Request, Method } from './request.ts'
import { Response } from './response.ts'
import { HTTPMiddleware, IsMiddleware } from './middleware.ts'

/**
 * Define a route handler.
 *
 * @export
 * @type {Handler}
 */
export type Handler = (req: Request, ...parameters: string[]) => Response

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
    middlewares: IsMiddleware[]
}

/**
 * Represents the router options.
 *
 * @export
 * @interface RouteOptions
 */
export interface RouterOptions {
    middleware?: HTTPMiddleware | HTTPMiddleware[]
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
    static optionsFrom(options: RouterOptions): RouteOptions {
        return {
            middlewares: options.middleware
                ? (Array.isArray(options.middleware)
                    ? options.middleware.map(m => new m)
                    : [new options.middleware])
                : []
        }
    }

    static mergeOptions(first: RouteOptions, second: RouteOptions): RouteOptions {
        return {
            middlewares: [...first.middlewares, ...second.middlewares]
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
     * @param {[RouterOptions, RouterOptions]} options
     * @memberof Route
     */
    constructor(method: Method, path: string, handler: Handler, options: [RouterOptions, RouterOptions]) {
        this.method = method
        this.path = path
        this.buildSegments()
        this.handler = handler
        this.options = Route.mergeOptions(Route.optionsFrom(options[0]), Route.optionsFrom(options[1]))
    }

    /**
     * Returns true if the route matches the current one.
     *
     * @param {Request} request
     * @returns {[boolean, string[]]}
     * @memberof Route
     */
    match(request: Request): [boolean, string[]] {
        const segments = Route.segmentate(request.URI)
        if (segments.length !== this.segments.length || this.method !== request.method) {
            return [false, []]
        }
        const parameters: string[] = []
        // Don't replace this for loop with any high order
        // function for perforamnce reasons, this is a
        // sensitive function.
        for (let i = 0; i < segments.length; ++i) {
            const current = this.segments[i]
            if (typeof current === 'string') {
                if (current !== segments[i]) {
                    return [false, []]
                }
            } else {
                parameters.push(segments[i])
            }
        }
        return [true, parameters]
    }

    /**
     * Handles the route request.
     *
     * @param {Request} request
     * @param {string[]} parameters
     * @returns {Response}
     * @memberof Route
     */
    handle(request: Request, parameters: string[]): Response {
        // Execute the before middlewares.
        for (const middleware of this.options.middlewares) {
            middleware.before(request)
        }
        // Execute the route handler.
        const response = this.handler(request, ...parameters)
        // Execute the after middlewares.
        for (const middleware of this.options.middlewares) {
            middleware.after(request, response)
        }
        return response
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
        const route = new Route(method, path, handler, [this.options, options])
        this.routes.push(route)
        return route
    }

    /**
     * Creates an instance of Router.
     *
     * @param {RouteOptions} [options={}]
     * @memberof Router
     */
    constructor(options: RouterOptions = {}) {
        this.options = options
    }

    /**
     * Returns the current maching route. If no route
     * matches, a 404 route is returned.
     *
     * @param {Request} request
     * @returns {([Route | null, string[]])}
     * @memberof Router
     */
    matchRoute(request: Request): [Route | null, string[]] {
        for (const route of this.routes) {
            const [match, params] = route.match(request)
            if (match) {
                return [route, params]
            }
        }
        return [null, []]
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
     * @param {(route: Router) => void} callback
     * @returns {Router}
     * @memberof Router
     */
    group(options: RouterOptions, callback: (route: Router) => void) {
        const router = new Router({ ...this.options, ...options })
        callback(router)
        for (const route of router.routes) {
            this.routes.push(route)
        }
    }

}
