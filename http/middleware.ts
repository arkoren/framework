import { Request } from './request.ts'
import { Response, PossibleResponse } from './response.ts'

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
    new(): Middleware

}

/**
 * Base Middleware class.
 *
 * @export
 * @class Middleware
 * @implements {HTTPMiddleware}
 */
export abstract class Middleware {

    /**
     * Runs before the route handler.
     *
     * @param {Request} request
     * @returns {PossibleResponse}
     * @memberof Middleware
     */
    abstract before(request: Request): PossibleResponse

    /**
     * Runs after the route handler.
     *
     * @param {Request} request
     * @param {Response} response
     * @returns {PossibleResponse}
     * @memberof Middleware
     */
    abstract after(request: Request, response: Response): PossibleResponse

}
