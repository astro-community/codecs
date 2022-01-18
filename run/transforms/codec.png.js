import * as JS from '../lib/js.js'

export const build = (program) => {
	// remove fallbacks
	program.find('IfStatement', (node) => {
		if (
			node.test?.left?.argument?.name === 'input' ||
			node.test?.left?.left?.left?.argument?.name === 'input'
		) {
			node.remove()
		} else if (
			node.test?.left?.left?.argument?.name === 'Response'
		) {
			node.replaceWith(
				...node.alternate.body
			)
		}
	})

	// remove await input
	program.find('AwaitExpression', (node) => {
		if (node.argument.name === 'input') {
			node.replaceWith(node.argument)
		}
	})

	program.find('NewExpression', (node) => {
		if (node.callee.name === 'ImageData') {
			node.replaceWith(
				JS.ObjectExpression({
					properties: [
						JS.Property({
							key: JS.Identifier({ name: 'data' }),
							value: node.arguments[0],
						}),
						JS.Property({
							key: JS.Identifier({ name: 'width' }),
							value: node.arguments[1],
						}),
						JS.Property({
							key: JS.Identifier({ name: 'height' }),
							value: node.arguments[2],
						})
					]
				})
			)
		}
	})

	program.find('FunctionDeclaration', (node) => {
		// remove load function
		if (node.id?.name === 'load') {
			node.remove()
		} else if (node.id?.name === 'init') {
			node.params[0].name = 'module'
		}
	})

	// replace webassembly await
	program.find('AwaitExpression', (node) => {
		if (node.argument.callee?.name === 'load') {
			const declaration = node.parentNode.parentNode
			const replacement = JS.parse('const { instance } = await WebAssembly.instantiate(module, imports)').body[0]

			declaration.replaceWith(replacement)
		}
	})
}
