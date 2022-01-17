import { polyfill } from '@astropub/webapi'
import { GENERATOR, generate } from 'astring'
// import { LooseParser } from 'acorn-loose'
import { Node, Parser } from 'acorn'
import { importAssertions } from 'acorn-import-assertions'
import acornClassFields from 'acorn-class-fields'
import acornLogicalAssignment from 'acorn-logical-assignment'
import acornPrivateMethods from 'acorn-private-methods'

polyfill(globalThis)

// Parser.acorn.Parser = LooseParser
// LooseParser.acorn = Parser.acorn
// for (const [name, data] of Object.entries(Object.getOwnPropertyDescriptors(Parser.prototype))) {
// 	if (!Object.hasOwn(LooseParser.prototype, name) && !name.startsWith('in')) {
// 		Object.defineProperty(LooseParser.prototype, name, data)
// 		if (name === 'type') console.log({ name })
// 	}
// }
// LooseParser.prototype.shouldParseExportStatement = Parser.prototype.shouldParseExportStatement

const acornPlugins = [
	// acornClassFields,
	// acornLogicalAssignment,
	// acornPrivateMethods,
	importAssertions,
]

const prototype = Node.prototype

const parser = Parser.extend(...acornPlugins)

const parserOptions = {
	allowReturnOutsideFunction: true,
	allowImportExportEverywhere: true,
	allowAwaitOutsideFunction: true,
	allowSuperOutsideMethod: true,
	allowReserved: true,
	ecmaVersion: 'latest',
	locations: true,
	sourceType: 'module',
}

export const parse = (code) => {
	const onComment = []
	const ast = parser.parse(code, { ...parserOptions, onComment })

	ast.find('*', node => {
		for (const comment of onComment) {
			if (
				node.loc?.start.line >= comment.loc.start.line &&
				node.loc?.start.column >= comment.loc.start.column
			) {
				node.parentNode.comments = node.parentNode.comments || []
				node.parentNode.comments.push(
					...onComment.splice(onComment.indexOf(comment), 1)
				)
			}
		}
	})

	return ast
}

const customGenerator = Object.assign({}, GENERATOR, {})

export const stringify = (/** @type {Node} */ node) => generate(node, { comments: true, indent: '\t', generator: customGenerator })

export const createNode = (/** @type {keyof typeof defaultNodeProps} */ type, /** @type {{ (value: any): Record<string, any> }} */ func = Object) => (/** @type {Record<string, any>} */ props) => Object.assign(Object.create(prototype), { type, ...defaultNodeProps[type], ...func(props) })

const toRawPropertyValue = (/** @type {string} */ value) => (
	!value.includes(`'`) ? `'${value}'` :
	!value.includes('"') ? `"${value}"` :
	JSON.stringify(value)
)

const defaultNodeProps = {
	ArrowFunctionExpression: {
		expression: false,
		generator: false,
		async: false,
		params: [],
		body: null,
	},
	AssignmentExpression: {
		operator: '=',
		left: null,
		right: null,
	},
	BlockStatement: {
		body: [],
	},
	CallExpression: {
		callee: null,
		arguments: [],
		optional: false,
	},
	CatchClause: {
		param: null,
		body: { type: 'BlockStatement', body: [] }
	},
	ExportNamedDeclaration: {
		declaration: null,
		specifiers: []
	},
	ExportSpecifier: {
		local: null,
		exported: null,
	},
	ExpressionStatement: {
		expression: {
			operator: '=',
			left: null,
			right: null,
		},
	},
	Identifier: { name: '_' },
	ImportDefaultSpecifier: {
		local: null
	},
	ImportDeclaration: {
		specifiers: [],
		source: null,
	},
	Literal: {
		value: '_',
		raw: '\'_\'',
		optional: false,
	},
	LogicalExpression: {
		left: null,
		operator: '||',
		right: null,
	},
	MemberExpression: {
		object: null,
		property: null,
		computed: false,
		optional: false,
	},
	NewExpression: {
		callee: null,
		arguments: [],
	},
	ObjectExpression: {
		properties: [],
	},
	ObjectPattern: {
		properties: [],
	},
	Program: {
		body: [],
	},
	Property: {
		method: false,
		shorthand: false,
		computed: false,
		key: null,
		value: null,
		kind: 'init',
	},
	RestElement: {
		argument: null,
	},
	ReturnStatement: {
		argument: null,
	},
	TryStatement: {
		block: null,
		handler: null,
		finalizer: null,
	},
	UnaryExpression: {
		operator: '!',
		prefix: true,
		argument: null,
	},
	VariableDeclaration: {
		declarations: [],
		kind: 'var',
	},
	VariableDeclarator: {
		id: null,
		init: {
			type: 'CallExpression',
			callee: null,
			arguments: [],
		}
	},
}

