export declare class BitReader {
    littleEndian: boolean;
    bits: Uint8Array;
    offset: number;
    constructor(arrBuffer: ArrayBuffer);
    ReadBit(): number;
    ReadBitArray(count: number): Uint8Array;
    ReadBits(bytes: Uint8Array, count: number): Uint8Array;
    ReadBytes(bytes: number): Uint8Array;
    ReadArray(bytes: number): Uint8Array;
    ReadByte(bits?: number): number;
    ReadUInt8(bits?: number): number;
    ReadUInt16(bits?: number): number;
    ReadUInt32(bits?: number): number;
    ReadString(bytes: number): string;
    ReadNullTerminatedString(): string;
    SkipBits(number: number): BitReader;
    SkipBytes(number: number): BitReader;
    SeekBit(offset: number): BitReader;
    SeekByte(offset: number): BitReader;
    Align(): BitReader;
}
