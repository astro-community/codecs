import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export const grayscale = (buffer) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'grayscale', args: [ buffer, w, h, r ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'grayscale': {
			const [ data ] = thread.workerData.args

			const buffer = codec.grayscale(data)

			thread.parentPort.postMessage(buffer)

			break
		}
	}
}
