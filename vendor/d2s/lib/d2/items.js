"use strict";
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
exports._writeMagicProperties = exports._readMagicProperties = exports.writeItem = exports.readItem = exports.writeItems = exports.readItems = exports.writeCorpseItem = exports.readCorpseItems = exports.writeGolemItems = exports.readGolemItems = exports.writeMercItems = exports.readMercItems = exports.writeCharItems = exports.readCharItems = void 0;
var bitreader_1 = require("../binary/bitreader");
var bitwriter_1 = require("../binary/bitwriter");
var ItemType;
(function (ItemType) {
    ItemType[ItemType["Armor"] = 1] = "Armor";
    ItemType[ItemType["Shield"] = 2] = "Shield";
    ItemType[ItemType["Weapon"] = 3] = "Weapon";
    ItemType[ItemType["Other"] = 4] = "Other";
})(ItemType || (ItemType = {}));
var Quality;
(function (Quality) {
    Quality[Quality["Low"] = 1] = "Low";
    Quality[Quality["Normal"] = 2] = "Normal";
    Quality[Quality["Superior"] = 3] = "Superior";
    Quality[Quality["Magic"] = 4] = "Magic";
    Quality[Quality["Set"] = 5] = "Set";
    Quality[Quality["Rare"] = 6] = "Rare";
    Quality[Quality["Unique"] = 7] = "Unique";
    Quality[Quality["Crafted"] = 8] = "Crafted";
})(Quality || (Quality = {}));
// prettier-ignore
//huffman tree
var HUFFMAN = [[[[["w", "u"], [["8", ["y", ["5", ["j", []]]]], "h"]], ["s", [["2", "n"], "x"]]], [[["c", ["k", "f"]], "b"], [["t", "m"], ["9", "7"]]]], [" ", [[[["e", "d"], "p"], ["g", [[["z", "q"], "3"], ["v", "6"]]]], [["r", "l"], ["a", [["1", ["4", "0"]], ["i", "o"]]]]]]];
// prettier-ignore
var HUFFMAN_LOOKUP = { "0": { "v": 223, "l": 8 }, "1": { "v": 31, "l": 7 }, "2": { "v": 12, "l": 6 }, "3": { "v": 91, "l": 7 }, "4": { "v": 95, "l": 8 }, "5": { "v": 104, "l": 8 }, "6": { "v": 123, "l": 7 }, "7": { "v": 30, "l": 5 }, "8": { "v": 8, "l": 6 }, "9": { "v": 14, "l": 5 }, " ": { "v": 1, "l": 2 }, "a": { "v": 15, "l": 5 }, "b": { "v": 10, "l": 4 }, "c": { "v": 2, "l": 5 }, "d": { "v": 35, "l": 6 }, "e": { "v": 3, "l": 6 }, "f": { "v": 50, "l": 6 }, "g": { "v": 11, "l": 5 }, "h": { "v": 24, "l": 5 }, "i": { "v": 63, "l": 7 }, "j": { "v": 232, "l": 9 }, "k": { "v": 18, "l": 6 }, "l": { "v": 23, "l": 5 }, "m": { "v": 22, "l": 5 }, "n": { "v": 44, "l": 6 }, "o": { "v": 127, "l": 7 }, "p": { "v": 19, "l": 5 }, "q": { "v": 155, "l": 8 }, "r": { "v": 7, "l": 5 }, "s": { "v": 4, "l": 4 }, "t": { "v": 6, "l": 5 }, "u": { "v": 16, "l": 5 }, "v": { "v": 59, "l": 7 }, "w": { "v": 0, "l": 5 }, "x": { "v": 28, "l": 5 }, "y": { "v": 40, "l": 7 }, "z": { "v": 27, "l": 8 } };
function readCharItems(char, reader, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = char;
                    return [4 /*yield*/, readItems(reader, char.header.version, constants, config, char)];
                case 1:
                    _a.items = _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.readCharItems = readCharItems;
function writeCharItems(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeItems(char.items, char.header.version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeCharItems = writeCharItems;
function readMercItems(char, reader, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var header, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    char.merc_items = [];
                    header = reader.ReadString(2);
                    if (header !== "jf") {
                        // header is not present in first save after char is created
                        if ((char === null || char === void 0 ? void 0 : char.header.level) === 1) {
                            return [2 /*return*/];
                        }
                        throw new Error("Mercenary header 'jf' not found at position " + (reader.offset - 2 * 8));
                    }
                    if (!(char.header.merc_id && parseInt(char.header.merc_id, 16) !== 0)) return [3 /*break*/, 2];
                    _a = char;
                    return [4 /*yield*/, readItems(reader, char.header.version, constants, config, char)];
                case 1:
                    _a.merc_items = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.readMercItems = readMercItems;
function writeMercItems(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteString("jf", 2);
                    if (!(char.header.merc_id && parseInt(char.header.merc_id, 16) !== 0)) return [3 /*break*/, 2];
                    char.merc_items = char.merc_items || [];
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeItems(char.merc_items, char.header.version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 2;
                case 2: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeMercItems = writeMercItems;
function readGolemItems(char, reader, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var header, has_golem, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    header = reader.ReadString(2);
                    if (header !== "kf") {
                        // header is not present in first save after char is created
                        if ((char === null || char === void 0 ? void 0 : char.header.level) === 1) {
                            return [2 /*return*/];
                        }
                        throw new Error("Golem header 'kf' not found at position " + (reader.offset - 2 * 8));
                    }
                    has_golem = reader.ReadUInt8();
                    if (!(has_golem === 1)) return [3 /*break*/, 2];
                    _a = char;
                    return [4 /*yield*/, readItem(reader, char.header.version, constants, config)];
                case 1:
                    _a.golem_item = _b.sent();
                    _b.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.readGolemItems = readGolemItems;
function writeGolemItems(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteString("kf", 2);
                    if (!char.golem_item) return [3 /*break*/, 2];
                    writer.WriteUInt8(1);
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeItem(char.golem_item, char.header.version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 3];
                case 2:
                    writer.WriteUInt8(0);
                    _c.label = 3;
                case 3: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeGolemItems = writeGolemItems;
function readCorpseItems(char, reader, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var header, i, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    char.corpse_items = [];
                    header = reader.ReadString(2);
                    if (header !== "JM") {
                        // header is not present in first save after char is created
                        if (char.header.level === 1) {
                            char.is_dead = 0;
                            return [2 /*return*/];
                        }
                        throw new Error("Corpse header 'JM' not found at position " + (reader.offset - 2 * 8));
                    }
                    char.is_dead = reader.ReadUInt16(); //0x0002 [corpse count]
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < char.is_dead)) return [3 /*break*/, 4];
                    reader.SkipBytes(12); //0x0004 [unk4, x_pos, y_pos]
                    _a = char;
                    _c = (_b = char.corpse_items).concat;
                    return [4 /*yield*/, readItems(reader, char.header.version, constants, config, char)];
                case 2:
                    _a.corpse_items = _c.apply(_b, [_d.sent()]);
                    _d.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.readCorpseItems = readCorpseItems;
function writeCorpseItem(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteString("JM", 2);
                    writer.WriteUInt16(char.is_dead);
                    if (!char.is_dead) return [3 /*break*/, 2];
                    writer.WriteArray(new Uint8Array(12));
                    char.corpse_items = char.corpse_items || [];
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeItems(char.corpse_items, char.header.version, constants, config)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 2;
                case 2: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeCorpseItem = writeCorpseItem;
function readItems(reader, version, constants, config, char) {
    return __awaiter(this, void 0, void 0, function () {
        var items, header, count, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    items = [];
                    header = reader.ReadString(2);
                    if (header !== "JM") {
                        // header is not present in first save after char is created
                        if ((char === null || char === void 0 ? void 0 : char.header.level) === 1) {
                            return [2 /*return*/, []]; // TODO: return starter items based on class
                        }
                        throw new Error("Item list header 'JM' not found at position " + (reader.offset - 2 * 8));
                    }
                    count = reader.ReadUInt16();
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < count)) return [3 /*break*/, 4];
                    _b = (_a = items).push;
                    return [4 /*yield*/, readItem(reader, version, constants, config)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, items];
            }
        });
    });
}
exports.readItems = readItems;
function writeItems(items, version, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    writer = new bitwriter_1.BitWriter();
                    writer.WriteString("JM", 2);
                    writer.WriteUInt16(items.length);
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < items.length)) return [3 /*break*/, 4];
                    _b = (_a = writer).WriteArray;
                    return [4 /*yield*/, writeItem(items[i], version, constants, config)];
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
exports.writeItems = writeItems;
function readItem(reader, version, originalConstants, config, parent) {
    return __awaiter(this, void 0, void 0, function () {
        var header, constants, item, i, prefix, arr, i, plist_flag, magic_attributes, i, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (version <= 0x60) {
                        header = reader.ReadString(2);
                        if (header !== "JM") {
                            throw new Error("Item header 'JM' not found at position " + (reader.offset - 2 * 8));
                        }
                    }
                    constants = originalConstants;
                    item = {};
                    _readSimpleBits(item, reader, version, constants, config);
                    if (!item.simple_item) {
                        item.id = reader.ReadUInt32(32);
                        item.level = reader.ReadUInt8(7);
                        item.quality = reader.ReadUInt8(4);
                        item.multiple_pictures = reader.ReadBit();
                        if (item.multiple_pictures) {
                            item.picture_id = reader.ReadUInt8(3);
                        }
                        item.class_specific = reader.ReadBit();
                        if (item.class_specific) {
                            item.auto_affix_id = reader.ReadUInt16(11);
                        }
                        switch (item.quality) {
                            case Quality.Low:
                                item.low_quality_id = reader.ReadUInt8(3);
                                break;
                            case Quality.Normal:
                                break;
                            case Quality.Superior:
                                item.file_index = reader.ReadUInt8(3);
                                break;
                            case Quality.Magic:
                                item.magic_prefix = reader.ReadUInt16(11);
                                if (item.magic_prefix)
                                    item.magic_prefix_name = constants.magic_prefixes[item.magic_prefix] ? constants.magic_prefixes[item.magic_prefix].n : null;
                                item.magic_suffix = reader.ReadUInt16(11);
                                if (item.magic_suffix)
                                    item.magic_suffix_name = constants.magic_suffixes[item.magic_suffix] ? constants.magic_suffixes[item.magic_suffix].n : null;
                                break;
                            case Quality.Set:
                                item.set_id = reader.ReadUInt16(12);
                                item.set_name = constants.set_items[item.set_id] ? constants.set_items[item.set_id].n : null;
                                break;
                            case Quality.Unique:
                                item.unique_id = reader.ReadUInt16(12);
                                item.unique_name = constants.unq_items[item.unique_id] ? constants.unq_items[item.unique_id].n : null;
                                break;
                            case Quality.Rare:
                            case Quality.Crafted:
                                item.rare_name_id = reader.ReadUInt8(8);
                                if (item.rare_name_id)
                                    item.rare_name = constants.rare_names[item.rare_name_id] ? constants.rare_names[item.rare_name_id].n : null;
                                item.rare_name_id2 = reader.ReadUInt8(8);
                                if (item.rare_name_id2)
                                    item.rare_name2 = constants.rare_names[item.rare_name_id2] ? constants.rare_names[item.rare_name_id2].n : null;
                                item.magical_name_ids = [];
                                for (i = 0; i < 6; i++) {
                                    prefix = reader.ReadBit();
                                    if (prefix === 1) {
                                        item.magical_name_ids[i] = reader.ReadUInt16(11);
                                    }
                                    else {
                                        item.magical_name_ids[i] = null;
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        if (item.given_runeword) {
                            item.runeword_id = reader.ReadUInt16(12);
                            //fix delerium on d2gs??? why is this a thing?
                            if (item.runeword_id == 2718) {
                                item.runeword_id = 48;
                            }
                            if (constants.runewords[item.runeword_id]) {
                                item.runeword_name = constants.runewords[item.runeword_id].n;
                            }
                            reader.ReadUInt8(4);
                        }
                        if (item.personalized) {
                            arr = new Uint8Array(16);
                            for (i = 0; i < arr.length; i++) {
                                if (version > 0x61) {
                                    arr[i] = reader.ReadUInt8(8);
                                }
                                else {
                                    arr[i] = reader.ReadUInt8(7);
                                }
                                if (arr[i] === 0x00) {
                                    break;
                                }
                            }
                            item.personalized_name = new bitreader_1.BitReader(arr).ReadString(16).trim().replace(/\0/g, "");
                        }
                        //tomes
                        if (item.type === "tbk" || item.type == "ibk") {
                            reader.ReadUInt8(5);
                        }
                        //realm data
                        item.timestamp = reader.ReadUInt8(1);
                        if (item.type_id === ItemType.Armor) {
                            item.defense_rating = reader.ReadUInt16(constants.magical_properties[31].sB) - constants.magical_properties[31].sA;
                        }
                        if (item.type_id === ItemType.Armor || item.type_id === ItemType.Weapon) {
                            item.max_durability = reader.ReadUInt16(constants.magical_properties[73].sB) - constants.magical_properties[73].sA;
                            if (item.max_durability > 0) {
                                item.current_durability = reader.ReadUInt16(constants.magical_properties[72].sB) - constants.magical_properties[72].sA;
                            }
                        }
                        if (version === 105) {
                            reader.SkipBits(1);
                        }
                        if (constants.stackables[item.type]) {
                            item.quantity = reader.ReadUInt16(9);
                        }
                        if (item.socketed === 1) {
                            item.total_nr_of_sockets = reader.ReadUInt8(4);
                        }
                        plist_flag = 0;
                        if (item.quality === Quality.Set) {
                            plist_flag = reader.ReadUInt8(5);
                            item.set_list_count = 0;
                            item._unknown_data.plist_flag = plist_flag;
                        }
                        magic_attributes = _readMagicProperties(reader, constants);
                        item.magic_attributes = magic_attributes;
                        while (plist_flag > 0) {
                            if (plist_flag & 1) {
                                item.set_list_count += 1;
                                magic_attributes = _readMagicProperties(reader, constants);
                                if (item.set_attributes) {
                                    item.set_attributes.push(magic_attributes);
                                }
                                else {
                                    item.set_attributes = [magic_attributes];
                                }
                            }
                            plist_flag >>>= 1;
                        }
                        if (item.given_runeword === 1) {
                            magic_attributes = _readMagicProperties(reader, constants);
                            if (magic_attributes && magic_attributes.length > 0) {
                                item.runeword_attributes = magic_attributes;
                            }
                        }
                    }
                    if (version === 105 && reader.ReadBit()) {
                        reader.SkipBits(8);
                    }
                    reader.Align();
                    if (!(item.nr_of_items_in_sockets > 0 && item.simple_item === 0)) return [3 /*break*/, 4];
                    item.socketed_items = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < item.nr_of_items_in_sockets)) return [3 /*break*/, 4];
                    _b = (_a = item.socketed_items).push;
                    return [4 /*yield*/, readItem(reader, version, constants, config, item)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, item];
            }
        });
    });
}
exports.readItem = readItem;
function writeItem(item, version, constants, config) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var writer, i, magical_name_id, runeword_id, name_1, i, set_attribute_count, plist_flag, i, i, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (item._unknown_data === undefined) {
                        item._unknown_data = {};
                    }
                    if (item.categories === undefined) {
                        item.categories = (_a = _GetItemTXT(item, constants)) === null || _a === void 0 ? void 0 : _a.c;
                    }
                    writer = new bitwriter_1.BitWriter();
                    if (version <= 0x60) {
                        writer.WriteString("JM", 2);
                    }
                    _writeSimpleBits(writer, version, item, constants, config);
                    if (!item.simple_item) {
                        writer.WriteUInt32(item.id, 32);
                        writer.WriteUInt8(item.level, 7);
                        writer.WriteUInt8(item.quality, 4);
                        writer.WriteUInt8(item.multiple_pictures, 1);
                        if (item.multiple_pictures) {
                            writer.WriteUInt8(item.picture_id, 3);
                        }
                        writer.WriteUInt8(item.class_specific, 1);
                        if (item.class_specific === 1) {
                            writer.WriteUInt16(item.auto_affix_id || 0, 11);
                        }
                        switch (item.quality) {
                            case Quality.Low:
                                writer.WriteUInt8(item.low_quality_id, 3);
                                break;
                            case Quality.Normal:
                                break;
                            case Quality.Superior:
                                writer.WriteUInt8(item.file_index || 0, 3);
                                break;
                            case Quality.Magic:
                                writer.WriteUInt16(item.magic_prefix, 11);
                                writer.WriteUInt16(item.magic_suffix, 11);
                                break;
                            case Quality.Set:
                                writer.WriteUInt16(item.set_id, 12);
                                break;
                            case Quality.Unique:
                                writer.WriteUInt16(item.unique_id, 12);
                                break;
                            case Quality.Rare:
                            case Quality.Crafted:
                                writer.WriteUInt8(item.rare_name_id !== undefined ? item.rare_name_id : _lookupRareId(item.rare_name, constants), 8);
                                writer.WriteUInt8(item.rare_name_id2 !== undefined ? item.rare_name_id2 : _lookupRareId(item.rare_name2, constants), 8);
                                for (i = 0; i < 6; i++) {
                                    magical_name_id = item.magical_name_ids[i];
                                    if (magical_name_id) {
                                        writer.WriteBit(1);
                                        writer.WriteUInt16(magical_name_id, 11);
                                    }
                                    else {
                                        writer.WriteBit(0);
                                    }
                                }
                                break;
                            default:
                                break;
                        }
                        if (item.given_runeword) {
                            runeword_id = item.runeword_id;
                            if (runeword_id == 2718) {
                                runeword_id = 48;
                            }
                            writer.WriteUInt16(runeword_id, 12);
                            writer.WriteUInt8(5, 4); //always 5?
                        }
                        if (item.personalized) {
                            name_1 = item.personalized_name.substring(0, 16);
                            for (i = 0; i < name_1.length; i++) {
                                if (version > 0x61) {
                                    writer.WriteUInt8(name_1.charCodeAt(i), 8);
                                }
                                else {
                                    writer.WriteUInt8(name_1.charCodeAt(i) & 0x7f, 7);
                                }
                            }
                            writer.WriteUInt8(0x00, version > 0x61 ? 8 : 7);
                        }
                        if (item.type === "tbk") {
                            writer.WriteUInt8(0, 5);
                        }
                        else if (item.type === "ibk") {
                            writer.WriteUInt8(1, 5);
                        }
                        writer.WriteUInt8(item.timestamp, 1);
                        if (item.type_id === ItemType.Armor || item.type_id === ItemType.Shield) {
                            writer.WriteUInt16(item.defense_rating + constants.magical_properties[31].sA, constants.magical_properties[31].sB);
                        }
                        if (item.type_id === ItemType.Armor || item.type_id === ItemType.Shield || item.type_id === ItemType.Weapon) {
                            writer.WriteUInt16(item.max_durability || 0, constants.magical_properties[73].sB);
                            if (item.max_durability > 0) {
                                writer.WriteUInt16(item.current_durability, constants.magical_properties[72].sB);
                            }
                        }
                        if (constants.stackables[item.type]) {
                            writer.WriteUInt16(item.quantity, 9);
                        }
                        if (item.socketed === 1) {
                            writer.WriteUInt8(item.total_nr_of_sockets, 4);
                        }
                        if (item.quality === Quality.Set) {
                            set_attribute_count = item.set_attributes != null ? item.set_attributes.length : 0;
                            plist_flag = (1 << set_attribute_count) - 1;
                            writer.WriteUInt8(item._unknown_data.plist_flag || plist_flag, 5);
                        }
                        _writeMagicProperties(writer, item.magic_attributes, constants);
                        if (item.set_attributes && item.set_attributes.length > 0) {
                            for (i = 0; i < item.set_attributes.length; i++) {
                                _writeMagicProperties(writer, item.set_attributes[i], constants);
                            }
                        }
                        if (item.given_runeword === 1) {
                            _writeMagicProperties(writer, item.runeword_attributes, constants);
                        }
                    }
                    writer.Align();
                    if (!(item.nr_of_items_in_sockets > 0 && item.simple_item === 0)) return [3 /*break*/, 4];
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < item.nr_of_items_in_sockets)) return [3 /*break*/, 4];
                    _c = (_b = writer).WriteArray;
                    return [4 /*yield*/, writeItem(item.socketed_items[i], version, constants, config)];
                case 2:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, writer.ToArray()];
            }
        });
    });
}
exports.writeItem = writeItem;
function _readSimpleBits(item, reader, version, constants, config) {
    var _a, _b, _c;
    //init so we do not have npe's
    item._unknown_data = {};
    //1.10-1.14d
    //[flags:32][version:10][mode:3]([invloc:4][x:4][y:4][page:3])([itemcode:32])([sockets:3])
    //1.15
    //[flags:32][version:3][mode:3]([invloc:4][x:4][y:4][page:3])([itemcode:variable])([sockets:3])
    item._unknown_data.b0_3 = reader.ReadBitArray(4);
    item.identified = reader.ReadBit();
    item._unknown_data.b5_10 = reader.ReadBitArray(6);
    item.socketed = reader.ReadBit();
    item._unknown_data.b12 = reader.ReadBitArray(1);
    item.new = reader.ReadBit();
    item._unknown_data.b14_15 = reader.ReadBitArray(2);
    item.is_ear = reader.ReadBit();
    item.starter_item = reader.ReadBit();
    item._unknown_data.b18_20 = reader.ReadBitArray(3);
    item.simple_item = reader.ReadBit();
    item.ethereal = reader.ReadBit();
    item._unknown_data.b23 = reader.ReadBitArray(1);
    item.personalized = reader.ReadBit();
    item._unknown_data.b25 = reader.ReadBitArray(1);
    item.given_runeword = reader.ReadBit();
    item._unknown_data.b27_31 = reader.ReadBitArray(5);
    if (version <= 0x60) {
        item.version = reader.ReadUInt16(10).toString(10);
    }
    else if (version >= 0x61) {
        item.version = reader.ReadUInt16(3).toString(2);
    }
    item.location_id = reader.ReadUInt8(3);
    item.equipped_id = reader.ReadUInt8(4);
    item.position_x = reader.ReadUInt8(4);
    item.position_y = reader.ReadUInt8(4);
    item.alt_position_id = reader.ReadUInt8(3);
    if (item.is_ear) {
        var clazz = reader.ReadUInt8(3);
        var level = reader.ReadUInt8(7);
        var arr = new Uint8Array(15);
        for (var i = 0; i < arr.length; i++) {
            arr[i] = reader.ReadUInt8(7);
            if (arr[i] === 0x00) {
                break;
            }
        }
        var name_2 = new bitreader_1.BitReader(arr).ReadString(15).trim().replace(/\0/g, "");
        item.ear_attributes = {
            class: clazz,
            level: level,
            name: name_2,
        };
    }
    else {
        if (version <= 0x60) {
            item.type = reader.ReadString(4);
        }
        else if (version >= 0x61) {
            item.type = "";
            //props to d07riv
            //https://github.com/d07RiV/d07riv.github.io/blob/master/d2r.html#L11-L20
            for (var i = 0; i < 4; i++) {
                var node = HUFFMAN;
                do {
                    node = node[reader.ReadBit()];
                } while (Array.isArray(node));
                item.type += node;
            }
        }
        item.type = item.type.trim().replace(/\0/g, "");
        var details = _GetItemTXT(item, constants);
        item.categories = details === null || details === void 0 ? void 0 : details.c;
        if ((_a = item === null || item === void 0 ? void 0 : item.categories) === null || _a === void 0 ? void 0 : _a.includes("Any Armor")) {
            item.type_id = ItemType.Armor;
        }
        else if ((_b = item === null || item === void 0 ? void 0 : item.categories) === null || _b === void 0 ? void 0 : _b.includes("Weapon")) {
            item.type_id = ItemType.Weapon;
            details = constants.weapon_items[item.type];
        }
        else {
            item.type_id = ItemType.Other;
        }
        var bits = item.simple_item ? 1 : 3;
        if ((_c = item.categories) === null || _c === void 0 ? void 0 : _c.includes("Quest")) {
            item.quest_difficulty = reader.ReadUInt16(constants.magical_properties[356].sB) - constants.magical_properties[356].sA;
            bits = 1;
        }
        item.nr_of_items_in_sockets = reader.ReadUInt8(bits);
    }
}
function _lookupRareId(name, constants) {
    //some inconsistencies with txt data and nokka. so have to hack it with startsWith
    return constants.rare_names.findIndex(function (k) { return k && (k.n.toLowerCase().startsWith(name.toLowerCase()) || name.toLowerCase().startsWith(k.n.toLowerCase())); });
}
function _writeSimpleBits(writer, version, item, constants, config) {
    var _a;
    writer.WriteBits(item._unknown_data.b0_3 || new Uint8Array(4), 4);
    writer.WriteBit(item.identified);
    writer.WriteBits(item._unknown_data.b5_10 || new Uint8Array(6), 6);
    writer.WriteBit(item.socketed);
    writer.WriteBits(item._unknown_data.b12 || new Uint8Array(1), 1);
    writer.WriteBit(item.new);
    writer.WriteBits(item._unknown_data.b14_15 || new Uint8Array(2), 2);
    writer.WriteBit(item.is_ear);
    writer.WriteBit(item.starter_item);
    writer.WriteBits(item._unknown_data.b18_20 || new Uint8Array(3), 3);
    writer.WriteBit(item.simple_item);
    writer.WriteBit(item.ethereal);
    writer.WriteBits(item._unknown_data.b23 || new Uint8Array([1]), 1); //always 1? IFLAG_JUSTSAVED
    writer.WriteBit(item.personalized);
    writer.WriteBits(item._unknown_data.b25 || new Uint8Array(1), 1); //IFLAG_LOWQUALITY
    writer.WriteBit(item.given_runeword);
    writer.WriteBits(item._unknown_data.b27_31 || new Uint8Array(5), 5);
    var itemVersion = item.version != null ? item.version : "101";
    if (version <= 0x60) {
        // 0 = pre-1.08; 1 = 1.08/1.09 normal; 2 = 1.10 normal; 100 = 1.08/1.09 expansion; 101 = 1.10 expansion
        writer.WriteUInt16(parseInt(itemVersion, 10), 10);
    }
    else if (version >= 0x61) {
        writer.WriteUInt16(parseInt(itemVersion, 2), 3);
    }
    writer.WriteUInt8(item.location_id, 3);
    writer.WriteUInt8(item.equipped_id, 4);
    writer.WriteUInt8(item.position_x, 4);
    writer.WriteUInt8(item.position_y, 4);
    writer.WriteUInt8(item.alt_position_id, 3);
    if (item.is_ear) {
        writer.WriteUInt8(item.ear_attributes.class, 3);
        writer.WriteUInt8(item.ear_attributes.level, 7);
        var name_3 = item.ear_attributes.name.substring(0, 15);
        for (var i = 0; i < name_3.length; i++) {
            writer.WriteUInt8(name_3.charCodeAt(i) & 0x7f, 7);
        }
        writer.WriteUInt8(0x00, 7);
    }
    else {
        var t = item.type.padEnd(4, " ");
        if (version <= 0x60) {
            writer.WriteString(t, 4);
        }
        else {
            for (var _i = 0, t_1 = t; _i < t_1.length; _i++) {
                var c = t_1[_i];
                var n = HUFFMAN_LOOKUP[c];
                writer.WriteUInt16(n.v, n.l);
            }
        }
        var bits = item.simple_item ? 1 : 3;
        if ((_a = item.categories) === null || _a === void 0 ? void 0 : _a.includes("Quest")) {
            var difficulty = item.quest_difficulty || 0;
            writer.WriteUInt16(difficulty + constants.magical_properties[356].sA, constants.magical_properties[356].sB);
            bits = 1;
        }
        writer.WriteUInt8(item.nr_of_items_in_sockets, bits);
    }
}
function _readMagicProperties(reader, constants) {
    var id = reader.ReadUInt16(9);
    var magic_attributes = [];
    while (id != 0x1ff) {
        var values = [];
        if (id > constants.magical_properties.length) {
            throw new Error("Invalid Stat Id: " + id + " at position " + (reader.offset - 9));
        }
        var num_of_properties = constants.magical_properties[id].np || 1;
        for (var i = 0; i < num_of_properties; i++) {
            var prop = constants.magical_properties[id + i];
            if (prop == null) {
                throw new Error("Cannot find Magical Property for id: " + id + " at position " + reader.offset);
            }
            if (prop.sP) {
                var param = reader.ReadUInt16(prop.sP);
                switch (prop.dF) {
                    case 14: //+skill to skilltab
                        values.push(param & 0x7);
                        param = (param >> 3) & 0x1fff;
                        break;
                    default:
                        break;
                }
                //encode
                switch (prop.e) {
                    case 1:
                        //throw new Error(`Unimplemented encoding: ${prop.encode}`);
                        break;
                    case 2: //chance to cast
                    case 3: //charges
                        values.push(param & 0x3f); //skill level
                        param = (param >> 6) & 0x3ff; //skll id
                        break;
                    default:
                        break;
                }
                values.push(param);
            }
            if (!prop.sB) {
                throw new Error("Save Bits is undefined for stat: " + id + ":" + prop.s + " at position " + reader.offset);
            }
            var v = reader.ReadUInt16(prop.sB);
            if (prop.sA) {
                v -= prop.sA;
            }
            switch (prop.e) {
                case 3:
                    values.push(v & 0xff); // current charges
                    values.push((v >> 8) & 0xff); //max charges
                    break;
                default:
                    values.push(v);
                    break;
            }
        }
        magic_attributes.push({
            id: id,
            values: values,
            name: constants.magical_properties[id].s,
        });
        id = reader.ReadUInt16(9);
    }
    return magic_attributes;
}
exports._readMagicProperties = _readMagicProperties;
function _writeMagicProperties(writer, properties, constants) {
    if (properties) {
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            var valueIdx = 0;
            writer.WriteUInt16(property.id, 9);
            var num_of_properties = constants.magical_properties[property.id].np || 1;
            for (var j = 0; j < num_of_properties; j++) {
                var prop = constants.magical_properties[property.id + j];
                if (prop == null) {
                    throw new Error("Cannot find Magical Property for id: " + property.id);
                }
                if (prop.sP) {
                    var param = property.values[valueIdx++];
                    switch (prop.dF) {
                        case 14: //+skill to skilltab
                            param |= (property.values[valueIdx++] & 0x1fff) << 3;
                            break;
                        default:
                            break;
                    }
                    //encode
                    switch (prop.e) {
                        case 1:
                            //throw new Error(`Unimplemented encoding: ${prop.encode}`);
                            break;
                        case 2: //chance to cast
                        case 3: //charges
                            param |= (property.values[valueIdx++] & 0x3ff) << 6;
                            break;
                        default:
                            break;
                    }
                    writer.WriteUInt32(param, prop.sP);
                }
                var v = property.values[valueIdx++];
                if (prop.sA) {
                    v += prop.sA;
                }
                switch (prop.e) {
                    case 3:
                        v |= (property.values[valueIdx++] & 0xff) << 8;
                        break;
                    default:
                        break;
                }
                if (!prop.sB) {
                    throw new Error("Save Bits is undefined for stat: " + property.id + ":" + prop.s);
                }
                writer.WriteUInt32(v, prop.sB);
            }
        }
    }
    writer.WriteUInt16(0x1ff, 9);
}
exports._writeMagicProperties = _writeMagicProperties;
function _GetItemTXT(item, constants) {
    if (constants.armor_items[item.type]) {
        return constants.armor_items[item.type];
    }
    else if (constants.weapon_items[item.type]) {
        return constants.weapon_items[item.type];
    }
    else if (constants.other_items[item.type]) {
        return constants.other_items[item.type];
    }
}
//# sourceMappingURL=items.js.map