// @ts-check

import { equal as is, notEqual as isNot, deepEqual as isEqual, notDeepEqual as isNotEqual, throws as isThrown, doesNotThrow as isNotThrown, AssertionError } from 'node:assert/strict'

export { is, isNot, isEqual, isNotEqual, isThrown, isNotThrown, AssertionError }

/** Tests that the actual object is an instance of the expected class. */
export function isInstanceOf(/** @type {unknown} */ actual, /** @type {any} */ expected) {
	if (!(actual instanceof expected)) {
		throw new AssertionError({
			message: 'Expected value to be instance:',
			operator: 'instanceOf',
			actual,
			expected,
			stackStartFn: isInstanceOf,
		})
	}
}

/** Tests that the actual object is not an instance of the expected class. */
export function isNotInstanceOf(/** @type {unknown} */ actual, /** @type {any} */ expected) {
	if (actual instanceof expected) {
		throw new AssertionError({
			message: 'Expected value to be instance:',
			operator: 'instanceOf',
			actual,
			expected,
			stackStartFn: isNotInstanceOf,
		})
	}
}

const runner = (/** @type {{ (...args: any[]): any }} */ func, /** @type {unknown} */ actual) => (/** @type {any} */ expected) => {
	try {
		func(actual, expected)
	} catch (error) {
		console.error(error.message)
		process.exit(1)
	}
}

export function expect(/** @type {unknown} */ actual) {
	return {
		/** Tests for strict equality between the actual and expected parameters. */
		toBe: runner(is, actual),
		/** Tests that the actual object is an instance of the expected class. */
		toBeInstanceOf: runner(isInstanceOf, actual),
		/** Tests for deep equality between the actual and expected parameters. */
		toEqual: runner(isEqual, actual),
		/** Tests that the actual function does throw when it is called. */
		toThrow: runner(isThrown, actual),

		/** Tests for strict inequality between the actual and expected parameters. */
		toNotBe: runner(isNot, actual),
		/** Tests that the actual object is not an instance of the expected class. */
		toNotBeInstanceOf: runner(isNotInstanceOf, actual),
		/** Tests for deep inequality between the actual and expected parameters. */
		toNotEqual: runner(isNotEqual, actual),
		/** Tests that the actual function does not throw when it is called. */
		toNotThrow: runner(isNotThrown, actual),
	}
}

export async function test(/** @type {string} */ message, /** @type {{ (...args: any[]): any }} */ func) {
	console.log(message)

	await func()
}

export default expect
