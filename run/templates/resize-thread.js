import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export const resize = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'resize', args: [ image, options ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'resize': {
			const [ image, options ] = thread.workerData.args

			const resizedImage = await codec.resize(image, options)

			thread.parentPort.postMessage(resizedImage)

			break
		}
	}
}
