import { HTTPParamValue, HTTPRequest } from './request.ts'
import { ValidatorErrors } from './validator.ts'

type TransformedHTTPParamValue = string | number | boolean | object | any[] | null
type TransformedHTTPParamType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

/**
 * Rule class.
 *
 * @export
 * @abstract
 * @class Rule
 */
export abstract class Rule {

    /**
     * Stores the rule targets.
     *
     * @protected
     * @type {string[]}
     * @memberof Rule
     */
    protected targets: string[]

    /**
     * Stores the HTTP request.
     *
     * @protected
     * @type {HTTPRequest}
     * @memberof Rule
     */
    protected request: HTTPRequest

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @abstract
     * @type {string}
     * @memberof Rule
     */
    readonly abstract message: string

    /**
     * Determines if the attribute will stop validating other rules
     * in case this one fails.
     *
     * @type {boolean}
     * @memberof Rule
     */
    stopIfFail: boolean = false

    /**
     * Determines if the attribute will stop validating other rules
     * in case this one passes.
     *
     * @type {boolean}
     * @memberof Rule
     */
    stopIfPass: boolean = false

    /**
     * Determines if the error will be added to the error object
     * in case the rule fails.
     *
     * @type {boolean}
     * @memberof Rule
     */
    addErrorOnFailure: boolean = true

    /**
     * Creates an instance of Rule.
     *
     * @param {HTTPRequest} request
     * @param {string[]} targets
     * @memberof Rule
     */
    constructor(request: HTTPRequest, targets: string[]) {
        this.request = request
        this.targets = targets
    }

    /**
     * Transforms a string name to the rule class.
     *
     * @static
     * @param {string} name
     * @returns {isRule}
     * @memberof Rule
     */
    static fromName(name: string): isRule {
        const rules: { [key: string]: isRule } = {
            'nullable': NullableRule,
            'required': RequiredRule,
            'accepted': AcceptedRule,
            'numeric': NumericRule,
            'min': MinRule,
            'max': MaxRule
        }
        return rules.hasOwnProperty(name)
            ? rules[name]
            : IgnoreRule
    }

    /**
     * Determine if the validation rule passes.
     *
     * @abstract
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof Rule
     */
    abstract passes(attribute: string, value: HTTPParamValue, errors: ValidatorErrors): boolean

    /**
     * Transforms the HTTP parameter value into a real
     * representation of it.
     *
     * @protected
     * @param {string} input
     * @returns {[ TransformedHTTPParamType, TransformedHTTPParamValue ]}
     * @memberof Rule
     */
    protected transformParam(input: HTTPParamValue): [ TransformedHTTPParamType, TransformedHTTPParamValue ] {
        if (!input) {
            return [ 'null', null ]
        }
        try {
            const result = eval(input)
            if (typeof result === 'number') {
                return [ 'number', result as number ]
            } else if (typeof result === 'boolean') {
                return [ 'boolean', result as boolean ]
            } else if (Array.isArray(result)) {
                return [ 'array', result as any[] ]
            } else if (result instanceof Object) {
                return [ 'object', result as object ]
            }
            return [ 'null', null ]
        } catch {
            return [ 'string', input ]
        }
    }

    /**
     * Converts a transformed HTTP parameter to a numeric representation.
     *
     * @protected
     * @param {TransformedHTTPParamType} type
     * @param {TransformedHTTPParamValue} value
     * @returns {number}
     * @memberof Rule
     */
    protected asNumber(type: TransformedHTTPParamType, value: TransformedHTTPParamValue): number {
        switch (type) {
            case 'number': return value as number
            case 'boolean': return value ? 1 : 0
            case 'string': return (value as string).length
            case 'array': return (value as any[]).length
            case 'object': return Object.keys(value as Object).length
            case 'null': return 0
        }
    }

    /**
     * Returns the placeholders for the string replacer.
     *
     * attribute: the attribute name.
     * value: the value of the attribute.
     * param_{i}: ith parameter given.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns
     * @memberof Rule
     */
    placeholders(attribute: string, value: HTTPParamValue): { [key: string]: string } {
        const placeholders: { [key: string]: string } = {}
        for (let i = 0; i < this.targets.length; ++i) {
            placeholders[`param_${i}`] = this.targets[i]
        }
        return { attribute, value: value ? value : '', ...placeholders }
    }

}

