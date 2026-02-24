export declare class BitWriter {
    littleEndian: boolean;
    bits: Uint8Array;
    offset: number;
    length: number;
    constructor(capacity?: number);
    WriteBit(value: number): BitWriter;
    WriteBits(bits: Uint8Array, numberOfBits: number): BitWriter;
    WriteBytes(bytes: Uint8Array, numberOfBits?: number): BitWriter;
    WriteArray(bytes: Uint8Array, numberOfBits?: number): BitWriter;
    WriteByte(value: number, numberOfBits?: number): BitWriter;
    WriteUInt8(value: number, numberOfBits?: number): BitWriter;
    WriteUInt16(value: number, numberOfBits?: number): BitWriter;
    WriteUInt32(value: number, numberOfBits?: number): BitWriter;
    WriteString(value: string, numberOfBytes: number): BitWriter;
    SeekBit(offset: number): BitWriter;
    SeekByte(offset: number): BitWriter;
    PeekBytes(count: number): Uint8Array;
    Align(): BitWriter;
    ToArray(): Uint8Array;
}
