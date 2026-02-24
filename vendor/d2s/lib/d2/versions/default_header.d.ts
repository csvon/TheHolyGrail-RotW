import * as types from "../types";
import { BitReader } from "../../binary/bitreader";
import { BitWriter } from "../../binary/bitwriter";
export declare function readHeader(char: types.ID2S, reader: BitReader, constants: types.IConstantData): void;
export declare function writeHeader(char: types.ID2S, writer: BitWriter, constants: types.IConstantData): void;