/**
 * Is rule interface.
 *
 * @export
 * @interface isRule
 */
export interface isRule {

    /**
     * Creates an instance of Rule.
     *
     * @param {HTTPRequest} request
     * @param {string[]} targets
     * @memberof Rule
     */
    new(request: HTTPRequest, targets: string[]): Rule

}

/**
 * Default rule to be ignored
 *
 * @export
 * @class IgnoreRule
 * @extends {Rule}
 */
export class IgnoreRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof IgnoreRule
     */
    readonly message: string = ''

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof IgnoreRule
     */
    passes(attribute: string, value: HTTPParamValue): boolean {
        return true
    }

}

/**
 * Implements the Min validation.
 *
 * @export
 * @class MinRule
 * @extends {Rule}
 */
export class MinRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof MinRule
     */
    readonly message: string = ':attribute must be higher than :param_0'

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof MinRule
     */
    passes(attribute: string, value: HTTPParamValue): boolean {
        const [ min ] = this.targets
        return this.asNumber(...this.transformParam(value)) > +min
    }

}

/**
 * Implements the Min validation.
 *
 * @export
 * @class MaxRule
 * @extends {Rule}
 */
export class MaxRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof MaxRule
     */
    readonly message: string = ':attribute must be lower than :param_0'

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof MaxRule
     */
    passes(attribute: string, value: HTTPParamValue): boolean {
        const [ max ] = this.targets
        return this.asNumber(...this.transformParam(value)) < +max
    }

}

/**
 * Implements the Numeric validation.
 *
 * @export
 * @class NumericRule
 * @extends {Rule}
 */
export class NumericRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof NumericRule
     */
    readonly message: string = ':attribute must be numeric'

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof NumericRule
     */
    passes(attribute: string, value: HTTPParamValue): boolean {
        return this.transformParam(value)[0] === 'number'
    }

}

/**
 * Implements the Numeric validation.
 *
 * @export
 * @class AcceptedRule
 * @extends {Rule}
 */
export class AcceptedRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof AcceptedRule
     */
    readonly message: string = ":attribute must be either 'yes', 'on', '1' or 'true'"

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof AcceptedRule
     */
    passes(attribute: string, value: HTTPParamValue): boolean {
        return value === 'yes'
            || value === 'on'
            || value === '1'
            || value === 'true'
    }

}

/**
 * Implements the nullable rule. This rule is
 * specially handled outisde of this file.
 *
 * @export
 * @class NullableRule
 * @extends {Rule}
 */
export class NullableRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof NullableRule
     */
    readonly message: string = ''

    /**
     * Determines if the attribute will stop validating other rules
     * in case this one passes.
     *
     * @type {boolean}
     * @memberof NullableRule
     */
    stopIfPass: boolean = true

    /**
     * Determines if the error will be added to the error object
     * in case the rule fails.
     *
     * @type {boolean}
     * @memberof NullableRule
     */
    addErrorOnFailure: boolean = false

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @param {ValidatorErrors} errors
     * @returns {boolean}
     * @memberof NullableRule
     */
    passes(attribute: string, value: HTTPParamValue, errors: ValidatorErrors): boolean {
        if (value === null) {
            delete errors[attribute]
            return true
        }
        return false
    }

}

/**
 * Implements the required rule. This rule is
 * specially handled outisde of this file.
 *
 * @export
 * @class RequiredRule
 * @extends {Rule}
 */
export class RequiredRule extends Rule {

    /**
     * Error message to show if validation fails.
     *
     * @readonly
     * @type {string}
     * @memberof RequiredRule
     */
    readonly message: string = ':attribute is required'

    /**
     * Determines if the attribute will stop validating other rules
     * in case this one fails.
     *
     * @type {boolean}
     * @memberof RequiredRule
     */
    stopIfFail: boolean = true

    /**
     * Determine if the validation rule passes.
     *
     * @param {string} attribute
     * @param {HTTPParamValue} value
     * @returns {boolean}
     * @memberof RequiredRule
     */
    passes(attribute: string): boolean {
        return this.request.has(attribute)
    }

}
