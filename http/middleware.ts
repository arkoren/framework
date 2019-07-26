import { Request } from './request.ts'
import { Response } from './response.ts'

/**
 * IsMiddleware interface.
 *
 * @export
 * @interface IsMiddleware
 */
export interface IsMiddleware {

    /**
     * Runs before the route handler.
     *
     * @param {Request} request
     * @memberof Log
     */
    before(request: Request): void

    /**
     * Runs after the route handler.
     *
     * @param {Request} request
     * @param {Response} response
     * @memberof Log
     */
    after(request: Request, response: Response): void

}

/**
 * HTTPMiddleware interface.
 *
 * @export
 * @interface HTTPMiddleware
 */
export interface HTTPMiddleware {

    /**
     * Creates a new middleware instance.
     *
     * @returns {HTTPMiddleware}
     */
    new(): IsMiddleware

}

/**
 * Base Middleware class.
 *
 * @export
 * @class Middleware
 * @implements {HTTPMiddleware}
 */
export class Middleware implements IsMiddleware {

    /**
     * Runs before the route handler.
     *
     * @param {Request} request
     * @memberof Log
     */
    before(request: Request) {
        // ...
    }

    /**
     * Runs after the route handler.
     *
     * @param {Request} request
     * @param {Response} response
     * @memberof Log
     */
    after(request: Request, response: Response) {
        // ...
    }

}
