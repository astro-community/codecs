// @ts-check

import * as cp from 'node:child_process'
import * as fs from 'node:fs/promises'
import * as nu from 'node:url'

// utilities
// ---------

/** @type {{ (...args: Parameters<typeof cp.spawn>): Promise<void> }} */
export const spawn = (...args) => new Promise((resolve, reject) => {
	const child = cp.spawn(...args)

	child.on('error', reject)
	child.on('exit', resolve)
})

// test runner
// -----------

async function runner() {
	const rootDirURL = new URL('../', import.meta.url)
	const testDirURL = new URL('./', import.meta.url)

	async function removeGeneratedTestImages() {
		for (const file of await fs.readdir(new URL('test/', rootDirURL))) {
			if (file.includes('-')) {
				await fs.rm(new URL(`test/${file}`, rootDirURL))
			}
		}
	}

	await removeGeneratedTestImages()

	for await (const dirent of await fs.opendir(testDirURL)) {
		if (dirent.name.startsWith('test.') && dirent.name !== 'test.js' && dirent.name !== 'test.allz.js') {
			const testURL = new URL(dirent.name, testDirURL)

			await spawn('node', [nu.fileURLToPath(testURL)], { cwd: nu.fileURLToPath(rootDirURL), env: process.env, stdio: 'inherit' })
		}
	}

	await removeGeneratedTestImages()
}

await runner()
