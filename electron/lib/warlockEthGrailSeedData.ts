// Ethereal grail overlay for RotW items (unique items only).
// Add entries using the same nested shape as EthGrailSeedData.
export const warlockEthGrailSeedData: Record<string, any> = {
  uniques: {
    armor: {
      helm: {
        exceptional: {
          "Hellwarden's Will": {},
        },
      },
      belts: {
        elite: {
          "Gheed's Wager": {},
        },
      },
      boots: {
        elite: {
          Wraithstep: {},
        },
      },
    },
    weapons: {
      dagger: {
        elite: {
          "Bloodpact Shard": {},
        },
      },
      "swords (1-h)": {
        elite: {
          Dreadfang: {},
        },
      },
    },
    other: {
      classes: {
        warlock: {
          "Measured Wrath": {},
          "Ars Dul'Mephistos": {},
          "Ars Tor'Baalos": {},
          "Ars Al'Diabolos": {},
        },
      },
    },
  },
};
