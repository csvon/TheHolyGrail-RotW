"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConstantData = exports.getConstantData = void 0;
var versionedConstants = new Map();
function getConstantData(version) {
    if (!(version in versionedConstants)) {
        throw new Error("No constant data found for this version " + version);
    }
    return versionedConstants[version];
}
exports.getConstantData = getConstantData;
function setConstantData(version, data) {
    versionedConstants[version] = data;
}
exports.setConstantData = setConstantData;
//# sourceMappingURL=constants.js.map