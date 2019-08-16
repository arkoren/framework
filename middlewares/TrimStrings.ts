import { Middleware, Request, Response, PossibleResponse, HTTPParamName, HTTPParamValue } from '../http.ts'

/**
 * Implements the TrimStrings middleware.
 *
 * @export
 * @class TrimStrings
 * @extends {Middleware}
 */
export class TrimStrings extends Middleware {

    /**
     * The names of the attributes that should not be trimmed.
     *
     * @protected
     * @type {string[]}
     * @memberof TrimStrings
     */
    protected except: string[] = []

    /**
     * Runs before the route handler.
     *
     * @param {Request} request
     * @returns {PossibleResponse}
     * @memberof TrimStrings
     */
    before({ request }: Request): PossibleResponse {
        request.transformInputAndQuery(
            (name: HTTPParamName, value: HTTPParamValue) =>
                (value === '' && !this.except.includes(name)) ? null : value,
            (name: HTTPParamName, value: HTTPParamValue) =>
                (value === '' && !this.except.includes(name)) ? null : value,
        )
    }

    /**
     * Runs after the route handler.
     *
     * @param {Request} request
     * @param {Response} response
     * @returns {PossibleResponse}
     * @memberof TrimStrings
     */
    after(request: Request, response: Response): PossibleResponse {
        // ...
    }

}
