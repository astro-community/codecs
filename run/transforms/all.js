import * as JS from '../lib/js.js'

export const build = (program) => {
	// extract the inner contents of the file
	const inner1 = program.body.find(node => node.type === 'VariableDeclaration')
	const inner2 = inner1.declarations[0]
	const inner3 = inner2.init.callee.body
	const inner4 = inner3.body.find(node => node.type === 'ReturnStatement')
	const inner5 = inner4.argument.body

	program.body.splice(0, program.body.length, ...inner5.body.slice(2, -2))

	// remove these unnecessary expressions
	program.find('ExpressionStatement', (node) => {
		switch (node.expression?.left?.name) {
			case 'args':
				node.remove()
				return
		}
	})

	// remove these unnecessary variable declarations
	program.find('VariableDeclarator', (node) => {
		switch (node.id?.name) {
			case 'ENVIRONMENT_IS_NODE':
			case 'ENVIRONMENT_IS_SHELL':
			case 'ENVIRONMENT_IS_WORKER':
			case 'ENVIRONMENT_IS_WEB':
			case 'arguments_':
			case 'asm':
			case 'dataURIPrefix':
			case 'nodeFS':
			case 'nodePath':
			case 'read_':
			case 'scriptDirectory':
			case 'wasmBinary':
				node.parentNode.remove()
				return
		}
	})

	// remove these unnecessary if statements
	program.find('IfStatement', (node) => {
		switch (node.test.name) {
			case 'ENVIRONMENT_IS_WORKER':
			case 'ENVIRONMENT_IS_NODE':
			case '_scriptDir':
				node.remove()
				return
		}

		switch (node.test.left?.name) {
			case 'ENVIRONMENT_IS_WEB':
				node.remove()
				return
		}

		switch (node.test.object?.name) {
			case 'Module':
				if (node.parentNode.type === 'Program') {
					node.remove()
				}
				return
		}
	})

	// remove these unnecessary function declarations
	program.find('FunctionDeclaration', (node) => {
		switch (node.id?.name) {
			case 'emval_get_global':
			case 'getBinary':
			case 'getBinaryPromise':
			case 'instantiateAsync':
			case 'isDataURI':
			case 'locateFile':
				node.remove()
				return
			case 'run':
				node.params[0].name = 'wasmBinary'
				node.body.body.unshift(
					JS.parse('if (wasmBinary) createWasm(wasmBinary)')
				)
				return
		}
	})

	// update the createWasm function
	program.find('FunctionDeclaration', (node) => {
		switch (node.id?.name) {
			case 'createWasm':
				node.params.push(
					JS.Identifier({ name: 'wasmBinary' })
				)
				return
		}
	})

	// update the instantiateAsync and getBinaryPromise call expressions
	program.find('CallExpression', (node) => {
		switch (node.callee?.name) {
			case 'emval_get_global': {
				const { parentNode } = node
				if (parentNode.type === 'CallExpression') {
					node.replaceWith(
						JS.Identifier({ name: 'globalThis' })
					)
				} else {
					node.replaceWith(
						JS.MemberExpression({
							object: JS.Identifier({ name: 'Module' }),
							property: JS.Identifier({ name: 'globalThis' }),
						})
					)
					parentNode.replaceWith(
						JS.LogicalExpression({
							left: JS.MemberExpression({
								object: JS.Identifier({ name: 'globalThis' }),
								property: JS.Identifier({ name: 'name' }),
								computed: true,
							}),
							operator: '||',
							right: JS.MemberExpression({
								object: JS.MemberExpression({
									object: JS.Identifier({ name: 'Module' }),
									property: JS.Identifier({ name: 'globalThis' }),
								}),
								property: JS.Identifier({ name: 'name' }),
								computed: true,
							}),
						})
					)
				}
				return
			}
			case 'instantiateAsync':
				node.callee.name = 'instantiateArrayBuffer'
				node.arguments.push(JS.Identifier({ name: 'receiveInstantiationResult' }))
				let parentNode = node.parentNode
				while (parentNode.type !== 'CallExpression') parentNode = parentNode.parentNode
				parentNode.replaceWith(
					JS.ReturnStatement({
						argument: parentNode
					})
				)
				return
			case 'getBinaryPromise':
				node.callee.replaceWith(
					JS.MemberExpression({
						object: JS.Identifier({ name: 'Promise' }),
						property: JS.Identifier({ name: 'resolve' }),
					})
				)
				node.arguments.push(
					JS.Identifier('wasmBinary')
				)
				return
		}
	})

	// cleanup member expressions
	program.find('MemberExpression', (node) => {
		if (node.property?.type === 'Literal' && /^[A-Za-z_][0-9A-Za-z_]*$/.test(node.property?.value || '')) {
			node.property = JS.Identifier({ name: node.property.value })
			node.computed = false
		}
	})

	program.body.unshift(
		...JS.parse(`export const Module = {}`).body
	)
}
