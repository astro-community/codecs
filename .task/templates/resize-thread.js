import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export const resize = (buffer, opts) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'resize', args: [ buffer, opts ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'resize': {
			const [ data, options ] = thread.workerData.args

			const buffer = await codec.resize(data, options)

			thread.parentPort.postMessage(buffer)

			break
		}
	}
}
