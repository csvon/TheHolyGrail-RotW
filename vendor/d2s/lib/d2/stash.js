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
exports.write = exports.read = void 0;
var types = __importStar(require("./types"));
var bitwriter_1 = require("../binary/bitwriter");
var items = __importStar(require("./items"));
var attribute_enhancer_1 = require("./attribute_enhancer");
var bitreader_1 = require("../binary/bitreader");
var constants_1 = require("./constants");
var defaultConfig = {
    extendedStash: false,
};
function read(buffer, constants, version, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var stash, reader, config, firstHeader, pageCount, saveVersion, saveVersion;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stash = {};
                    reader = new bitreader_1.BitReader(buffer);
                    config = Object.assign(defaultConfig, userConfig);
                    firstHeader = reader.ReadUInt32();
                    reader.SeekByte(0);
                    if (!(firstHeader == 0xaa55aa55)) return [3 /*break*/, 5];
                    stash.pages = [];
                    pageCount = 0;
                    _a.label = 1;
                case 1:
                    if (!(reader.offset < reader.bits.length)) return [3 /*break*/, 4];
                    pageCount++;
                    return [4 /*yield*/, readStashHeader(stash, reader)];
                case 2:
                    _a.sent();
                    saveVersion = version || parseInt(stash.version);
                    if (!constants) {
                        constants = constants_1.getConstantData(saveVersion);
                    }
                    return [4 /*yield*/, readStashPart(stash, reader, saveVersion, constants)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4:
                    stash.pageCount = pageCount;
                    return [3 /*break*/, 8];
                case 5: return [4 /*yield*/, readStashHeader(stash, reader)];
                case 6:
                    _a.sent();
                    saveVersion = version || parseInt(stash.version);
                    if (!constants) {
                        constants = constants_1.getConstantData(saveVersion);
                    }
                    return [4 /*yield*/, readStashPages(stash, reader, saveVersion, constants)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [2 /*return*/, stash];
            }
        });
    });
}
exports.read = read;
function readStashHeader(stash, reader) {
    return __awaiter(this, void 0, void 0, function () {
        var header;
        return __generator(this, function (_a) {
            header = reader.ReadUInt32();
            switch (header) {
                // Resurrected
                case 0xaa55aa55:
                    stash.type = types.EStashType.shared;
                    stash.hardcore = reader.ReadUInt32() == 0;
                    stash.version = reader.ReadUInt32().toString();
                    stash.sharedGold = reader.ReadUInt32();
                    reader.ReadUInt32(); // size of the sector
                    reader.SkipBytes(44); // empty
                    break;
                // LoD
                case 0x535353: // SSS
                case 0x4d545343: // CSTM
                    stash.version = reader.ReadString(2);
                    if (stash.version !== "01" && stash.version !== "02") {
                        throw new Error("unkown stash version " + stash.version + " at position " + (reader.offset - 2 * 8));
                    }
                    stash.type = header === 0x535353 ? types.EStashType.shared : types.EStashType.private;
                    if (stash.type === types.EStashType.shared && stash.version == "02") {
                        stash.sharedGold = reader.ReadUInt32();
                    }
                    if (stash.type === types.EStashType.private) {
                        reader.ReadUInt32();
                        stash.sharedGold = 0;
                    }
                    stash.pageCount = reader.ReadUInt32();
                    break;
                default:
                    debugger;
                    throw new Error("shared stash header 'SSS' / 0xAA55AA55 / private stash header 'CSTM' not found at position " + (reader.offset - 3 * 8));
            }
            return [2 /*return*/];
        });
    });
}
function readStashPages(stash, reader, version, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stash.pages = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < stash.pageCount)) return [3 /*break*/, 4];
                    return [4 /*yield*/, readStashPage(stash, reader, version, constants)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function readStashPage(stash, reader, version, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var page, header, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    page = {
                        items: [],
                        name: "",
                        type: 0,
                    };
                    header = reader.ReadString(2);
                    if (header !== "ST") {
                        throw new Error("can not read stash page header ST at position " + (reader.offset - 2 * 8));
                    }
                    page.type = reader.ReadUInt32();
                    page.name = reader.ReadNullTerminatedString();
                    _a = page;
                    return [4 /*yield*/, items.readItems(reader, version, constants, defaultConfig)];
                case 1:
                    _a.items = _b.sent();
                    attribute_enhancer_1.enhanceItems(page.items, constants, 1);
                    stash.pages.push(page);
                    return [2 /*return*/];
            }
        });
    });
}
function readStashPart(stash, reader, version, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var page, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    page = {
                        items: [],
                        name: "",
                        type: 0,
                    };
                    _a = page;
                    return [4 /*yield*/, items.readItems(reader, version, constants, defaultConfig)];
                case 1:
                    _a.items = _b.sent();
                    attribute_enhancer_1.enhanceItems(page.items, constants, 1);
                    stash.pages.push(page);
                    return [2 /*return*/];
            }
        });
    });
}
function write(data, constants, version, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var config, writer, _i, _a, page, _b, _c, _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    config = Object.assign(defaultConfig, userConfig);
                    writer = new bitwriter_1.BitWriter();
                    if (!constants) {
                        constants = constants_1.getConstantData(version);
                    }
                    if (!(version > 0x61)) return [3 /*break*/, 5];
                    _i = 0, _a = data.pages;
                    _h.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    page = _a[_i];
                    _c = (_b = writer).WriteArray;
                    return [4 /*yield*/, writeStashSection(data, page, constants, config)];
                case 2:
                    _c.apply(_b, [_h.sent()]);
                    _h.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 8];
                case 5:
                    _e = (_d = writer).WriteArray;
                    return [4 /*yield*/, writeStashHeader(data)];
                case 6:
                    _e.apply(_d, [_h.sent()]);
                    _g = (_f = writer).WriteArray;
                    return [4 /*yield*/, writeStashPages(data, version, constants, config)];
                case 7:
                    _g.apply(_f, [_h.sent()]);
                    _h.label = 8;
                case 8: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.write = write;
