import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export const decode = (buffer) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'decode', args: [ buffer ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

export const encode = (buffer, w, h, opts) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'encode', args: [ buffer, w, h, opts ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'decode': {
			const [ buffer ] = thread.workerData.args

			const { data, width, height } = await codec.decode(buffer)
	
			thread.parentPort.postMessage({ data, width, height })

			break
		}
		case 'encode': {
			const [ data, width, height, options ] = thread.workerData.args

			const buffer = await codec.encode(data, width, height, options)

			thread.parentPort.postMessage(buffer)

			break
		}
	}
}
