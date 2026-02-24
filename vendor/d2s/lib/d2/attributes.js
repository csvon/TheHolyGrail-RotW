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
exports.writeAttributes = exports.readAttributes = void 0;
var bitwriter_1 = require("../binary/bitwriter");
//todo use constants.magical_properties and csvBits
function readAttributes(char, reader, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var header, classData, bitoffset, id, field, size;
        return __generator(this, function (_a) {
            char.attributes = {};
            header = reader.ReadString(2);
            if (header != "gf") {
                // header is not present in first save after char is created
                if (char.header.level === 1) {
                    classData = constants.classes.find(function (c) { return c.n === char.header.class; }).a;
                    char.attributes = {
                        strength: +classData.str,
                        energy: +classData.int,
                        dexterity: +classData.dex,
                        vitality: +classData.vit,
                        unused_stats: 0,
                        unused_skill_points: 0,
                        current_hp: +classData.vit + +classData.hpadd,
                        max_hp: +classData.vit + +classData.hpadd,
                        current_mana: +classData.int,
                        max_mana: +classData.int,
                        current_stamina: +classData.stam,
                        max_stamina: +classData.stam,
                        level: 1,
                        experience: 0,
                        gold: 0,
                        stashed_gold: 0,
                    };
                    return [2 /*return*/];
                }
                throw new Error("Attribute header 'gf' not found at position " + (reader.offset - 2 * 8));
            }
            bitoffset = 0;
            id = reader.ReadUInt16(9);
            //read till 0x1ff end of attributes is found
            while (id != 0x1ff) {
                bitoffset += 9;
                field = constants.magical_properties[id];
                if (field === undefined) {
                    throw new Error("Invalid attribute id: " + id);
                }
                size = field.cB;
                char.attributes[Attributes[field.s]] = reader.ReadUInt32(size);
                //current_hp - max_stamina need to be bit shifted
                if (id >= 6 && id <= 11) {
                    char.attributes[Attributes[field.s]] >>>= 8;
                }
                bitoffset += size;
                id = reader.ReadUInt16(9);
            }
            reader.Align();
            return [2 /*return*/];
        });
    });
}
exports.readAttributes = readAttributes;
function writeAttributes(char, constants) {
    return __awaiter(this, void 0, void 0, function () {
        var writer, i, property, value, size;
        return __generator(this, function (_a) {
            writer = new bitwriter_1.BitWriter();
            writer.WriteString("gf", 2); //0x0000 [attributes header = 0x67, 0x66 "gf"]
            for (i = 0; i < 16; i++) {
                property = constants.magical_properties[i];
                if (property === undefined) {
                    throw new Error("Invalid attribute: " + property);
                }
                value = char.attributes[Attributes[property.s]];
                if (!value) {
                    continue;
                }
                size = property.cB;
                if (i >= 6 && i <= 11) {
                    value <<= 8;
                }
                writer.WriteUInt16(i, 9);
                writer.WriteUInt32(value, size);
            }
            writer.WriteUInt16(0x1ff, 9);
            writer.Align();
            return [2 /*return*/, writer.ToArray()];
        });
    });
}
exports.writeAttributes = writeAttributes;
//nokkas names
var Attributes = {
    strength: "strength",
    energy: "energy",
    dexterity: "dexterity",
    vitality: "vitality",
    statpts: "unused_stats",
    newskills: "unused_skill_points",
    hitpoints: "current_hp",
    maxhp: "max_hp",
    mana: "current_mana",
    maxmana: "max_mana",
    stamina: "current_stamina",
    maxstamina: "max_stamina",
    level: "level",
    experience: "experience",
    gold: "gold",
    goldbank: "stashed_gold",
};
//# sourceMappingURL=attributes.js.map