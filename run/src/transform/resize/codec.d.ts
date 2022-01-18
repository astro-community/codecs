import { DecodedImage, ResizeOptions } from '../../codecs.d'

export { DecodedImage, ResizeOptions }

/** Returns a new resized image from a given decoded image. */
export declare const resize: {
	<T extends DecodedImage = DecodedImage, T1 extends number = number, T2 extends number = number>(
		image: T,
		options?: Partial<ResizeOptions> & Partial<{ width: T1, height: T2 }>
	): DecodedImage<T['data'], number extends T1 ? T['width'] : T1, number extends T2 ? T['height'] : T2>
} 
