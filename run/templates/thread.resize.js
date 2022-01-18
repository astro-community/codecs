import * as thread from 'node:worker_threads'
import { DecodedImage } from '../utils.js'
import { resize as wasmResize } from './codec.js'

const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

export const resize = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'resize', args: [ image, options ] } })

	worker.on('message', image => resolve(
		new DecodedImage(image.data, image.width, image.height)
	)).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'resize': {
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(wasmResize(image, options))

			break
		}
	}
}
