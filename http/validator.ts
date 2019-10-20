import { HTTPRequest } from './request.ts'
import { Rule } from './validator_rules.ts'
import { StringReplacer } from '../utils/replacer.ts'

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
        for (const attribute in rules) {
            this.rules[attribute] = [
                ...(this.rules[attribute] ? this.rules[attribute] : []),
                ...rules[attribute].split('|').map(rule => {
                    const [ name, rest ] = rule.split(':')
                    return new (Rule.fromName(name))(request, rest ? rest.split(',') : [])
                })
            ]
        }
    }

    /**
     * Validates the request and returns if the validation succeded
     * and additionaly the validation errors if any.
     *
     * @returns {[ boolean, ValidatorErrors ]}
     * @memberof Validator
     */
    validate(): [ boolean, ValidatorErrors ] {
        const errors: ValidatorErrors = {}
        for (const attribute in this.rules) {
            for (const rule of this.rules[attribute]) {
                const value = this.request.input(attribute)
                if (!rule.passes(attribute, value, errors)) {
                    if (rule.addErrorOnFailure) {
                        errors[attribute] = [
                            ...(errors[attribute] ? errors[attribute] : []),
                            StringReplacer.replace(rule.message, rule.placeholders(attribute, value))
                        ]
                    }
                    if (rule.stopIfFail) {
                        break
                    }
                } else if (rule.stopIfPass) {
                    break
                }
            }
        }
        return [ Object.keys(errors).length === 0, errors ]
    }

}
