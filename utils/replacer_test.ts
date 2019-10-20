import { StringReplacer } from './replacer.ts'
import { assert } from '../deno.ts'

const tests: { str: string, values: { [key: string]: string }, expected: string }[] = [
    {
        str         : 'Hello, :name!',
        values      : { name: 'world' },
        expected    : 'Hello, world!'
    },
    {
        str         : 'Some :noun are currently :action',
        values      : { noun: 'random dudes', action: 'coding some libraries' },
        expected    : 'Some random dudes are currently coding some libraries'
    }
]

for (const test of tests) {
    const result = StringReplacer.replace(test.str, test.values)
    assert(result === test.expected, `Expected '${test.expected}' but got '${result}'`)
}
