import { HTTPRequest } from './request.ts'
import { Rule, name_to_rule } from './validator_rules.ts'

/**
 * Validator errors interface.
 *
 * @export
 * @interface ValidatorErrors
 */
export interface ValidatorErrors {
    [key: string]: string[]
}

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
                    return new (name_to_rule(name))(request, rest ? rest.split(',') : [])
                })
            ]
        }
    }

    /**
     * Validates the request and returns if the validation succeded
     * and additionaly the validation errors if any.
     *
     * @returns {[boolean, string]}
     * @memberof Validator
     */
    validate(): [boolean, ValidatorErrors] {
        const errors: ValidatorErrors = {}
        for (const field in this.rules) {
            for (const rule of this.rules[field]) {
                const [ fieldPassRule, fieldError ] = rule.validate(this.request.input(field))
                if (!fieldPassRule) {
                    errors[field] = [
                        ...(errors[field] ? errors[field] : []),
                        fieldError
                    ]
                }
            }
        }
        return [ Object.keys(errors).length === 0, errors ]
    }

}
