import { Request, Method } from './request.ts'
import { Response } from './response.ts'
import { Middleware } from './middleware.ts'

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
     * Route middlewares.
     *
     * @type {Middleware[]}
     * @memberof Route
     */
    middlewares: Middleware[]

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
     * Creates a new route.
     *
     * @param {Method} method
     * @param {string} path
     * @param {Handler} handler
     * @memberof Route
     */
    constructor(method: Method, path: string, handler: Handler, middlewares: Middleware[] = []) {
        this.method = method
        this.path = path
        this.buildSegments()
        this.handler = handler
        this.middlewares = middlewares
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

}

/**
 * Represents the application router used to store and add routes.
 *
 * @export
 * @class Router
 */
export class Router {

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
    private addRoute(method: Method, path: string, handler: Handler): Route {
        const route = new Route(method, path, handler)
        this.routes.push(route)
        return route
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
    get(path: string, handler: Handler): Route {
        return this.addRoute(Method.Get, path, handler)
    }

    /**
     * Adds a new POST route the the application.
     *
     * @param {string} path
     * @param {Handler} handler
     * @returns {Route}
     * @memberof Router
     */
    post(path: string, handler: Handler): Route {
        return this.addRoute(Method.Post, path, handler)
    }

}
