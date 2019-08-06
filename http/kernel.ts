import { NotFound } from './errors.ts'
import { Response } from './response.ts'
import { Request, HTTPRequest } from './request.ts'
import { Router, RouteRegistrar } from './router.ts'
import { HTTPMiddleware, Middleware } from './middleware.ts'

/**
 * Define a route handler.
 *
 * @export
 * @type {Handler}
 */
export type Handler = (request: Request) => Response

/**
 * Defines the HTTPKernel interface.
 *
 * @export
 * @interface HTTPKernel
 */
export interface HTTPKernel {

    /**
     * Stores the application router.
     *
     * @type {Router}
     * @memberof HTTPKernel
     */
    router: Router

    /**
     * Handles an incomming HTTP request.
     *
     * @param {HTTPRequest} request
     * @returns {Response}
     * @memberof HTTPKernel
     */
    handle(request: HTTPRequest): Response

    /**
     * Bootstraps the HTTP Kernel.
     *
     * @memberof HTTPKernel
     */
    bootstrap(): void

    /**
     * Adds routes to be registered on bootstrap.
     *
     * @param {RouteRegistrar} routes
     * @memberof HTTPKernel
     */
    add_routes(routes: RouteRegistrar): void

    /**
     * Returns the HTTP Middlewares found in a given
     * group. It returns an empty list [] if the group
     * is not found.
     *
     * @param {string} group
     * @returns {HTTPMiddleware[]}
     * @memberof HTTPKernel
     */
    middlewares_of(group: string): HTTPMiddleware[]

}

/**
 * Defines the isHTTPKernel interface.
 *
 * @export
 * @interface isHTTPKernel
 */
export interface isHTTPKernel {

    /**
     * Creates a new HTTPKernel instance.
     *
     * @returns {HTTPKernel}
     */
    new(): HTTPKernel

}

/**
 * Represents an HTTP Kernel.
 *
 * @export
 * @class Kernel
 * @implements {HTTPKernel}
 */
export class Kernel implements HTTPKernel {

    /**
     * Stores the instances of the middlewares.
     *
     * @private
     * @type {Middleware[]}
     * @memberof Kernel
     */
    private middleware_instances: Middleware[] = []

    /**
     * The application's global HTTP middleware stack.
     *
     * @protected
     * @type {HTTPMiddleware[]}
     * @memberof Kernel
     */
    protected middleware: HTTPMiddleware[] = []

    /**
     * The application's route middleware groups.
     *
     * @protected
     * @type {{ [key: string]: HTTPMiddleware[] }}
     * @memberof Kernel
     */
    protected middleware_groups: { [key: string]: HTTPMiddleware[] } = {}

    /**
     * Stores the routes to register on bootstrap.
     *
     * @protected
     * @type {RouteRegistrar[]}
     * @memberof Kernel
     */
    protected routes: RouteRegistrar[] = []

    /**
     * Stores the application router.
     *
     * @type {Router}
     * @memberof Kernel
     */
    router: Router = new Router(this)

    /**
     * Handles an incomming HTTP request.
     *
     * @param {HTTPRequest} request
     * @returns {Response}
     * @memberof Kernel
     */
    handle(request: HTTPRequest): Response {
        const [route, parameters] = this.router.matchRoute(request)
        if (route) {
            return route.handle(request, parameters, this.middleware_instances)
        }
        throw new NotFound
    }

    /**
     * Bootstraps the HTTP Kernel.
     *
     * @memberof Kernel
     */
    bootstrap() {
        for (const register of this.routes) {
            register(this.router)
        }
        this.middleware_instances = this.middleware.map(
            middleware => new middleware
        )
    }

    /**
     * Adds routes to be registered on bootstrap.
     *
     * @param {RouteRegistrar} routes
     * @memberof Kernel
     */
    add_routes(routes: RouteRegistrar) {
        this.routes.push(routes)
    }

    /**
     * Returns the HTTP Middlewares found in a given
     * group. It returns an empty list [] if the group
     * is not found.
     *
     * @param {string} group
     * @returns {HTTPMiddleware[]}
     * @memberof Kernel
     */
    middlewares_of(group: string): HTTPMiddleware[] {
        if (this.middleware_groups.hasOwnProperty(group)) {
            return this.middleware_groups[group]
        }
        return []
    }

}
