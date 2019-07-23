import { Handler } from './router.ts'
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
     * Handles the middleware code.
     *
     * @param {Request} request
     * @param {Handler} next
     * @returns {Response}
     * @memberof IsMiddleware
     */
    handle(request: Request, next: Handler): Response

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
     * @param {Request} request
     * @param {Handler} next
     * @returns {Response}
     * @memberof HTTPMiddleware
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
     * Handles the middleware code.
     *
     * @param {Request} request
     * @param {Handler} next
     * @returns {Response}
     * @memberof Middleware
     */
    handle(request: Request, next: Handler): Response {
        // ...
        return next(request)
    }

}
