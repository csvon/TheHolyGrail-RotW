"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitWriter = void 0;
var BitWriter = /** @class */ (function () {
    function BitWriter(capacity) {
        if (capacity === void 0) { capacity = 8192; }
        this.littleEndian = true;
        this.offset = 0;
        this.length = 0;
        this.bits = new Uint8Array(capacity);
    }
    BitWriter.prototype.WriteBit = function (value) {
        if (this.offset >= this.bits.length) {
            var resized = new Uint8Array(this.bits.length + 8192);
            resized.set(this.bits, 0);
            this.bits = resized;
        }
        this.bits[this.offset++] = value;
        if (this.offset > this.length)
            this.length++;
        return this;
    };
    BitWriter.prototype.WriteBits = function (bits, numberOfBits) {
        for (var i = 0; i < numberOfBits; i++) {
            this.WriteBit(bits[i]);
        }
        return this;
    };
    BitWriter.prototype.WriteBytes = function (bytes, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = bytes.length * 8; }
        var toWrite = new Uint8Array(numberOfBits);
        bytes.reduce(function (acc, c) {
            var b = c
                .toString(2)
                .padStart(8, "0")
                .split("")
                .reverse()
                .map(function (e) { return parseInt(e, 2); });
            b.forEach(function (bit) { return (toWrite[acc++] = bit); });
            return acc;
        }, 0);
        return this.WriteBits(toWrite, numberOfBits);
    };
    BitWriter.prototype.WriteArray = function (bytes, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = bytes.length * 8; }
        return this.WriteBytes(bytes, numberOfBits);
    };
    BitWriter.prototype.WriteByte = function (value, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = 8; }
        var buffer = new Uint8Array(1);
        new DataView(buffer.buffer).setUint8(0, value);
        return this.WriteBytes(buffer, numberOfBits);
    };
    BitWriter.prototype.WriteUInt8 = function (value, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = 8; }
        return this.WriteByte(value, numberOfBits);
    };
    BitWriter.prototype.WriteUInt16 = function (value, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = 8 * 2; }
        var buffer = new Uint8Array(2);
        new DataView(buffer.buffer).setUint16(0, value, this.littleEndian);
        return this.WriteBytes(buffer, numberOfBits);
    };
    BitWriter.prototype.WriteUInt32 = function (value, numberOfBits) {
        if (numberOfBits === void 0) { numberOfBits = 8 * 4; }
        var buffer = new Uint8Array(4);
        new DataView(buffer.buffer).setUint32(0, value, this.littleEndian);
        return this.WriteBytes(buffer, numberOfBits);
    };
    BitWriter.prototype.WriteString = function (value, numberOfBytes) {
        var buffer = new TextEncoder().encode(value);
        return this.WriteBytes(buffer, numberOfBytes * 8);
    };
    BitWriter.prototype.SeekBit = function (offset) {
        this.offset = offset;
        if (this.offset > this.length) {
            this.length = this.offset;
        }
        return this;
    };
    BitWriter.prototype.SeekByte = function (offset) {
        return this.SeekBit(offset * 8);
    };
    BitWriter.prototype.PeekBytes = function (count) {
        var buffer = new Uint8Array(count);
        var byteIndex = 0;
        var bitIndex = 0;
        for (var i = 0; i < count * 8; ++i) {
            if (this.bits[this.offset + i]) {
                buffer[byteIndex] |= (1 << bitIndex) & 0xff;
            }
            ++bitIndex;
            if (bitIndex >= 8) {
                ++byteIndex;
                bitIndex = 0;
            }
        }
        return buffer;
    };
    BitWriter.prototype.Align = function () {
        this.offset = (this.offset + 7) & ~7;
        if (this.offset > this.length) {
            this.length = this.offset;
        }
        return this;
    };
    BitWriter.prototype.ToArray = function () {
        var buffer = new Uint8Array((this.length - 1) / 8 + 1);
        var byteIndex = 0;
        var bitIndex = 0;
        for (var i = 0; i < this.length; ++i) {
            if (this.bits[i]) {
                buffer[byteIndex] |= (1 << bitIndex) & 0xff;
            }
            ++bitIndex;
            if (bitIndex >= 8) {
                ++byteIndex;
                bitIndex = 0;
            }
        }
        return buffer;
    };
    return BitWriter;
}());
exports.BitWriter = BitWriter;
//# sourceMappingURL=bitwriter.js.map