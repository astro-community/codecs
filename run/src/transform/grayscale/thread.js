import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export const grayscale = (image) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'grayscale', args: [ image ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'grayscale': {
			const [ image ] = thread.workerData.args

			const grayscaleImage = codec.grayscale(data)

			thread.parentPort.postMessage(grayscaleImage)

			break
		}
	}
}
