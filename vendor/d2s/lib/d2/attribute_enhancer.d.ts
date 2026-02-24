import * as types from "./types";
export declare function enhanceAttributes(char: types.ID2S, constants: types.IConstantData, config?: types.IConfig): Promise<void>;
export declare function enhancePlayerAttributes(char: types.ID2S, constants: types.IConstantData, config?: types.IConfig): Promise<void>;
export declare function enhanceItems(items: types.IItem[], constants: types.IConstantData, level?: number, config?: types.IConfig, parent?: types.IItem): Promise<void>;
export declare function enhanceItem(item: types.IItem, constants: types.IConstantData, level?: number, config?: types.IConfig, parent?: types.IItem): void;
