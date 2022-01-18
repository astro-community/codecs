import * as thread from 'node:worker_threads'
import * as codec from './codec.js'

export { test } from './codec.js'

/** @type {typeof import('./thread.d').blurhash} */
export const blurhash = (image, options) => new Promise((resolve, reject) => {
	const worker = new thread.Worker(new URL(import.meta.url), { workerData: { type: 'blurhash', args: [ image, options ] } })
	const onfail = (code) => code === 0 || reject(new Error(`Encoding failed [ ${code} ]`))

	worker.on('message', resolve).on('error', reject).on('exit', onfail)
})

if (!thread.isMainThread) {
	switch (thread.workerData.type) {
		case 'blurhash': {
			/** @type {Parameters<typeof import('./thread.d').blurhash>} */
			const [ image, options ] = thread.workerData.args

			thread.parentPort.postMessage(codec.blurhash(image, options))

			break
		}
	}
}
