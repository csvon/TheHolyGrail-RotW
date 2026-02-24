"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixHeader = exports.writeHeaderData = exports.writeHeader = exports.readHeaderData = exports.readHeader = void 0;
var bitwriter_1 = require("../binary/bitwriter");
function readHeader(char, reader) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            char.header = {};
            //0x0000
            char.header.identifier = reader.ReadUInt32().toString(16).padStart(8, "0");
            if (char.header.identifier != "aa55aa55") {
                throw new Error("D2S identifier 'aa55aa55' not found at position " + (reader.offset - 4 * 8));
            }
            //0x0004
            char.header.version = reader.ReadUInt32();
            return [2 /*return*/];
        });
    });
}
exports.readHeader = readHeader;
function readHeaderData(char, reader, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var v;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _versionSpecificHeader(char.header.version)];
                case 1:
                    v = _a.sent();
                    if (v == null) {
                        throw new Error("Cannot parse version: " + char.header.version);
                    }
                    v.readHeader(char, reader, constants);
                    return [2 /*return*/];
            }
        });
    });
}
exports.readHeaderData = readHeaderData;
function writeHeader(char) {
    return __awaiter(this, void 0, void 0, function () {
        var writer;
        return __generator(this, function (_a) {
            writer = new bitwriter_1.BitWriter();
            writer.WriteUInt32(parseInt(char.header.identifier, 16)).WriteUInt32(char.header.version);
            return [2 /*return*/, writer.ToArray()];
        });
    });
}
exports.writeHeader = writeHeader;
function writeHeaderData(char, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, v;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    return [4 /*yield*/, _versionSpecificHeader(char.header.version)];
                case 1:
                    v = _a.sent();
                    if (v == null) {
                        throw new Error("Cannot parse version: " + char.header.version);
                    }
                    v.writeHeader(char, writer, constants);
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeHeaderData = writeHeaderData;
function fixHeader(writer) {
    return __awaiter(this, void 0, void 0, function () {
        var checksum, eof, i, byte;
        return __generator(this, function (_a) {
            checksum = 0;
            eof = writer.length / 8;
            writer.SeekByte(0x0008).WriteUInt32(eof);
            writer.SeekByte(0x000c).WriteUInt32(0);
            for (i = 0; i < eof; i++) {
                byte = writer.SeekByte(i).PeekBytes(1)[0];
                if (checksum & 0x80000000) {
                    byte += 1;
                }
                checksum = byte + checksum * 2;
                //hack make it a uint32
                checksum >>>= 0;
            }
            //checksum pos
            writer.SeekByte(0x000c).WriteUInt32(checksum);
            return [2 /*return*/];
        });
    });
}
exports.fixHeader = fixHeader;
/**
 * Save Version
 * 0x47, 0x0, 0x0, 0x0 = <1.06
 * 0x59, 0x0, 0x0, 0x0 = 1.08 = version
 * 0x5c, 0x0, 0x0, 0x0 = 1.09 = version
 * 0x60, 0x0, 0x0, 0x0 = 1.13c = version
 * 0x62, 0x0, 0x0, 0x0 = 1.2 = version
 * */
function _versionSpecificHeader(version) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = version;
                    switch (_a) {
                        case 0x60: return [3 /*break*/, 1];
                    }
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./versions/default_header")); })];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require("./versions/default_header")); })];
                case 4: return [2 /*return*/, _b.sent()];
            }
        });
    });
}
//# sourceMappingURL=header.js.map