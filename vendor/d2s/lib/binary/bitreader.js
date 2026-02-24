"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitReader = void 0;
var BitReader = /** @class */ (function () {
    function BitReader(arrBuffer) {
        var _this = this;
        this.littleEndian = true;
        this.offset = 0;
        var typedArray = new Uint8Array(arrBuffer);
        this.bits = new Uint8Array(typedArray.length * 8);
        typedArray.reduce(function (acc, c) {
            var b = c
                .toString(2)
                .padStart(8, "0")
                .split("")
                .reverse()
                .map(function (e) { return parseInt(e, 2); });
            b.forEach(function (bit) { return (_this.bits[acc++] = bit); });
            return acc;
        }, 0);
    }
    BitReader.prototype.ReadBit = function () {
        return this.bits[this.offset++];
    };
    BitReader.prototype.ReadBitArray = function (count) {
        var bits = new Uint8Array(count);
        for (var i = 0; i < count; i++) {
            bits[i] = this.bits[this.offset++];
        }
        return bits;
    };
    BitReader.prototype.ReadBits = function (bytes, count) {
        var byteIndex = 0;
        var bitIndex = 0;
        for (var i = 0; i < count; i++) {
            if (this.bits[this.offset + i]) {
                bytes[byteIndex] |= (1 << bitIndex) & 0xff;
            }
            bitIndex++;
            if (bitIndex == 8) {
                byteIndex++;
                bitIndex = 0;
            }
        }
        this.offset += count;
        return bytes;
    };
    BitReader.prototype.ReadBytes = function (bytes) {
        return this.ReadBits(new Uint8Array(bytes), bytes * 8);
    };
    BitReader.prototype.ReadArray = function (bytes) {
        return this.ReadBytes(bytes);
    };
    BitReader.prototype.ReadByte = function (bits) {
        if (bits === void 0) { bits = 8; }
        var dataview = new DataView(this.ReadBits(new Uint8Array(1), bits).buffer);
        return dataview.getUint8(0);
    };
    BitReader.prototype.ReadUInt8 = function (bits) {
        if (bits === void 0) { bits = 8; }
        return this.ReadByte(bits);
    };
    BitReader.prototype.ReadUInt16 = function (bits) {
        if (bits === void 0) { bits = 8 * 2; }
        var dataview = new DataView(this.ReadBits(new Uint8Array(2), bits).buffer);
        return dataview.getUint16(0, this.littleEndian);
    };
    BitReader.prototype.ReadUInt32 = function (bits) {
        if (bits === void 0) { bits = 8 * 4; }
        var dataview = new DataView(this.ReadBits(new Uint8Array(4), bits).buffer);
        return dataview.getUint32(0, this.littleEndian);
    };
    BitReader.prototype.ReadString = function (bytes) {
        var buffer = this.ReadBytes(bytes).buffer;
        return new TextDecoder().decode(buffer);
    };
    BitReader.prototype.ReadNullTerminatedString = function () {
        var start = this.offset;
        while (this.ReadByte()) { }
        var end = this.offset - 8;
        var buffer = this.SeekBit(start).ReadBytes((end - start) / 8);
        this.SeekBit(end + 8);
        return new TextDecoder().decode(buffer);
    };
    BitReader.prototype.SkipBits = function (number) {
        this.offset += number;
        return this;
    };
    BitReader.prototype.SkipBytes = function (number) {
        return this.SkipBits(number * 8);
    };
    BitReader.prototype.SeekBit = function (offset) {
        this.offset = offset;
        return this;
    };
    BitReader.prototype.SeekByte = function (offset) {
        return this.SeekBit(offset * 8);
    };
    BitReader.prototype.Align = function () {
        this.offset = (this.offset + 7) & ~7;
        return this;
    };
    return BitReader;
}());
exports.BitReader = BitReader;
//# sourceMappingURL=bitreader.js.map