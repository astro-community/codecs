import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export { test } from './codec.js'

export const decode = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'decode', args: [ image, options ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

export const encode = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'encode', args: [ image, options ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'decode': {
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(await codec.decode(image, options))

			break
		}
		case 'encode': {
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(await codec.encode(image, options))

			break
		}
	}
}
