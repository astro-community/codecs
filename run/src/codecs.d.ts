// image interfaces
// ----------------------------------------

export declare class DecodedImage<
	D extends Uint8ClampedArray = Uint8ClampedArray,
	W extends number = number,
	H extends number = number
> {
	constructor(data: D, width: W, height: H)

	data: D
	width: W
	height: H

	readonly color: [number, number, number]

	readonly style: { aspectRatio: string, backgroundColor: string, height: string, width: string }

	encode<T extends ImageType>(type: T, options?: Partial<EncodeOptions<T>>): Promise<EncodedImage<T, D, W, H>>

	blur(options?: Partial<BlurOptions>): Promise<DecodedImage<D, W, H>>

	blurhash(options?: Partial<BlurHashOptions>): Promise<BlurHashImage<string, D, W, H>>

	resize<W extends number, H extends number>(options: Partial<ResizeOptions> & Partial<{ width: W, height: H }>): Promise<DecodedImage<D, W, H>>
}

export declare class BlurHashImage<
	S extends string = string,
	D extends Uint8Array = Uint8Array,
	W extends number = number,
	H extends number = number
> extends DecodedImage<D, W, H> {
	constructor(hash: S, data: D, width: W, height: H)

	hash: S
}

export declare class EncodedImage<
	T extends ImageType = ImageType,
	D extends Uint8Array = Uint8Array,
	W extends number = number,
	H extends number = number
> {
	constructor(type: T, data: D, width: W, height: H)

	type: T
	data: D
	width: W
	height: H
	ext: ExtensionType<T>

	decode(): Promise<DecodedImage<Uint8ClampedArray, W, H>>
}

// encoding options
// ----------------------------------------

export interface AvifEncodeOptions {
	cqLevel: number
	cqAlphaLevel: number
	denoiseLevel: number
	quality: number
	tileColsLog2: number
	tileRowsLog2: number
	speed: number
	subsample: number
	chromaDeltaQ: boolean
	sharpness: number
	tune: number
}

export interface JpgEncodeOptions {
	arithmetic: boolean
	auto_subsample: boolean
	baseline: boolean
	chroma_quality: number
	chroma_subsample: number
	color_space: number
	optimize_coding: boolean
	progressive: boolean
	quality: number
	quant_table: number
	separate_chroma_quality: boolean
	smoothing: number
	trellis_loops: number
	trellis_multipass: boolean
	trellis_opt_table: boolean
	trellis_opt_zero: boolean
}

export interface JxlEncodeOptions {
	decodingSpeedTier: number;
	effort: number;
	epf: number;
	lossyPalette: boolean;
	photonNoiseIso: number;
	progressive: boolean;
	quality: number;
}

export interface PngEncodeOptions {
	interlace: boolean
	level: 0 | 1 | 2 | 3
	quality: number
}

export interface WebpEncodeOptions {
	alpha_compression: number
	alpha_filtering: number
	alpha_quality: number
	autofilter: number
	emulate_jpeg_size: number
	exact: number
	filter_sharpness: number
	filter_strength: number
	filter_type: number
	image_hint: number
	lossless: number
	low_memory: number
	method: number
	near_lossless: number
	partition_limit: number
	partitions: number
	pass: number
	preprocessing: number
	quality: number
	segments: number
	show_compressed: number
	sns_strength: number
	target_PSNR: number
	target_size: number
	thread_level: number
	use_delta_palette: number
	use_sharp_yuv: number
}

export interface Wp2EncodeOptions {
	alpha_quality: number
	csp_type: number
	effort: number
	error_diffusion: number
	pass: number
	quality: number
	sns: number
	use_random_matrix: boolean
	uv_mode: number
}

// transform options
// ----------------------------------------

export interface BlurOptions {
	radius: number
}

export interface BlurHashOptions {
	component: number
	componentX: number
	componentY: number
	punch: number
	naturalWidth: number
	naturalHeight: number
	width: number
	height: number
	size: number
}

export interface ResizeOptions {
	height: number
	linearRGB: boolean
	naturalHeight: number
	naturalWidth: number
	premultiply: boolean
	resizeMethod: ResizeMethod
	width: number
}

export type ResizeMethod = 'triangle' | 'catrom' | 'mitchell' | 'lanczos3'

// utility types
// ----------------------------------------

