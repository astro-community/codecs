export interface Image {
	data: Uint8ClampedArray,
	width: number
	height: number
}

export interface BlurhashImage {
	data: string,
	width: number
	height: number
}

export interface AvifEncodeOptions {
	cqLevel: number
	cqAlphaLevel: number
	denoiseLevel: number
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
	level: number
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
	quality: number
	alpha_quality: number
	effort: number
	pass: number
	sns: number
	uv_mode: number
	csp_type: number
	error_diffusion: number
	use_random_matrix: boolean
}

export interface BlurOptions {
	radius: number
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

export interface BlurhashDecodeOptions {
	width: number
	height: number
	punch: number
	size: number
}

export interface BlurhashEncodeOptions {
	component: number
	componentX: number
	componentY: number
}

export type ResizeMethod = 'triangle' | 'catrom' | 'mitchell' | 'lanczos3'

export type ImageType = 'image/avif' | 'image/gif' | 'image/jpeg' | 'image/jxl' | 'image/png' | 'image/svg+xml' | 'image/webp' | 'image/webp2'

export type ExtensionType = 'avif' | 'jpg' | 'jxl' | 'png' | 'webp' | 'wp2'

export declare const avif: {
	encode(image: Image, options?: Partial<AvifEncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const jpg: {
	encode(image: Image, options?: Partial<JpgEncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const jxl: {
	encode(image: Image, options?: Partial<JxlEncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const png: {
	encode(image: Image, options?: Partial<PngEncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const webp: {
	encode(image: Image, options?: Partial<WebpEncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const wp2: {
	encode(image: Image, options?: Partial<Wp2EncodeOptions>): Promise<Uint8Array>
	decode(uint: Uint8Array): Promise<Image>
}

export declare const blurhash: {
	encode(image: Image, options?: Partial<BlurhashEncodeOptions>): Promise<BlurhashImage>
	decode(image: BlurhashImage, options?: Partial<BlurhashDecodeOptions>): Promise<Image>
}

/** Returns a new image that has been blurred. */
export declare const blur: (image: Image, options?: Partial<BlurOptions>) => Promise<Image>

/** Returns a new image that has been resized. */
export declare const resize: (image: Image, options?: Partial<ResizeOptions>) => Promise<Image>

/** Returns the extension associated with the given image. */
export declare const getExtension: (data: Uint8Array) => ExtensionType | ''

/** Returns the content type associated with the given image. */
export declare const getType: (data: Uint8Array) => ImageType | ''
