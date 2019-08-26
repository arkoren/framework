import { plural } from '../utils/string.ts'

/**
 * Represents a database model.
 *
 * @export
 * @class Model
 */
export class Model {

    /**
     * Represents the table name. If it's undefined
     * the instance class name will be used.
     *
     * @protected
     * @type {string}
     * @memberof Model
     */
    protected table?: string

    /**
     * Returns the table name that the model is
     * currently using.
     *
     * @returns {string}
     * @memberof Model
     */
    getTable(): string {
        return this.table
            ? this.table
            : plural(this.constructor.name)
    }

}
