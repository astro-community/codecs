import * as thread from 'node:worker_threads'
import { DecodedImage, EncodedImage } from '../transform/utils.js'
import { encode as wasmEncode, decode as wasmDecode, ext, load, rect, test, type } from './codec.js'

export { ext, load, rect, test, type }

const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

export const decode = (data) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'decode', args: [ data ] } })

	worker.on('message', image => resolve(
		new DecodedImage(image.data, image.width, image.height)
	)).on('error', reject).on('exit', onfail)
})

export const encode = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'encode', args: [ image, options ] } })

	worker.on('message', image => resolve(
		new EncodedImage(image.type, image.data, image.width, image.height)
	)).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'decode': {
			const [ data ] = thread.workerData.args

			thread.parentPort.postMessage(wasmDecode(data))

			break
		}

		case 'encode': {
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(wasmEncode(image, options))

			break
		}
	}
}
