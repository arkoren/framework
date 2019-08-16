import { HTTPRequest } from './request.ts'
import { Rule, name_to_rule } from './validator_rules.ts'

/**
 * HTTP input validation.
 *
 * @export
 * @class Validator
 */
export class Validator {

    /**
     * Request to validate.
     *
     * @protected
     * @type {Request}
     * @memberof Validator
     */
    protected request: HTTPRequest

    /**
     * Stores the validation rules.
     *
     * @protected
     * @type {{ [key: string]: Rule[] }}
     * @memberof Validator
     */
    protected rules: { [key: string]: Rule[] } = {}

    /**
     * Creates an instance of Validator.
     *
     * @param {Request} request
     * @memberof Validator
     */
    constructor(request: HTTPRequest, rules: { [key: string]: string }) {
        this.request = request
        for (const field in rules) {
            this.rules[field] = [
                ...(this.rules[field] ? this.rules[field] : []),
                ...rules[field].split('|').map(rule => {
                    const [ name, rest ] = rule.split(':')
                    return name_to_rule(name, rest ? rest.split(',') : [])
                })
            ]
        }
    }

    /**
     * Validates the request and returns if the validation succeded
     * and an additional validation error in case of failure.
     *
     * @returns {[boolean, string]}
     * @memberof Validator
     */
    validate(): [boolean, string] {
        for (const field in this.rules) {
            for (const rule of this.rules[field]) {
                const [ fieldPassRule, errorMessage ] = rule.validate(this.request.input(field))
                if (!fieldPassRule) {
                    return [ fieldPassRule, errorMessage ]
                }
            }
        }
        return [ true, '' ]
    }

}
