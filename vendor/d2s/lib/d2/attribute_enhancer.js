"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhanceItem = exports.enhanceItems = exports.enhancePlayerAttributes = exports.enhanceAttributes = void 0;
var ItemType;
(function (ItemType) {
    ItemType[ItemType["Armor"] = 1] = "Armor";
    ItemType[ItemType["Shield"] = 2] = "Shield";
    ItemType[ItemType["Weapon"] = 3] = "Weapon";
    ItemType[ItemType["Other"] = 4] = "Other";
})(ItemType || (ItemType = {}));
//do nice stuff
//combine group properties (all resists/all stats) and build friendly strings for a ui
//enhanced def/durability/weapon damage.
//lookup socketed compact items (runes/gems) properties for the slot they are in
//compute attributes like str/resists/etc..
function enhanceAttributes(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            enhanceItems(char.items, constants, char.attributes.level, config);
            enhanceItems([char.golem_item], constants, char.attributes.level, config);
            enhanceItems(char.merc_items, constants, char.attributes.level, config);
            enhanceItems(char.corpse_items, constants, char.attributes.level, config);
            enhancePlayerAttributes(char, constants, config);
            return [2 /*return*/];
        });
    });
}
exports.enhanceAttributes = enhanceAttributes;
function enhancePlayerAttributes(char, constants, config) {
    return __awaiter(this, void 0, void 0, function () {
        var items;
        return __generator(this, function (_a) {
            items = char.items.filter(function (item) {
                return item.location_id === 1 && item.equipped_id !== 13 && item.equipped_id !== 14;
            });
            char.item_bonuses = [].concat
                .apply([], items.map(function (item) { return _allAttributes(item, constants); }))
                .filter(function (attribute) { return attribute != null; });
            char.item_bonuses = _groupAttributes(char.item_bonuses, constants);
            _enhanceAttributeDescription(char.item_bonuses, constants, char.attributes.level, config);
            return [2 /*return*/];
        });
    });
}
exports.enhancePlayerAttributes = enhancePlayerAttributes;
function enhanceItems(items, constants, level, config, parent) {
    if (level === void 0) { level = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var _i, items_1, item;
        return __generator(this, function (_a) {
            if (!items) {
                return [2 /*return*/];
            }
            for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                item = items_1[_i];
                if (!item) {
                    continue;
                }
                if (item.socketed_items && item.socketed_items.length) {
                    enhanceItems(item.socketed_items, constants, level, config, item);
                }
                enhanceItem(item, constants, level, config, parent);
            }
            return [2 /*return*/];
        });
    });
}
exports.enhanceItems = enhanceItems;
function enhanceItem(item, constants, level, config, parent) {
    var _a, _b, _c, _d;
    if (level === void 0) { level = 1; }
    if (parent) {
        //socket item.
        var pt = constants.armor_items[parent.type] || constants.weapon_items[parent.type] || constants.other_items[item.type];
        var t = constants.other_items[item.type];
        if (t.m) {
            item.magic_attributes = _compactAttributes(t.m[pt.gt], constants);
        }
    }
    var details = null;
    if (constants.armor_items[item.type]) {
        details = constants.armor_items[item.type];
        item.type_id = ItemType.Armor;
        if (details.maxac) {
            if (item.ethereal == 0) {
                item.defense_rating = details.maxac;
            }
            else if (item.ethereal == 1) {
                item.defense_rating = Math.floor(details.maxac * 1.5);
            }
        }
    }
    else if (constants.weapon_items[item.type]) {
        details = constants.weapon_items[item.type];
        item.type_id = ItemType.Weapon;
        var base_damage = {};
        if (item.ethereal == 0) {
            if (details.mind)
                base_damage.mindam = details.mind;
            if (details.maxd)
                base_damage.maxdam = details.maxd;
            if (details.min2d)
                base_damage.twohandmindam = details.min2d;
            if (details.max2d)
                base_damage.twohandmaxdam = details.max2d;
        }
        else if (item.ethereal == 1) {
            if (details.mind)
                base_damage.mindam = Math.floor(details.mind * 1.5);
            if (details.maxd)
                base_damage.maxdam = Math.floor(details.maxd * 1.5);
            if (details.min2d)
                base_damage.twohandmindam = Math.floor(details.min2d * 1.5);
            if (details.max2d)
                base_damage.twohandmaxdam = Math.floor(details.max2d * 1.5);
        }
        item.base_damage = base_damage;
    }
    else if (constants.other_items[item.type]) {
        item.type_id = ItemType.Other;
        details = constants.other_items[item.type];
    }
    if (details) {
        if (details.n)
            item.type_name = details.n;
        if (details.rs)
            item.reqstr = details.rs;
        if (details.rd)
            item.reqdex = details.rd;
        if (details.i)
            item.inv_file = details.i;
        if (details.ih)
            item.inv_height = details.ih;
        if (details.iw)
            item.inv_width = details.iw;
        if (details.it)
            item.inv_transform = details.it;
        if (details.iq)
            item.item_quality = details.iq;
        if (details.c)
            item.categories = details.c;
        if (details.durability) {
            if (item.ethereal == 0) {
                item.current_durability = details.durability;
                item.max_durability = details.durability;
            }
            else if (item.ethereal == 1) {
                item.current_durability = details.durability - Math.ceil(details.durability / 2) + 1;
                item.max_durability = details.durability - Math.ceil(details.durability / 2) + 1;
            }
        }
        if (item.multiple_pictures) {
            item.inv_file = details.ig[item.picture_id];
        }
        if (item.magic_prefix || item.magic_suffix) {
            if (item.magic_prefix && ((_a = constants.magic_prefixes[item.magic_prefix]) === null || _a === void 0 ? void 0 : _a.tc)) {
                item.transform_color = constants.magic_prefixes[item.magic_prefix].tc;
            }
            if (item.magic_suffix && ((_b = constants.magic_suffixes[item.magic_suffix]) === null || _b === void 0 ? void 0 : _b.tc)) {
                item.transform_color = constants.magic_suffixes[item.magic_suffix].tc;
            }
        }
        else if (item.magical_name_ids && item.magical_name_ids.length === 6) {
            for (var i = 0; i < 6; i++) {
                var id = item.magical_name_ids[i];
                if (id) {
                    if (i % 2 == 0 && constants.magic_prefixes[id] && ((_c = constants.magic_prefixes[id]) === null || _c === void 0 ? void 0 : _c.tc)) {
                        // even is prefixes
                        item.transform_color = constants.magic_prefixes[id].tc;
                    }
                    else if (constants.magic_suffixes[id] && ((_d = constants.magic_suffixes[id]) === null || _d === void 0 ? void 0 : _d.tc)) {
                        // odd is suffixes
                        item.transform_color = constants.magic_suffixes[id].tc;
                    }
                }
            }
        }
        else if (item.unique_id) {
            var unq = constants.unq_items[item.unique_id];
            if (details.ui)
                item.inv_file = details.ui;
            if (unq && unq.i)
                item.inv_file = unq.i;
            if (unq && unq.tc)
                item.transform_color = unq.tc;
        }
        else if (item.set_id) {
            var set = constants.set_items[item.set_id];
            if (details.ui)
                item.inv_file = details.ui;
            if (set && set.i)
                item.inv_file = set.i;
            if (set && set.tc)
                item.transform_color = set.tc;
        }
    }
    if (item.magic_attributes || item.runeword_attributes || item.socketed_items) {
        item.displayed_magic_attributes = _enhanceAttributeDescription(item.magic_attributes, constants, level, config);
        item.displayed_runeword_attributes = _enhanceAttributeDescription(item.runeword_attributes, constants, level, config);
        item.combined_magic_attributes = _groupAttributes(_allAttributes(item, constants), constants);
        item.displayed_combined_magic_attributes = _enhanceAttributeDescription(item.combined_magic_attributes, constants, level, config);
    }
}
exports.enhanceItem = enhanceItem;
function _enhanceAttributeDescription(_magic_attributes, constants, level, config) {
    if (level === void 0) { level = 1; }
    if (!_magic_attributes)
        return [];
    var magic_attributes = __spreadArrays(_magic_attributes.map(function (attr) { return (__assign({}, attr)); }));
    var dgrps = [0, 0, 0];
    var dgrpsVal = [0, 0, 0];
    for (var _i = 0, magic_attributes_1 = magic_attributes; _i < magic_attributes_1.length; _i++) {
        var property = magic_attributes_1[_i];
        var prop = constants.magical_properties[property.id];
        var v = property.values[property.values.length - 1];
        if (prop.dg) {
            if (dgrpsVal[prop.dg - 1] === 0) {
                dgrpsVal[prop.dg - 1] = v;
            }
            if (dgrpsVal[prop.dg - 1] - v === 0) {
                dgrps[prop.dg - 1]++;
            }
        }
    }
    var _loop_1 = function (property) {
        var prop = constants.magical_properties[property.id];
        if (prop == null) {
            throw new Error("Cannot find Magical Property for id: " + property.id);
        }
        var v = property.values[property.values.length - 1];
        if (prop.ob === "level") {
            switch (prop.o) {
                case 1: {
                    v = Math.floor((level * v) / 100);
                    break;
                }
                case 2:
                case 3:
                case 4:
                case 5: {
                    v = Math.floor((level * v) / Math.pow(2, prop.op));
                    break;
                }
                default: {
                    break;
                }
            }
            property.op_stats = prop.os;
            property.op_value = v;
        }
        var descFunc = prop.dF;
        var descString = v >= 0 ? prop.dP : prop.dN;
        //hack for d2r...?
        if (property.id == 39 || property.id == 41 || property.id == 43 || property.id == 45) {
            descString = prop.dP;
        }
        var descVal = prop.dV;
        var desc2 = prop.d2;
        if (prop.dg && dgrps[prop.dg - 1] === 4) {
            v = dgrpsVal[prop.dg - 1];
            descString = v >= 0 ? prop.dgP : prop.dgN ? prop.dgN : prop.dgP;
            descVal = prop.dgV;
            descFunc = prop.dgF;
            desc2 = prop.dg2;
        }
        if (prop.np) {
            //damage range or enhanced damage.
            var count_1 = 0;
            descString = prop.dR;
            if (prop.s === "poisonmindam") {
                //poisonmindam see https://user.xmission.com/~trevin/DiabloIIv1.09_Magic_Properties.shtml for reference
                var min = Math.floor((property.values[0] * property.values[2]) / 256);
                var max = Math.floor((property.values[1] * property.values[2]) / 256);
                var seconds = Math.floor(property.values[2] / 25);
                property.values = [min, max, seconds];
            }
            if (property.values[0] === property.values[1]) {
                count_1++;
                descString = prop.dE;
                //TODO. why???
                if (prop.s === "item_maxdamage_percent") {
                    descString = "+%d% " + descString.replace(/}/gi, "").replace(/%\+?d%%/gi, "");
                }
            }
            property.description = descString.replace(/%d/gi, function () {
                var v = property.values[count_1++];
                return v;
            });
        }
        else {
            _descFunc(property, constants, v, descFunc, descVal, descString, desc2);
        }
    };
    for (var _a = 0, magic_attributes_2 = magic_attributes; _a < magic_attributes_2.length; _a++) {
        var property = magic_attributes_2[_a];
        _loop_1(property);
    }
    if (config === null || config === void 0 ? void 0 : config.sortProperties) {
        //sort using sort order from game.
        magic_attributes.sort(function (a, b) { return constants.magical_properties[b.id].so - constants.magical_properties[a.id].so; });
    }
    for (var i = magic_attributes.length - 1; i >= 1; i--) {
        for (var j = i - 1; j >= 0; j--) {
            if (magic_attributes[i].description === magic_attributes[j].description) {
                magic_attributes[j].visible = false;
            }
        }
    }
    return magic_attributes;
}
function _compactAttributes(mods, constants) {
    var magic_attributes = [];
    for (var _i = 0, mods_1 = mods; _i < mods_1.length; _i++) {
        var mod = mods_1[_i];
        var properties = constants.properties[mod.m] || [];
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            var stat = property.s;
            switch (property.f) {
                case 5: {
                    stat = "mindamage";
                    break;
                }
                case 6: {
                    stat = "maxdamage";
                    break;
                }
                case 7: {
                    stat = "item_maxdamage_percent";
                    break;
                }
                case 20: {
                    stat = "item_indesctructible";
                    break;
                }
                default: {
                    break;
                }
            }
            var id = _itemStatCostFromStat(stat, constants);
            var prop = constants.magical_properties[id];
            if (prop.np)
                i += prop.np;
            var v = [mod.min, mod.max];
            if (mod.p) {
                v.push(mod.p);
            }
            magic_attributes.push({
                id: id,
                values: v,
                name: prop.s,
            });
        }
    }
    return magic_attributes;
}
function _descFunc(property, constants, v, descFunc, descVal, descString, desc2) {
    if (!descFunc) {
        return;
    }
    var sign = v >= 0 ? "+" : "";
    var value = null;
    var desc2Present = descFunc >= 6 && descFunc <= 10;
    switch (descFunc) {
        case 1:
        case 6:
        case 12: {
            value = "" + sign + v;
            break;
        }
        case 2:
        case 7: {
            value = v + "%";
            break;
        }
        case 3:
        case 9: {
            value = "" + v;
            break;
        }
        case 4:
        case 8: {
            value = "" + sign + v + "%";
            break;
        }
        case 5:
        case 10: {
            if (descString.indexOf("%%") < 0) {
                value = (v * 100) / 128 + "%";
            }
            else {
                value = (v * 100) / 128;
            }
            break;
        }
        case 11: {
            property.description = descString.replace(/%d/, (v / 100).toString());
            break;
        }
        case 13: {
            var clazz = constants.classes[property.values[0]];
            property.description = "" + sign + v + " " + clazz.as;
            break;
        }
        case 14: {
            var clazz = constants.classes[property.values[1]];
            var skillTabStr = clazz.ts[property.values[0]];
            descString = _sprintf(skillTabStr, v);
            property.description = descString + " " + clazz.co;
            break;
        }
        case 15: {
            descString = _sprintf(descString, property.values[2], property.values[0], constants.skills[property.values[1]].s);
            property.description = "" + descString;
            break;
        }
        case 16: {
            property.description = descString.replace(/%d/, v.toString());
            property.description = property.description.replace(/%s/, constants.skills[property.values[0]].s);
            break;
        }
        case 17: {
            //todo
            property.description = v + " " + descString + " (Increases near [time])";
            break;
        }
        case 18: {
            //todo
            property.description = v + "% " + descString + " (Increases near [time])";
            break;
        }
        case 19: {
            property.description = _sprintf(descString, v.toString());
            break;
        }
        case 20: {
            value = v * -1 + "%";
            break;
        }
        case 21: {
            value = "" + v * -1;
            break;
        }
        case 22: {
            //todo
            property.description = v + "% " + descString + " [montype]";
            break;
        }
        case 23: {
            //todo
            property.description = v + "% " + descString + " [monster]]";
            break;
        }
        case 24: {
            //charges
            //legacy desc string
            if (descString.indexOf("(") == 0) {
                var count_2 = 0;
                descString = descString.replace(/%d/gi, function () {
                    return property.values[2 + count_2++].toString();
                });
                property.description = "Level " + property.values[0] + " " + constants.skills[property.values[1]].s + " " + descString;
            }
            else {
                property.description = _sprintf(descString, property.values[0], constants.skills[property.values[1]].s, property.values[2], property.values[3]);
            }
            break;
        }
        case 27: {
            var skill = constants.skills[property.values[0]];
            var clazz = _classFromCode(skill.c, constants);
            if (descString) {
                property.description = _sprintf(descString, v, skill === null || skill === void 0 ? void 0 : skill.s, clazz === null || clazz === void 0 ? void 0 : clazz.co);
            }
            else {
                property.description = "" + sign + v + " to " + (skill === null || skill === void 0 ? void 0 : skill.s) + " " + (clazz === null || clazz === void 0 ? void 0 : clazz.co);
            }
            break;
        }
        case 28: {
            var skill = constants.skills[property.values[0]];
            property.description = "" + sign + v + " to " + (skill === null || skill === void 0 ? void 0 : skill.s);
            break;
        }
        case 29: {
            property.description = _sprintf(descString, v.toString());
            break;
        }
        default: {
            throw new Error("No handler for descFunc: " + descFunc);
        }
    }
    if (value) {
        descVal = descVal ? descVal : 0;
        switch (descVal) {
            case 0: {
                property.description = _sprintf(descString, value);
                break;
            }
            case 1: {
                property.description = value + " " + descString;
                break;
            }
            case 2: {
                property.description = descString + " " + value;
                break;
            }
            default: {
                throw new Error("No handler for descVal: " + descVal);
            }
        }
    }
    if (desc2Present) {
        property.description += " " + desc2;
    }
}
function _sprintf(str) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var i = 0;
    return str
        .replace(/%\+?d|%\+?s/gi, function (m) {
        var v = args[i++].toString();
        if (m.indexOf("+") >= 0) {
            v = "+" + v;
        }
        return v;
    })
        .replace("%%", "%");
}
function _itemStatCostFromStat(stat, constants) {
    return constants.magical_properties.findIndex(function (e) { return e.s === stat; });
}
function _classFromCode(code, constants) {
    return constants.classes.filter(function (e) { return e.c === code; })[0];
}
function _allAttributes(item, constants) {
    var socketed_attributes = [];
    if (item.socketed_items) {
        for (var _i = 0, _a = item.socketed_items; _i < _a.length; _i++) {
            var i = _a[_i];
            if (i.magic_attributes) {
                socketed_attributes = socketed_attributes.concat.apply(socketed_attributes, JSON.parse(JSON.stringify(i.magic_attributes)));
            }
        }
    }
    var magic_attributes = item.magic_attributes || [];
    var runeword_attributes = item.runeword_attributes || [];
    return __spreadArrays([], JSON.parse(JSON.stringify(magic_attributes)), JSON.parse(JSON.stringify(runeword_attributes)), JSON.parse(JSON.stringify(socketed_attributes))).filter(function (attribute) { return attribute != null; });
}
function _groupAttributes(all_attributes, constants) {
    var combined_magic_attributes = [];
    var _loop_2 = function (magic_attribute) {
        var prop = constants.magical_properties[magic_attribute.id];
        var properties = combined_magic_attributes.filter(function (e) {
            //encoded skills need to look at those params too.
            if (prop.e === 3) {
                return e.id === magic_attribute.id && e.values[0] === magic_attribute.values[0] && e.values[1] === magic_attribute.values[1];
            }
            if (prop.dF === 15) {
                return (e.id === magic_attribute.id &&
                    e.values[0] === magic_attribute.values[0] &&
                    e.values[1] === magic_attribute.values[1] &&
                    e.values[2] === magic_attribute.values[2]);
            }
            if (prop.dF === 16 || prop.dF === 23) {
                return e.id === magic_attribute.id && e.values[0] === magic_attribute.values[0] && e.values[1] === magic_attribute.values[1];
            }
            if (prop.s === "state" || prop.s === "item_nonclassskill") {
                //state
                return e.id === magic_attribute.id && e.values[0] === magic_attribute.values[0] && e.values[1] === magic_attribute.values[1];
            }
            return e.id === magic_attribute.id;
        });
        if (properties && properties.length) {
            for (var i = 0; i < properties.length; i++) {
                var property = properties[i];
                if (prop.np) {
                    //damage props
                    property.values[0] += magic_attribute.values[0];
                    property.values[1] += magic_attribute.values[1];
                    break;
                }
                //only combine attributes if the params for the descFunc are the same.
                var sameParams = true;
                var numValues = prop.e === 3 ? 2 : 1;
                for (var j = 0; j < property.values.length - numValues; j++) {
                    sameParams = property.values[j] === magic_attribute.values[j];
                    if (!sameParams) {
                        break;
                    }
                }
                if (sameParams) {
                    for (var j = 1; j <= numValues; j++) {
                        var idx = property.values.length - j;
                        property.values[idx] += magic_attribute.values[idx];
                    }
                }
                else {
                    combined_magic_attributes.push({
                        id: magic_attribute.id,
                        values: magic_attribute.values,
                        name: magic_attribute.name,
                    });
                }
            }
        }
        else {
            combined_magic_attributes.push({
                id: magic_attribute.id,
                values: magic_attribute.values,
                name: magic_attribute.name,
            });
        }
    };
    for (var _i = 0, all_attributes_1 = all_attributes; _i < all_attributes_1.length; _i++) {
        var magic_attribute = all_attributes_1[_i];
        _loop_2(magic_attribute);
    }
    return combined_magic_attributes;
}
//# sourceMappingURL=attribute_enhancer.js.map