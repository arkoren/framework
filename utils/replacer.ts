/**
 * Represents a string replacer.
 *
 * @export
 * @class StringReplacer
 */
export class StringReplacer {

    /**
     * Returns the string with the values replaced.
     *
     * @param {{ [key: string]: string }} values
     * @returns {string}
     * @memberof StringReplacer
     */
    static replace(str: string, values: { [key: string]: string }): string {
        for (const key in values) {
            str = str.replace(`:${key}`, values[key])
        }
        return str
    }

}
