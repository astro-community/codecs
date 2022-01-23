export function is<T>(actual: unknown, expected: T): asserts actual is Extract<typeof actual, T>
export function isNot<T>(actual: unknown, expected: T): asserts actual is Exclude<typeof actual, T>

export function isEqual<T>(actual: unknown, expected: T): asserts actual is Extract<typeof actual, T>
export function isNotEqual<T>(actual: unknown, expected: T): asserts actual is Exclude<typeof actual, T>

export function isThrown(block: AnyFunction): void
export function isThrown(block: AnyFunction, error: Error): void
export function isNotThrown(block: AnyFunction): void
export function isNotThrown(block: AnyFunction, error: Error): void

export function isInstanceOf<T>(actual: unknown, expected: T): asserts actual is Extract<typeof actual, T>
export function isNotInstanceOf<T>(actual: unknown, expected: T): asserts actual is Extract<typeof actual, T>

export function expect<TActual extends unknown>(actual: TActual): {
	toBe(expected: unknown): void
	toNotBe(expected: unknown): void

	toEqual(expected: unknown): void
	toNotEqual(expected: unknown): void

	toThrow(block: AnyFunction): void
	toThrow(block: AnyFunction, error: Error): void
	toNotThrow(block: AnyFunction): void
	toNotThrow(block: AnyFunction, error: Error): void

	toBeInstanceOf(expected: unknown): void
	toNotBeInstanceOf(expected: unknown): void
}

export function test(message: string, func: AnyFunction): Promise<void>

export default expect

interface AnyFunction {
	(...args: any[]): any
}
