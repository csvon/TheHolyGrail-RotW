import * as types from "./types";
import { BitReader } from "../binary/bitreader";
import { BitWriter } from "../binary/bitwriter";
export declare function readHeader(char: types.ID2S, reader: BitReader): Promise<void>;
export declare function readHeaderData(char: types.ID2S, reader: BitReader, constants: types.IConstantData): Promise<void>;
export declare function writeHeader(char: types.ID2S): Promise<Uint8Array>;
export declare function writeHeaderData(char: types.ID2S, constants: types.IConstantData): Promise<Uint8Array>;
export declare function fixHeader(writer: BitWriter): Promise<void>;
