export class Image<T1 extends Uint8ClampedArray = Uint8ClampedArray, T2 extends number = number, T3 extends number = number> {
	constructor(data: T1, width: T2, height: T3)

	data: T1
	width: T2
	height: T3

	encode(options: Partial<EncodeOptions>): Promise<Uint8Array>[]
}

export interface EncodeOptions {
	sizes: number[]
	types: ImageType[]
	resizeMethod: ResizeOptions
}

export type ImageType = 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'

export interface Codec {
	decode(data: Uint8Array): Promise<ImageData>
	encode(data: Uint8ClampedArray, width: number, height: number): Promise<Uint8Array>
}

export interface ResizeCodec {
	resize(data: Uint8ClampedArray, naturalWidth: number, naturalHeight: number, width: number, height: number, resizeMethodIndex: 0 | 1 | 2 | 3, premultiply: boolean, linearRGB: boolean): Promise<Uint8ClampedArray>
}

export interface ImageData {
	data: Uint8ClampedArray
	width: number
	height: number
}

export interface ResizeOptions {
	naturalWidth: number
	naturalHeight: number
	width: number
	height: number
	resizeMethod: ResizeMethod
	premultiply: boolean
	linearRGB: boolean
}

export type ResizeMethod = 'triangle' | 'catrom' | 'mitchell' | 'lanczos3'
