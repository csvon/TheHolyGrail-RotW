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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConstantData = void 0;
var types = __importStar(require("../d2/types"));
//special stats. read the next N properties.
//seems to be hardcode in d2 and not in itemstatcost
var item_property_stat_count = {
    item_maxdamage_percent: { numprops: 2, rangestr: "strModMinDamageRange", equalstr: "strModEnhancedDamage" },
    firemindam: { numprops: 2, rangestr: "strModFireDamageRange", equalstr: "strModFireDamage" },
    lightmindam: { numprops: 2, rangestr: "strModLightningDamageRange", equalstr: "strModLightningDamage" },
    magicmindam: { numprops: 2, rangestr: "strModMagicDamageRange", equalstr: "strModMagicDamage" },
    coldmindam: { numprops: 3, rangestr: "strModColdDamageRange", equalstr: "strModColdDamage" },
    poisonmindam: { numprops: 3, rangestr: "strModPoisonDamageRange", equalstr: "strModPoisonDamage" },
};
//TODO use smaller field names to minimize size of file.
function readConstantData(buffers) {
    var constants = {};
    var strings = {};
    if (_hasKey(buffers, "strings.txt")) {
        strings = _readStrings(_getKey(buffers, "string.txt"));
        strings = Object.assign(strings, _readStrings(_getKey(buffers, "expansionstring.txt")));
        strings = Object.assign(strings, _readStrings(_getKey(buffers, "patchstring.txt")));
    }
    else {
        strings = _readJSONStrings(_getKey(buffers, "item-gems.json"));
        strings = Object.assign(strings, _readJSONStrings(_getKey(buffers, "item-modifiers.json")));
        strings = Object.assign(strings, _readJSONStrings(_getKey(buffers, "item-nameaffixes.json")));
        strings = Object.assign(strings, _readJSONStrings(_getKey(buffers, "item-names.json")));
        strings = Object.assign(strings, _readJSONStrings(_getKey(buffers, "item-runes.json")));
        strings = Object.assign(strings, _readJSONStrings(_getKey(buffers, "skills.json")));
    }
    constants.classes = _readClasses(_getArray(buffers, "CharStats.txt"), _getArray(buffers, "PlayerClass.txt"), strings);
    var skillDescs = _readSkillDesc(_getArray(buffers, "SkillDesc.txt"), strings);
    constants.skills = _readSkills(_getArray(buffers, "skills.txt"), skillDescs, strings);
    constants.rare_names = [null].concat(_readRareNames(_getArray(buffers, "RareSuffix.txt"), 1, strings));
    constants.rare_names = constants.rare_names.concat(_readRareNames(_getArray(buffers, "RarePrefix.txt"), constants.rare_names.length, strings));
    constants.magic_prefixes = _readMagicNames(_getArray(buffers, "MagicPrefix.txt"), strings);
    constants.magic_suffixes = _readMagicNames(_getArray(buffers, "MagicSuffix.txt"), strings);
    constants.properties = _readProperties(_getArray(buffers, "Properties.txt"), strings);
    constants.magical_properties = _readItemStatCosts(_getArray(buffers, "ItemStatCost.txt"), strings);
    constants.runewords = _readRunewords(_getArray(buffers, "Runes.txt"), strings);
    constants.set_items = _readSetOrUnqItems(_getArray(buffers, "SetItems.txt"), strings);
    constants.unq_items = _readSetOrUnqItems(_getArray(buffers, "UniqueItems.txt"), strings);
    var item_types = _readTypes(_getArray(buffers, "ItemTypes.txt"), strings);
    var armor_items = _readItems(_getArray(buffers, "Armor.txt"), item_types, strings);
    var weapon_items = _readItems(_getArray(buffers, "Weapons.txt"), item_types, strings);
    var other_items = _readItems(_getArray(buffers, "Misc.txt"), item_types, strings);
    constants.stackables = {};
    __spreadArrays(armor_items, weapon_items, other_items).filter(function (item) { return item.s === 1; })
        .map(function (item) { return (constants.stackables[item.code] = { n: item.n }); });
    constants.armor_items = {};
    armor_items.map(function (item) {
        constants.armor_items[item.code] = item;
        delete item.code;
    });
    constants.weapon_items = {};
    weapon_items.map(function (item) {
        constants.weapon_items[item.code] = item;
        delete item.code;
    });
    constants.other_items = {};
    other_items.map(function (item) {
        constants.other_items[item.code] = item;
        delete item.code;
    });
    _readGems(constants.other_items, _getArray(buffers, "Gems.txt"), strings);
    return constants;
}
exports.readConstantData = readConstantData;
function _getArray(files, find) {
    return _readTsv(_getKey(files, find));
}
function _getKey(files, find) {
    var key = Object.keys(files).find(function (key) { return key.toLowerCase() === find.toLowerCase(); });
    if (!key) {
        throw new Error("Cannot find file: " + find);
    }
    return files[key];
}
function _hasKey(files, find) {
    return Object.keys(files).find(function (key) { return key.toLowerCase() === find.toLowerCase(); }) != null;
}
function _readTsv(file) {
    var lines = file.split(/\r?\n/).map(function (line) { return line.split(/\t/); });
    var header = lines[0];
    return {
        header: header,
        lines: lines,
    };
}
function _readStrings(file) {
    var result = {};
    file
        .split(/\r?\n/)
        .map(function (line) { return line.split(/\t/); })
        .map(function (line) {
        if (!result[line[0]]) {
            result[line[0]] = line[1];
        }
    });
    return result;
}
function _readJSONStrings(file) {
    var result = {};
    //remove BOM
    if (file.charCodeAt(0) === 0xfeff) {
        file = file.slice(1);
    }
    var data = JSON.parse(file);
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var str = data_1[_i];
        result[str.Key] = str.enUS;
    }
    return result;
}
function _readClasses(tsv, tsv2, strings) {
    var arr = [];
    var cClass = tsv.header.indexOf("class");
    // str	dex	int	vit	tot	stamina
    var cStr = tsv.header.indexOf("str");
    var cDex = tsv.header.indexOf("dex");
    var cInt = tsv.header.indexOf("int");
    var cVit = tsv.header.indexOf("vit");
    var cStam = tsv.header.indexOf("stamina");
    var cHpadd = tsv.header.indexOf("hpadd");
    var cLifePerLvl = tsv.header.indexOf("LifePerLevel");
    var cStamPerLvl = tsv.header.indexOf("StaminaPerLevel");
    var cManaPerLvl = tsv.header.indexOf("ManaPerLevel");
    var cLifePerVit = tsv.header.indexOf("LifePerVitality");
    var cStamPerVit = tsv.header.indexOf("StaminaPerVitality");
    var cManaPerMag = tsv.header.indexOf("ManaPerMagic");
    var cAllSkills = tsv.header.indexOf("StrAllSkills");
    var cSkillTab1 = tsv.header.indexOf("StrSkillTab1");
    var cSkillTab2 = tsv.header.indexOf("StrSkillTab2");
    var cSkillTab3 = tsv.header.indexOf("StrSkillTab3");
    var cClassOnly = tsv.header.indexOf("StrClassOnly");
    var cCode = tsv2.header.indexOf("Code");
    var id = 0;
    for (var i = 1; i < tsv.lines.length; i++) {
        var clazz = tsv.lines[i][cClass];
        if (clazz && clazz != "Expansion") {
            arr[id] = {
                n: clazz,
                c: tsv2.lines[i][cCode],
                as: strings[tsv.lines[i][cAllSkills]],
                ts: [strings[tsv.lines[i][cSkillTab1]], strings[tsv.lines[i][cSkillTab2]], strings[tsv.lines[i][cSkillTab3]]],
                co: strings[tsv.lines[i][cClassOnly]],
                s: {
                    lpl: +tsv.lines[i][cLifePerLvl],
                    mpl: +tsv.lines[i][cManaPerLvl],
                    spl: +tsv.lines[i][cStamPerLvl],
                    lpv: +tsv.lines[i][cLifePerVit],
                    spv: +tsv.lines[i][cStamPerVit],
                    mpe: +tsv.lines[i][cManaPerMag],
                },
                a: {
                    str: +tsv.lines[i][cStr],
                    dex: +tsv.lines[i][cDex],
                    int: +tsv.lines[i][cInt],
                    vit: +tsv.lines[i][cVit],
                    stam: +tsv.lines[i][cStam],
                    hpadd: tsv.lines[i][cHpadd],
                },
            };
            id++;
        }
    }
    return arr;
}
function _readSkillDesc(tsv, strings) {
    var arr = {};
    var cSkillDesc = tsv.header.indexOf("skilldesc");
    var cStrName = tsv.header.indexOf("str name");
    for (var i = 1; i < tsv.lines.length; i++) {
        var id = tsv.lines[i][cSkillDesc];
        var skillStrName = tsv.lines[i][cStrName];
        if (id && skillStrName) {
            arr[id] = strings[skillStrName];
        }
    }
    return arr;
}
function _readSkills(tsv, skillDescs, strings) {
    var arr = [];
    var cSkillDesc = tsv.header.indexOf("skilldesc");
    var cId = tsv.header.indexOf("Id");
    if (cId < 0) {
        cId = tsv.header.indexOf("*Id");
    }
    var cCharclass = tsv.header.indexOf("charclass");
    for (var i = 1; i < tsv.lines.length; i++) {
        var id = +tsv.lines[i][cId];
        var skillDesc = tsv.lines[i][cSkillDesc];
        if (skillDesc) {
            var o = {};
            if (skillDescs[skillDesc])
                o.s = skillDescs[skillDesc];
            if (tsv.lines[i][cCharclass])
                o.c = tsv.lines[i][cCharclass];
            arr[id] = o;
        }
    }
    return arr;
}
function _readRareNames(tsv, idx, strings) {
    var arr = [];
    var cName = tsv.header.indexOf("name");
    var id = idx;
    for (var i = 1; i < tsv.lines.length; i++) {
        var name_1 = tsv.lines[i][cName];
        if (name_1) {
            arr[id - idx] = {
                n: strings[name_1],
            };
            id++;
        }
    }
    return arr;
}
function _readMagicNames(tsv, strings) {
    var arr = [];
    var cName = tsv.header.indexOf("Name");
    var cTransformcolor = tsv.header.indexOf("transformcolor");
    var id = 1;
    for (var i = 1; i < tsv.lines.length; i++) {
        var name_2 = tsv.lines[i][cName];
        if (name_2 != "Expansion") {
            var o = {};
            o.n = strings[name_2];
            if (tsv.lines[i][cTransformcolor])
                o.tc = tsv.lines[i][cTransformcolor];
            arr[id] = o;
            id++;
        }
    }
    return arr;
}
function _readProperties(tsv, strings) {
    var arr = {};
    var cCode = tsv.header.indexOf("code");
    var cStats = [];
    for (var j = 1; j <= 7; j++) {
        cStats[j] = {};
        cStats[j].cStat = tsv.header.indexOf("stat" + j);
        cStats[j].cFunc = tsv.header.indexOf("func" + j);
    }
    for (var i = 1; i < tsv.lines.length; i++) {
        var code = tsv.lines[i][cCode];
        if (code != "Expansion") {
            var prop = [];
            //prop.code = code;
            for (var j = 1; j <= 7; j++) {
                var stat = tsv.lines[i][cStats[j].cStat];
                var func = tsv.lines[i][cStats[j].cFunc];
                if (!stat && !func) {
                    break;
                }
                var s = {};
                if (stat)
                    s.s = stat;
                if (func)
                    s.f = +func;
                prop[j - 1] = s;
            }
            if (prop.length) {
                arr[code] = prop;
            }
        }
    }
    return arr;
}
function _readRunewords(tsv, strings) {
    var arr = [];
    var cName = tsv.header.indexOf("Name");
    for (var i = 1; i < tsv.lines.length; i++) {
        var name_3 = tsv.lines[i][cName];
        if (name_3) {
            var id = +name_3.substring(8);
            //TODO: why?
            if (id > 75) {
                id += 25;
            }
            else {
                id += 26;
            }
            arr[id] = {
                n: strings[tsv.lines[i][cName]],
            };
        }
    }
    return arr;
}
function _readTypes(tsv, strings) {
    var arr = {};
    var cCode = tsv.header.indexOf("Code");
    var cItemType = tsv.header.indexOf("ItemType");
    var cEquiv1 = tsv.header.indexOf("Equiv1");
    var cEquiv2 = tsv.header.indexOf("Equiv2");
    var cInvGfx = [];
    for (var i = 1; i <= 6; i++) {
        cInvGfx.push(tsv.header.indexOf("InvGfx" + i));
    }
    for (var i = 1; i < tsv.lines.length; i++) {
        var code = tsv.lines[i][cCode];
        if (code) {
            var o = {};
            var invgfx = [];
            for (var j = 0; j <= 6; j++) {
                if (tsv.lines[i][cInvGfx[j]])
                    invgfx[j] = tsv.lines[i][cInvGfx[j]];
            }
            o.ig = invgfx;
            o.eq1 = tsv.lines[i][cEquiv1];
            o.eq2 = tsv.lines[i][cEquiv2];
            o.n = tsv.lines[i][cItemType];
            o.c = [o.n];
            arr[code] = o;
        }
    }
    for (var _i = 0, _a = Object.keys(arr); _i < _a.length; _i++) {
        var k = _a[_i];
        arr[k].c = __spreadArrays(_resolvetItemTypeCategories(arr, k));
        if (arr[k] !== undefined && arr[arr[k].eq1] !== undefined) {
            arr[k].eq1n = arr[arr[k].eq1].n;
        }
        if (arr[k] !== undefined && arr[arr[k].eq2] !== undefined) {
            arr[k].eq2n = arr[arr[k].eq2].n;
        }
    }
    return arr;
}
function _resolvetItemTypeCategories(arr, key) {
    var res = [];
    if (arr[key] !== undefined) {
        res = __spreadArrays([arr[key].n], _resolvetItemTypeCategories(arr, arr[key].eq1), _resolvetItemTypeCategories(arr, arr[key].eq2));
    }
    return res;
}
function _readItems(tsv, itemtypes, strings) {
    var arr = [];
    var cCode = tsv.header.indexOf("code");
    var cNameStr = tsv.header.indexOf("namestr");
    var cStackable = tsv.header.indexOf("stackable");
    var cMinac = tsv.header.indexOf("minac");
    var cMaxac = tsv.header.indexOf("maxac");
    var cDurability = tsv.header.indexOf("durability");
    var cMindam = tsv.header.indexOf("mindam");
    var cMaxdam = tsv.header.indexOf("maxdam");
    var cTwoHandMindam = tsv.header.indexOf("2handmindam");
    var cTwoHandMaxdam = tsv.header.indexOf("2handmaxdam");
    var cMinmisdam = tsv.header.indexOf("minmisdam");
    var cMaxmisdam = tsv.header.indexOf("maxmisdam");
    var cReqstr = tsv.header.indexOf("reqstr");
    var cReqdex = tsv.header.indexOf("reqdex");
    var cHasinv = tsv.header.indexOf("hasinv");
    var cGemapplytype = tsv.header.indexOf("gemapplytype");
    var cInvfile = tsv.header.indexOf("invfile");
    var cUniqueInvfile = tsv.header.indexOf("uniqueinvfile");
    var cSetInvfile = tsv.header.indexOf("setinvfile");
    var cInvwidth = tsv.header.indexOf("invwidth");
    var cInvheight = tsv.header.indexOf("invheight");
    var cInvtransform = tsv.header.indexOf("InvTrans");
    var cType = tsv.header.indexOf("type");
    var cNormCode = tsv.header.indexOf("normcode");
    var cUberCode = tsv.header.indexOf("ubercode");
    var cUltraCode = tsv.header.indexOf("ultracode");
    for (var i = 1; i < tsv.lines.length; i++) {
        var code = tsv.lines[i][cCode];
        if (code) {
            var item = {};
            item.code = code;
            item.nc = tsv.lines[i][cNormCode];
            item.exc = tsv.lines[i][cUberCode];
            item.elc = tsv.lines[i][cUltraCode];
            item.iq =
                item.code === item.exc
                    ? types.EItemQuality.exceptional
                    : item.code === item.elc
                        ? types.EItemQuality.elite
                        : types.EItemQuality.normal;
            item.n = strings[tsv.lines[i][cNameStr]];
            if (tsv.lines[i][cStackable] && +tsv.lines[i][cStackable] > 0)
                item.s = 1;
            if (tsv.lines[i][cMinac] && +tsv.lines[i][cMinac] > 0)
                item.minac = +tsv.lines[i][cMinac];
            if (tsv.lines[i][cMaxac] && +tsv.lines[i][cMaxac] > 0)
                item.maxac = +tsv.lines[i][cMaxac];
            if (tsv.lines[i][cDurability])
                item.durability = +tsv.lines[i][cDurability];
            if (tsv.lines[i][cMindam] && +tsv.lines[i][cMindam] > 0)
                item.mind = +tsv.lines[i][cMindam];
            if (tsv.lines[i][cMaxdam] && +tsv.lines[i][cMaxdam] > 0)
                item.maxd = +tsv.lines[i][cMaxdam];
            if (tsv.lines[i][cTwoHandMindam] && +tsv.lines[i][cTwoHandMindam] > 0)
                item.min2d = +tsv.lines[i][cTwoHandMindam];
            if (tsv.lines[i][cTwoHandMaxdam] && +tsv.lines[i][cTwoHandMaxdam] > 0)
                item.max2d = +tsv.lines[i][cTwoHandMaxdam];
            if (tsv.lines[i][cMinmisdam] && +tsv.lines[i][cMinmisdam] > 0)
                item.minmd = +tsv.lines[i][cMinmisdam];
            if (tsv.lines[i][cMaxmisdam] && +tsv.lines[i][cMaxmisdam] > 0)
                item.maxmd = +tsv.lines[i][cMaxmisdam];
            if (tsv.lines[i][cReqstr])
                item.rs = +tsv.lines[i][cReqstr];
            if (tsv.lines[i][cReqdex])
                item.rd = +tsv.lines[i][cReqdex];
            if (tsv.lines[i][cHasinv])
                item.hi = +tsv.lines[i][cHasinv];
            if (tsv.lines[i][cGemapplytype])
                item.gt = +tsv.lines[i][cGemapplytype];
            if (tsv.lines[i][cInvfile])
                item.i = tsv.lines[i][cInvfile];
            if (tsv.lines[i][cUniqueInvfile])
                item.ui = tsv.lines[i][cUniqueInvfile];
            if (tsv.lines[i][cSetInvfile])
                item.si = tsv.lines[i][cSetInvfile];
            if (tsv.lines[i][cInvwidth])
                item.iw = +tsv.lines[i][cInvwidth];
            if (tsv.lines[i][cInvheight])
                item.ih = +tsv.lines[i][cInvheight];
            if (tsv.lines[i][cInvtransform])
                item.it = +tsv.lines[i][cInvtransform];
            var type = itemtypes[tsv.lines[i][cType]];
            if (type && type.ig) {
                item.ig = type.ig;
                item.eq1n = type.eq1n;
                item.eq2n = type.eq2n;
                item.c = type.c;
            }
            arr.push(item);
        }
    }
    return arr;
}
function _readGems(miscItems, tsv, strings) {
    var cCode = tsv.header.indexOf("code");
    var types = ["weapon", "helm", "shield"];
    var cols = {};
    for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
        var type = types_1[_i];
        cols[type] = [];
        for (var j = 1; j <= 3; j++) {
            cols[type][j] = {};
            cols[type][j].cMod = tsv.header.indexOf(type + "Mod" + j + "Code");
            cols[type][j].cParam = tsv.header.indexOf(type + "Mod" + j + "Param");
            cols[type][j].cMin = tsv.header.indexOf(type + "Mod" + j + "Min");
            cols[type][j].cMax = tsv.header.indexOf(type + "Mod" + j + "Max");
        }
    }
    for (var i = 1; i < tsv.lines.length; i++) {
        var code = tsv.lines[i][cCode];
        if (code && code != "Expansion") {
            var item = miscItems[code];
            for (var k = 0; k < 3; k++) {
                var type = types[k];
                for (var j = 1; j <= 3; j++) {
                    var mod = tsv.lines[i][cols[type][j].cMod];
                    if (!mod) {
                        break;
                    }
                    if (j == 1) {
                        if (!item.m)
                            item.m = [];
                        item.m[k] = [];
                    }
                    var m = {};
                    m.m = mod;
                    if (tsv.lines[i][cols[type][j].cParam])
                        m.p = +tsv.lines[i][cols[type][j].cParam];
                    if (tsv.lines[i][cols[type][j].cMin])
                        m.min = +tsv.lines[i][cols[type][j].cMin];
                    if (tsv.lines[i][cols[type][j].cMax])
                        m.max = +tsv.lines[i][cols[type][j].cMax];
                    item.m[k].push(m);
                }
            }
        }
    }
}
function _readSetOrUnqItems(tsv, strings) {
    var arr = [];
    var cIndex = tsv.header.indexOf("index");
    var cInvfile = tsv.header.indexOf("invfile");
    var cCode = tsv.header.indexOf("code");
    if (cCode < 0)
        cCode = tsv.header.indexOf("item");
    var cInvtransform = tsv.header.indexOf("invtransform");
    var id = 0;
    for (var i = 1; i < tsv.lines.length; i++) {
        var index = tsv.lines[i][cIndex];
        if (index && index != "Expansion") {
            var o = {};
            o.n = strings[tsv.lines[i][cIndex]];
            if (tsv.lines[i][cInvfile])
                o.i = tsv.lines[i][cInvfile];
            if (tsv.lines[i][cCode])
                o.c = tsv.lines[i][cCode];
            if (tsv.lines[i][cInvtransform])
                o.tc = tsv.lines[i][cInvtransform];
            arr[id] = o;
            id++;
        }
    }
    return arr;
}
function _readItemStatCosts(tsv, strings) {
    var arr = [];
    var cStat = tsv.header.indexOf("Stat");
    var cId = tsv.header.indexOf("ID");
    if (cId < 0) {
        cId = tsv.header.indexOf("*ID");
    }
    var cCSvBits = tsv.header.indexOf("CSvBits");
    var cCSvParam = tsv.header.indexOf("CSvParam");
    var cCSvSigned = tsv.header.indexOf("CSvSigned");
    var cEncode = tsv.header.indexOf("Encode");
    var cValShift = tsv.header.indexOf("ValShift");
    var cSigned = tsv.header.indexOf("Signed");
    var cSaveBits = tsv.header.indexOf("Save Bits");
    var cSaveAdd = tsv.header.indexOf("Save Add");
    var cSaveParamBits = tsv.header.indexOf("Save Param Bits");
    var cDescPriority = tsv.header.indexOf("descpriority");
    var cDescFunc = tsv.header.indexOf("descfunc");
    var cDescVal = tsv.header.indexOf("descval");
    var cDescstrpos = tsv.header.indexOf("descstrpos");
    var cDescstrneg = tsv.header.indexOf("descstrneg");
    var cDescstr2 = tsv.header.indexOf("descstr2");
    var cDgrp = tsv.header.indexOf("dgrp");
    var cDgrpFunc = tsv.header.indexOf("dgrpfunc");
    var cDgrpVal = tsv.header.indexOf("dgrpval");
    var cDgrpstrpos = tsv.header.indexOf("dgrpstrpos");
    var cDgrpstrneg = tsv.header.indexOf("dgrpstrneg");
    var cDgrpstr2 = tsv.header.indexOf("dgrpstr2");
    var cOp = tsv.header.indexOf("op");
    var cOpParam = tsv.header.indexOf("op param");
    var cOpBase = tsv.header.indexOf("op base");
    var cOpStat1 = tsv.header.indexOf("op stat1");
    var cOpStat2 = tsv.header.indexOf("op stat2");
    var cOpStat3 = tsv.header.indexOf("op stat3");
    for (var i = 1; i < tsv.lines.length; i++) {
        var id = +tsv.lines[i][cId];
        var stat = tsv.lines[i][cStat];
        if (stat) {
            var o = {};
            o.s = stat;
            if (tsv.lines[i][cCSvBits])
                o.cB = +tsv.lines[i][cCSvBits];
            if (tsv.lines[i][cCSvParam])
                o.cP = +tsv.lines[i][cCSvParam];
            if (tsv.lines[i][cCSvSigned])
                o.cS = +tsv.lines[i][cCSvSigned];
            if (tsv.lines[i][cEncode])
                o.e = +tsv.lines[i][cEncode];
            if (tsv.lines[i][cValShift])
                o.vS = +tsv.lines[i][cValShift];
            if (tsv.lines[i][cSigned])
                o.sS = +tsv.lines[i][cSigned];
            if (tsv.lines[i][cSaveBits])
                o.sB = +tsv.lines[i][cSaveBits];
            if (tsv.lines[i][cSaveAdd])
                o.sA = +tsv.lines[i][cSaveAdd];
            if (tsv.lines[i][cSaveParamBits])
                o.sP = +tsv.lines[i][cSaveParamBits];
            if (tsv.lines[i][cDescPriority])
                o.so = +tsv.lines[i][cDescPriority];
            if (tsv.lines[i][cDescFunc])
                o.dF = +tsv.lines[i][cDescFunc];
            if (tsv.lines[i][cDescVal])
                o.dV = +tsv.lines[i][cDescVal];
            if (tsv.lines[i][cDescstrpos])
                o.dP = strings[tsv.lines[i][cDescstrpos]];
            if (tsv.lines[i][cDescstrneg])
                o.dN = strings[tsv.lines[i][cDescstrneg]];
            if (tsv.lines[i][cDescstr2])
                o.d2 = strings[tsv.lines[i][cDescstr2]];
            if (tsv.lines[i][cDgrp])
                o.dg = +tsv.lines[i][cDgrp];
            if (tsv.lines[i][cDgrpFunc])
                o.dgF = +tsv.lines[i][cDgrpFunc];
            if (tsv.lines[i][cDgrpVal])
                o.dgV = +tsv.lines[i][cDgrpVal];
            if (tsv.lines[i][cDgrpstrpos])
                o.dgP = strings[tsv.lines[i][cDgrpstrpos]];
            if (tsv.lines[i][cDgrpstrneg])
                o.dN = strings[tsv.lines[i][cDgrpstrneg]];
            if (tsv.lines[i][cDgrpstr2])
                o.dg2 = strings[tsv.lines[i][cDgrpstr2]];
            if (tsv.lines[i][cOp])
                o.o = +tsv.lines[i][cOp];
            if (tsv.lines[i][cOpParam])
                o.op = +tsv.lines[i][cOpParam];
            if (tsv.lines[i][cOpBase])
                o.ob = tsv.lines[i][cOpBase];
            if (tsv.lines[i][cOpStat1])
                o.os = [tsv.lines[i][cOpStat1]];
            if (tsv.lines[i][cOpStat2])
                o.os[1] = tsv.lines[i][cOpStat2];
            if (tsv.lines[i][cOpStat3])
                o.os[2] = tsv.lines[i][cOpStat3];
            var dmgstatrange = item_property_stat_count[stat];
            if (dmgstatrange) {
                o.np = dmgstatrange.numprops;
                o.dR = strings[dmgstatrange.rangestr];
                o.dE = strings[dmgstatrange.equalstr];
            }
            arr[id] = o;
        }
    }
    return arr;
}
//# sourceMappingURL=parser.js.map