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
exports.writeItem = exports.readItem = exports.write = exports.read = exports.writer = exports.reader = void 0;
var header_1 = require("./header");
var attributes_1 = require("./attributes");
var bitreader_1 = require("../binary/bitreader");
var bitwriter_1 = require("../binary/bitwriter");
var skills_1 = require("./skills");
var items = __importStar(require("./items"));
var constants_1 = require("./constants");
var attribute_enhancer_1 = require("./attribute_enhancer");
var defaultConfig = {
    extendedStash: false,
    sortProperties: true,
};
function reader(buffer) {
    return new bitreader_1.BitReader(buffer);
}
exports.reader = reader;
function read(buffer, constants, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var char, reader, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    char = {};
                    reader = new bitreader_1.BitReader(buffer);
                    config = Object.assign(defaultConfig, userConfig);
                    return [4 /*yield*/, header_1.readHeader(char, reader)];
                case 1:
                    _a.sent();
                    //could load constants based on version here
                    if (!constants) {
                        constants = constants_1.getConstantData(char.header.version);
                    }
                    return [4 /*yield*/, header_1.readHeaderData(char, reader, constants)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, attributes_1.readAttributes(char, reader, constants)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, skills_1.readSkills(char, reader, constants)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, items.readCharItems(char, reader, constants, config)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, items.readCorpseItems(char, reader, constants, config)];
                case 6:
                    _a.sent();
                    if (!char.header.status.expansion) return [3 /*break*/, 9];
                    return [4 /*yield*/, items.readMercItems(char, reader, constants, config)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, items.readGolemItems(char, reader, constants, config)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [4 /*yield*/, attribute_enhancer_1.enhanceAttributes(char, constants, config)];
                case 10:
                    _a.sent();
                    return [2 /*return*/, char];
            }
        });
    });
}
exports.read = read;
function readItem(buffer, version, constants, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var reader, config, item;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reader = new bitreader_1.BitReader(buffer);
                    config = Object.assign(defaultConfig, userConfig);
                    if (!constants) {
                        constants = constants_1.getConstantData(version);
                    }
                    return [4 /*yield*/, items.readItem(reader, version, constants, config)];
                case 1:
                    item = _a.sent();
                    return [4 /*yield*/, attribute_enhancer_1.enhanceItems([item], constants)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, item];
            }
        });
    });
}
exports.readItem = readItem;
function writer(buffer) {
    return new bitwriter_1.BitWriter();
}
exports.writer = writer;
function write(data, constants, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var config, writer, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    config = Object.assign(defaultConfig, userConfig);
                    writer = new bitwriter_1.BitWriter();
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, header_1.writeHeader(data)];
                case 1:
                    _b.apply(_a, [_s.sent()]);
                    if (!constants) {
                        constants = constants_1.getConstantData(data.header.version);
                    }
                    _d = (_c = writer).WriteArray;
                    return [4 /*yield*/, header_1.writeHeaderData(data, constants)];
                case 2:
                    _d.apply(_c, [_s.sent()]);
                    _f = (_e = writer).WriteArray;
                    return [4 /*yield*/, attributes_1.writeAttributes(data, constants)];
                case 3:
                    _f.apply(_e, [_s.sent()]);
                    _h = (_g = writer).WriteArray;
                    return [4 /*yield*/, skills_1.writeSkills(data, constants)];
                case 4:
                    _h.apply(_g, [_s.sent()]);
                    _k = (_j = writer).WriteArray;
                    return [4 /*yield*/, items.writeCharItems(data, constants, config)];
                case 5:
                    _k.apply(_j, [_s.sent()]);
                    _m = (_l = writer).WriteArray;
                    return [4 /*yield*/, items.writeCorpseItem(data, constants, config)];
                case 6:
                    _m.apply(_l, [_s.sent()]);
                    if (!data.header.status.expansion) return [3 /*break*/, 9];
                    _p = (_o = writer).WriteArray;
                    return [4 /*yield*/, items.writeMercItems(data, constants, config)];
                case 7:
                    _p.apply(_o, [_s.sent()]);
                    _r = (_q = writer).WriteArray;
                    return [4 /*yield*/, items.writeGolemItems(data, constants, config)];
                case 8:
                    _r.apply(_q, [_s.sent()]);
                    _s.label = 9;
                case 9: return [4 /*yield*/, header_1.fixHeader(writer)];
                case 10:
                    _s.sent();
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.write = write;
function writeItem(item, version, constants, userConfig) {
    return __awaiter(this, void 0, void 0, function () {
        var config, writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    config = Object.assign(defaultConfig, userConfig);
                    writer = new bitwriter_1.BitWriter();
                    if (!constants) {
                        constants = constants_1.getConstantData(version);
                    }
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, items.writeItem(item, version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeItem = writeItem;
//# sourceMappingURL=d2s.js.map