/** Known image content types. */
export type ImageType = keyof CodecMap & keyof EncodeOptionsMap & keyof ExtensionMap

/** Known encoding options. */
export type Codec<K extends ImageType = ImageType> = CodecMap[K]

/** Known encoding options. */
export type EncodeOptions<K extends ImageType = ImageType> = EncodeOptionsMap[K]

/** Known image extensions. */
export type ExtensionType<K extends ImageType = ImageType> = ExtensionMap[K]

export interface CodecMap {
	'image/avif': typeof avif
	'image/gif': void
	'image/jpeg': typeof jpg
	'image/jxl': typeof jxl
	'image/png': typeof png
	'image/svg+xml': void
	'image/webp': typeof webp
	'image/webp2': typeof wp2
}

export interface EncodeOptionsMap {
	'image/avif': AvifEncodeOptions
	'image/gif': void
	'image/jpeg': JpgEncodeOptions
	'image/jxl': JxlEncodeOptions
	'image/png': PngEncodeOptions
	'image/svg+xml': void
	'image/webp': WebpEncodeOptions
	'image/webp2': Wp2EncodeOptions
}

export interface ExtensionMap {
	'image/avif': 'avif'
	'image/gif': 'gif'
	'image/jpeg': 'jpg'
	'image/jxl': 'jxl'
	'image/png': 'png'
	'image/svg+xml': 'svg'
	'image/webp': 'webp'
	'image/webp2': 'wp2'
}

export type CodecList = [ typeof avif, typeof jpg, typeof jxl, typeof png, typeof webp, typeof wp2 ]

// declarations
// ----------------------------------------

export declare const avif: {
	encode<T extends DecodedImage>(image: T, options?: Partial<AvifEncodeOptions>): Promise<EncodedImage<'image/avif', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

export declare const jpg: {
	encode<T extends DecodedImage>(image: T, options?: Partial<JpgEncodeOptions>): Promise<EncodedImage<'image/jpeg', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

export declare const jxl: {
	encode<T extends DecodedImage>(image: T, options?: Partial<JxlEncodeOptions>): Promise<EncodedImage<'image/jxl', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

export declare const png: {
	encode<T extends DecodedImage>(image: T, options?: Partial<PngEncodeOptions>): Promise<EncodedImage<'image/png', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

export declare const webp: {
	encode<T extends DecodedImage>(image: T, options?: Partial<WebpEncodeOptions>): Promise<EncodedImage<'image/webp', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

export declare const wp2: {
	encode<T extends DecodedImage>(image: T, options?: Partial<Wp2EncodeOptions>): Promise<EncodedImage<'image/webp2', T['data'], T['width'], T['height']>>
	decode(buffer: TypedArray): Promise<DecodedImage>
	test(buffer: TypedArray): boolean
}

/** Returns a new image that has been loaded and decoded. */
export declare const load: (source: string | URL | Response | TypedArray | Promise<string | URL | Response | TypedArray>) => Promise<EncodedImage>

/** Returns a new image that has been decoded. */
export declare const decode: <D extends TypedArray>(buffer: D) => Promise<DecodedImage>

/** Returns a new image that has been encoded. */
export declare const encode: <D extends DecodedImage, T extends ImageType>(image: D, type: T, options?: EncodeOptions<T>) => Promise<EncodedImage<T, D['data'], D['width'], D['height']>>

/** Returns a new decoded image with a blur applied. */
export declare const blur: <T extends DecodedImage>(image: T, options?: Partial<BlurOptions>) => Promise<DecodedImage<Uint8Array, T['width'], T['height']>>

/** Returns a new decoded image with a blurhash applied. */
export declare const blurhash: <T extends DecodedImage>(image: T, options?: Partial<BlurHashOptions>) => Promise<BlurHashImage<string, T['data'], T['width'], T['height']>>

/** Returns a new decoded image with a resize applied. */
export declare const resize: (image: DecodedImage, options?: Partial<ResizeOptions>) => Promise<DecodedImage>

/** Returns the extension associated with the given image. */
export declare const ext: (data: TypedArray) => ExtensionType | ''

/** Returns the content type associated with the given image. */
export declare const type: (data: TypedArray) => ImageType | ''

/** Returns the measurements associated with the given image. */
export declare const rect: (data: TypedArray) => { width: number, height: number } | null

export type TypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | BigUint64Array | BigInt64Array | Float32Array | Float64Array | ArrayBuffer
