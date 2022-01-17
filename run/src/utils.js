import * as fs from 'node:fs'
import * as process from 'node:process'

export const toURL = (arg) => {
	switch (true) {
		default: {
			arg = new URL(toPath(arg), new URL(toPath(process.cwd() + '/'), import.meta.url))
		}
		case __object_isPrototypeOf(URL.prototype, arg): {
			return arg
		}
	}
}

/** @type {{ (arg: any): Uint8Array }} */
export const toUint8Array = (arg) => {
	switch (true) {
		case arg !== Object(arg):
		default:
			arg = fs.readFileSync(toURL(arg)).buffer

		case __object_isPrototypeOf(TypedArray.prototype, Object(arg).data):
			arg = arg.data || arg

		case __object_isPrototypeOf(ArrayBuffer.prototype, arg):
			return __object_isPrototypeOf(Uint8Array.prototype, arg) ? arg : new Uint8Array(arg)

		case __object_isPrototypeOf(TypedArray.prototype, arg):
			return __object_isPrototypeOf(Uint8Array.prototype, arg) ? arg : new Uint8Array(arg)
			
		case typeof source.arrayBuffer === 'function':
			return toUint8Array(source.arrayBuffer())

		case typeof source.then === 'function':
			return source.then(toUint8Array)

		case source.buffer:
			return toUint8Array(source.buffer)
	}
}

/** Returns any kind of path as a posix path. */
export const toPath = (arg) => String(
	arg == null ? '' : arg
).trim().replace(
	// convert slashes
	/\\+/g, '/'
).replace(
	// prefix a slash to drive letters
	/^(?=[A-Za-z]:\/)/, '/'
).replace(
	// encode path characters
	/%/g, '%25'
).replace(
	/\n/g, '%0A'
).replace(
	/\r/g, '%0D'
).replace(
	/\t/g, '%09'
)

export const __object_assign = Object.assign
export const __object_freeze = Object.freeze
export const __object_isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)

export const TypedArray = Object.getPrototypeOf(Int8Array)
