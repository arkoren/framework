export namespace StringReplacer {

    /**
     * Returns the string with the values replaced.
     *
     * @export
     * @param {string} str
     * @param {{ [key: string]: string }} values
     * @returns {string}
     */
    export function replace(str: string, values: { [key: string]: string }): string {
        for (const key in values) {
            str = str.replace(`:${key}`, values[key])
        }
        return str
    }

}
