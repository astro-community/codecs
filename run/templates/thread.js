import * as thread from 'node:worker_threads'
import * as codec from './codec.js'
export { test } from './codec.js'

export const decode = (uint) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'decode', args: [ uint ] } })
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
			const [ uint ] = thread.workerData.args

			const { data, width, height } = await codec.decode(uint)

			thread.parentPort.postMessage({ data, width, height })

			break
		}
		case 'encode': {
			const [ image, options ] = thread.workerData.args

			const buffer = await codec.encode(image, options)

			thread.parentPort.postMessage(buffer)

			break
		}
	}
}
