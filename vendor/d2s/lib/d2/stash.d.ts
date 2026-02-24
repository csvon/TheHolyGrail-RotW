import * as types from "./types";
export declare function read(buffer: Uint8Array, constants?: types.IConstantData, version?: number | null, userConfig?: types.IConfig): Promise<types.IStash>;
export declare function write(data: types.IStash, constants: types.IConstantData, version: number, userConfig?: types.IConfig): Promise<Uint8Array>;
