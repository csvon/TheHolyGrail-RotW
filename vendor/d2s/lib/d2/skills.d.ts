import * as types from "./types";
import { BitReader } from "../binary/bitreader";
export declare function readSkills(char: types.ID2S, reader: BitReader, constants: types.IConstantData): Promise<void>;
export declare function writeSkills(char: types.ID2S, constants: types.IConstantData): Promise<Uint8Array>;
