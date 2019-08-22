import { HTTPParamValue, HTTPRequest } from './request.ts'

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
     * Validates the value agaist the rule.
     *
     * @abstract
     * @param {HTTPParamValue} value
     * @param {string[]} targets
     * @returns {[ boolean, string ]}
     * @memberof Rule
     */
    abstract validate(value: HTTPParamValue): [ boolean, string ]

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
 * Transforms a string name to the rule class.
 *
 * @export
 * @param {string} name
 * @returns {Rule}
 */
export function name_to_rule(name: string): isRule {
    switch (name) {
        case 'accepted': return AcceptedRule
        case 'numeric': return NumericRule
        case 'min': return MinRule
        case 'max': return MaxRule
        default: return IgnoreRule
    }
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
     * Validates the value agaist the rule.
     *
     * @param {HTTPParamValue} value
     * @returns {[ boolean, string ]}
     * @memberof MinRule
     */
    validate(value: HTTPParamValue): [ boolean, string ] {
        return [ true, '' ]
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
     * Validates the value agaist the rule.
     *
     * @param {HTTPParamValue} value
     * @returns {[ boolean, string ]}
     * @memberof MinRule
     */
    validate(value: HTTPParamValue): [ boolean, string ] {
        const [ min ] = this.targets
        const result = value ? !isNaN(+value) && +value > +min : false
        return [ result, result ? '' : `Value must be higher than ${min}` ]
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
     * Validates the value agaist the rule.
     *
     * @param {HTTPParamValue} value
     * @returns {[ boolean, string ]}
     * @memberof MaxRule
     */
    validate(value: HTTPParamValue): [ boolean, string ] {
        const [ max ] = this.targets
        const result = value ? !isNaN(+value) && +value < +max : false
        return [ result, result ? '' : `Value must be lower than ${max}` ]
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
     * Validates the value agaist the rule.
     *
     * @param {HTTPParamValue} value
     * @returns {[ boolean, string ]}
     * @memberof NumericRule
     */
    validate(value: HTTPParamValue): [ boolean, string ] {
        const result: boolean = value ? !isNaN(+value) : false
        return [ result, result ? '' : `Value must be numeric` ]
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
     * Validates the value agaist the rule.
     *
     * @param {HTTPParamValue} value
     * @returns {[ boolean, string ]}
     * @memberof AcceptedRule
     */
    validate(value: HTTPParamValue): [ boolean, string ] {
        const result: boolean = value === 'yes'
            || value === 'on'
            || value === '1'
            || value === 'true'
        return [ result, result ? '' : `Value must be either 'yes', 'on', '1' or 'true'` ]
    }

}
