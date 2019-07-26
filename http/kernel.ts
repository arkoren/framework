import { Router } from './router.ts'
import { Request } from './request.ts'
import { NotFound } from './errors.ts'
import { Response } from './response.ts'
import { HTTPMiddleware } from './middleware.ts'

/**
 * Define a route handler.
 *
 * @export
 * @type {Handler}
 */
export type Handler = (request: Request, ...parameters: string[]) => Response

/**
 * Defines the HTTPKernel interface.
 *
 * @export
 * @interface isHTTPKernel
 */
export interface HTTPKernel {

    /**
     * Handles an incomming HTTP request.
     *
     * @param {Request} request
     * @returns {Response}
     * @memberof HTTPKernel
     */
    handle(request: Request): Response

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
    new(routes: (route: Router) => void): HTTPKernel

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
     * Stores the application router.
     *
     * @type {Router}
     * @memberof App
     */
    protected router: Router = new Router()

    /**
     * The application's global HTTP middleware stack.
     *
     * @protected
     * @type {HTTPMiddleware[]}
     * @memberof HTTPKernel
     */
    protected middleware: HTTPMiddleware[] = []

    /**
     * The application's route middleware groups.
     *
     * @protected
     * @type {{ [key: string]: HTTPMiddleware[] }}
     * @memberof HTTPKernel
     */
    protected middleware_groups: { [key: string]: HTTPMiddleware[] } = {}

    /**
     * Creates an instance of Kernel.
     *
     * @param {(route: Router) => void} routes
     * @memberof Kernel
     */
    constructor(routes: (route: Router) => void) {
        routes(this.router)
    }

    /**
     * Handles an incomming HTTP request.
     *
     * @param {Request} request
     * @returns {Response}
     * @memberof Kernel
     */
    handle(request: Request): Response {
        const [route, parameters] = this.router.matchRoute(request)
        if (route) {
            return route.handle(request, parameters)
        }
        throw new NotFound
    }

}