function writeStashHeader(data) {
    return __awaiter(this, void 0, void 0, function () {
        var writer;
        return __generator(this, function (_a) {
            writer = new bitwriter_1.BitWriter();
            if (data.type === types.EStashType.private) {
                writer.WriteString("CSTM", 4);
            }
            else {
                writer.WriteString("SSS", 4);
            }
            writer.WriteString(data.version, data.version.length);
            if (data.type === types.EStashType.private) {
                writer.WriteString("", 4);
            }
            else {
                if (data.version == "02") {
                    writer.WriteUInt32(data.sharedGold);
                }
            }
            writer.WriteUInt32(data.pages.length);
            return [2 /*return*/, writer.ToArray()];
        });
    });
}
function writeStashSection(data, page, constants, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b, size;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteUInt32(0xaa55aa55);
                    writer.WriteUInt32(data.hardcore ? 0 : 1);
                    writer.WriteUInt32(0x62);
                    writer.WriteUInt32(data.sharedGold);
                    writer.WriteUInt32(0); // size of the sector, to be fixed later
                    writer.WriteBytes(new Uint8Array(44).fill(0)); // empty
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, items.writeItems(page.items, 0x62, constants, userConfig)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    size = writer.offset;
                    writer.SeekByte(16);
                    writer.WriteUInt32(Math.ceil(size / 8));
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
function writeStashPages(data, version, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < data.pages.length)) return [3 /*break*/, 4];
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeStashPage(data.pages[i], version, constants, config)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
function writeStashPage(data, version, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteString("ST", 2);
                    writer.WriteUInt32(data.type);
                    writer.WriteString(data.name, data.name.length + 1);
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, items.writeItems(data.items, version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
//# sourceMappingURL=stash.js.map