export const ArrowFunctionExpression = createNode('ArrowFunctionExpression')
export const AssignmentExpression = createNode('AssignmentExpression')
export const BlockStatement = createNode('BlockStatement')
export const CallExpression = createNode('CallExpression')
export const CatchClause = createNode('CatchClause')
export const ExportNamedDeclaration = createNode('ExportNamedDeclaration')
export const ExportSpecifier = createNode('ExportSpecifierExportSpecifier')
export const ExpressionStatement = createNode('ExpressionStatement')
export const Identifier = createNode('Identifier', (value) => value === Object(value) ? value : { name: value })
export const ImportDeclaration = createNode('ImportDeclaration')
export const ImportDefaultSpecifier = createNode('ImportDefaultSpecifier')
export const Literal = createNode('Literal', (value) => value === Object(value) ? value : { value, raw: toRawPropertyValue(value) })
export const LogicalExpression = createNode('LogicalExpression')
export const MemberExpression = createNode('MemberExpression')
export const NewExpression = createNode('NewExpression')
export const ObjectExpression = createNode('ObjectExpression')
export const Program = createNode('Program')
export const Property = createNode('Property')
export const ReturnStatement = createNode('ReturnStatement')
export const TryStatement = createNode('TryStatement')
export const UnaryExpression = createNode('UnaryExpression')
export const VariableDeclaration = createNode('VariableDeclaration')
export const VariableDeclarator = createNode('VariableDeclarator')

const parents = new WeakMap()

const createPrototypeOf = (value) => value == null ? value : Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))

const keyOfParent = (object) => (parents.get(object) || [])[0] || null
const parentOf = (object) => (parents.get(object) || [])[1] || null

const find = (node, type, next) => {
	if (node.type === type) {
		if (next) next(node)
		else return node
	}

	for (let name in node) {
		if (name === 'type') continue

		const data = node[name]

		if (Array.isArray(data)) {
			parents.set(data, this)

			for (let each of data.slice(0)) {
				if (each instanceof Node) {
					parents.set(each, data)

					const deep = find(each, type, next)

					if (deep && !next) return deep
				}
			}
		} else if (data instanceof Node) {
			parents.set(data, this)

			const deep = find(data, type, next)

			if (deep && !next) return deep
		}
	}
	return null
}

Object.defineProperties(prototype, {
	clone: {
		value: {
			clone(overrides) {
				const process = (object) => {
					const clone = createPrototypeOf(object)

					for (let name of Object.keys(object)) {
						if (object[name] instanceof Object) {
							clone[name] = process(object[name])

							parents.set(clone[name], [name, clone])
						} else {
							clone[name] = object[name]
						}
					}

					return clone
				}

				return Object.assign(process(this), overrides)
			}
		}.clone,
		configurable: true,
		writable: true,
	},
	find: {
		value: {
			find(type, call) {
				const find = (object) => {
					if (type === '*' || object.type === type) call(object)

					for (let [name, data] of Object.entries(object)) {
						if (data instanceof Object) {
							parents.set(data, [name, object])

							find(data)
						}
					}
				}

				find(this)
			}
		}.find,
		configurable: true,
		writable: true,
	},
	parent: {
		get: {
			parent() {
				return (parents.get(this) || [])[1] || null
			},
		}.parent,
		configurable: true,
	},
	parentNode: {
		get: {
			parentNode() {
				let object = this

				while (true) {
					object = parentOf(object)
					if (object == null) return null
					if (object instanceof Array) continue
					return object
				}
			},
		}.parentNode,
		configurable: true,
	},
	keyOfParent: {
		get: {
			keyOfParent() {
				return (parents.get(this) || [])[0] || null
			}
		}.keyOfParent,
		configurable: true,
	},
	keyOfParentNode: {
		get: {
			keyOfParentNode() {
				let object = this, key

				while (true) {
					key = keyOfParent(object)
					object = parentOf(object)
					if (object == null) return null
					if (Array.isArray(object)) continue
					return key
				}
			},
		}.keyOfParentNode,
		configurable: true,
	},
	after: {
		value: {
			after(...nodes) {
				const [_name, node] = parents.get(this) || []

				if (!node) return

				if (Array.isArray(node)) {
					const index = node.indexOf(this)

					node.splice(index + 1, 0, ...nodes)
				}
			}
		}.after,
		configurable: true,
		writable: true,
	},
	before: {
		value: {
			before(...nodes) {
				const [_name, node] = parents.get(this) || []

				if (!node) return

				if (Array.isArray(node)) {
					const index = node.indexOf(this)

					node.splice(index, 0, ...nodes)
				}
			}
		}.before,
		configurable: true,
		writable: true,
	},
	remove: {
		value: {
			remove() {
				return this.replaceWith()
			}
		}.remove,
		configurable: true,
		writable: true,
	},
	replaceWith: {
		value: {
			replaceWith(...nodes) {
				const [name, node] = parents.get(this) || []

				if (!node) return

				if (Array.isArray(node)) {
					const index = node.indexOf(this)
					if (index > -1) node.splice(index, 1, ...nodes)
				} else {
					node[name] = Array.isArray(node[name]) || nodes.length > 1 ? nodes : nodes[0] || null
				}

				parents.delete(this)
			}
		}.replaceWith,
		configurable: true,
		writable: true,
	},
	toString: {
		value: {
			toString() {
				return stringify(this)
			},
		}.toString,
		configurable: true,
		writable: true,
	},
})
