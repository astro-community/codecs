import * as thread from 'node:worker_threads'
import { DecodedImage } from '../utils.js'
import { blur as wasmBlur } from './codec.js'

const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

export const blur = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'blur', args: [ image, options ] } })

	worker.on('message', image => resolve(
		new DecodedImage(image.data, image.width, image.height)
	)).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'blur': {
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(wasmBlur(image, options))

			break
		}
	}
}
