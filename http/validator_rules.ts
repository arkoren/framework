import { HTTPParamValue } from './request.ts'

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
     * Creates an instance of Rule.
     *
     * @param {string[]} targets
     * @memberof Rule
     */
    constructor(targets: string[]) {
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
 * Transforms a string name to the rule class.
 *
 * @export
 * @param {string} name
 * @returns {Rule}
 */
export function name_to_rule(name: string, targets: string[]): Rule {
    switch (name) {
        case 'min': return new MinRule(targets)
        case 'max': return new MaxRule(targets)
        case 'numeric': return new NumericRule(targets)
        default: return new IgnoreRule(targets)
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
        const result = value ? +value !== NaN && +value > +min : false
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
        const result = value ? +value !== NaN && +value < +max : false
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
        const result: boolean = value ? +value !== NaN : false
        return [ result, result ? '' : `Value must be numeric` ]
    }

}
