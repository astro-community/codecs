export { BlurHashImage, DecodedImage, EncodedImage } from '../codecs.d'

export declare const getPngSize: {
    (data: TypedArray): { width: number, height: number } | null
}

export declare const getWebpSize: {
    (data: TypedArray): { width: number, height: number } | null
}

export declare const object_assign: typeof Object.assign
export declare const object_freeze: typeof Object.freeze
export declare const object_isPrototypeOf: (target: any, Class: any) => boolean
