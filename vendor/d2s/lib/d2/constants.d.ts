import * as types from "./types";
declare function getConstantData(version: number): types.IConstantData;
declare function setConstantData(version: number, data: types.IConstantData): void;
export { getConstantData, setConstantData };
