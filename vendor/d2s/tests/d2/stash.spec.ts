import { expect, should } from "chai";
import { read, write } from "../../src/d2/stash";
import { constants } from "../../src/data/versions/96_constant_data";
import * as path from "path";
import * as fs from "fs";
import * as version99 from "../../src/data/versions/99_constant_data";
import * as version105 from "../../src/data/versions/105_constant_data";

describe("stash", () => {
  const readUInt32LE = (buffer: Buffer, offset: number): number => {
    if (offset + 4 > buffer.length) {
      return 0;
    }
    return (
      buffer[offset]
      | (buffer[offset + 1] << 8)
      | (buffer[offset + 2] << 16)
      | ((buffer[offset + 3] << 24) >>> 0)
    ) >>> 0;
  };

  const extractFirstSixModernJMSections = (buffer: Buffer): Buffer => {
    const sections: Buffer[] = [];
    let offset = 0;

    while (offset + 68 <= buffer.length && sections.length < 6) {
      if (readUInt32LE(buffer, offset) !== 0xaa55aa55) {
        break;
      }

      const size = readUInt32LE(buffer, offset + 16);
      if (!size || offset + size > buffer.length) {
        break;
      }

      if (buffer[offset + 64] === 0x4a && buffer[offset + 65] === 0x4d) {
        sections.push(buffer.slice(offset, offset + size));
      }

      offset += size;
    }

    return sections.length > 0 ? Buffer.concat(sections) : buffer;
  };

  it("should read D2R shared stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/SharedStashSoftCoreV2.d2i`));
    const jsonData = await read(buffer, constants, 0x62);
    expect(jsonData.pageCount, "pageCount").to.eq(3);
    expect(jsonData.sharedGold, "sharedGold").to.eq(2500000);
    expect(jsonData.version, "version").to.eq("98");
  });

  it("should write D2R shared stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/SharedStashSoftCoreV2.d2i`));
    const jsonData = await read(buffer, constants, 0x62);

    const savedBytes = await write(jsonData, constants, 0x62);

    expect(buffer.compare(savedBytes)).to.eq(0);
  });

  it("should read D2R shared stash file, with version autodetection", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/SharedStashSoftCoreV2_0x63.d2i`));
    const jsonData = await read(buffer, version99.constants, null);
    const savedBytes = await write(jsonData, version99.constants, 0x62);
    const savedJsonData = await read(savedBytes, version99.constants, null);
    jsonData.version = "";
    savedJsonData.version = "";
    expect(jsonData).to.deep.eq(savedJsonData);
  });

  it("should read plugy shared stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/_LOD_SharedStashSave.sss`));
    const jsonData = await read(buffer, constants, 0x60);

    expect(jsonData.pageCount, "pageCount").to.eq(145);
    expect(jsonData.sharedGold, "sharedGold").to.eq(5912844);
    expect(jsonData.version, "version").to.eq("02");
  });

  it("should provide read and write consistency for plugy shared stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/_LOD_SharedStashSave.sss`));
    const jsonData = await read(buffer, constants, 0x60);
    const newBuffer = await write(jsonData, constants, 0x60);
    const newJson = await read(newBuffer, constants, 0x60);

    expect(buffer.length, "file size").to.eq(newBuffer.length);
    expect(newJson, "json").to.deep.eq(jsonData);
  });

  it("should read plugy private stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/PrivateStash.d2x`));
    const jsonData = await read(buffer, constants, 0x60);
    expect(jsonData.pageCount, "pageCount").to.eq(56);
    expect(jsonData.sharedGold, "sharedGold").to.eq(0);
    expect(jsonData.version, "version").to.eq("01");
  });

  it("should provide read and write consistency for plugy private stash file", async () => {
    const buffer = fs.readFileSync(path.join(__dirname, `../../examples/stash/PrivateStash.d2x`));
    const jsonData = await read(buffer, constants, 0x60);
    const newBuffer = await write(jsonData, constants, 0x60);
    const newJson = await read(newBuffer, constants, 0x60);

    expect(buffer.length, "file size").to.eq(newBuffer.length);
    expect(newJson, "json").to.deep.eq(jsonData);
  });

  it("should derive displayed defense for eth armor in modern multi-section stash", async () => {
    const modernBuffer = fs.readFileSync(path.join(__dirname, `../../examples/misc/mModernSharedStashSoftCoreV2.d2i`));
    const stashBuffer = extractFirstSixModernJMSections(modernBuffer);
    const jsonData = await read(stashBuffer, version105.constants, 105);

    let spiritShroud = null;
    for (const page of jsonData.pages || []) {
      for (const item of page.items || []) {
        if (item?.unique_name === "The Spirit Shroud") {
          spiritShroud = item;
          break;
        }
      }
      if (spiritShroud) {
        break;
      }
    }

    expect(spiritShroud, "Spirit Shroud item").to.not.equal(null);
    expect(spiritShroud.ethereal, "ethereal").to.eq(1);
    expect(spiritShroud.defense_rating, "defense_rating").to.eq(442);
  });
});
