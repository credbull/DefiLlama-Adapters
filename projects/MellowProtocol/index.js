const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

const config = {
  ethereum: {
    registry: '0xfd23f971696576331fcf96f80a20b4d3b31ca5b2',
    fromBlock: 15237714,
  },
  polygon: {
    registry: '0xd3d0e85f225348a2006270daf624d8c46cae4e1f',
    fromBlock: 31243728,
  },
  polygon_zkevm: {
    registry: '0xc02a7B4658861108f9837007b2DF2007d6977116',
    fromBlock: 2665891,
  },
  base: {
    registry: '0xc02a7B4658861108f9837007b2DF2007d6977116',
    fromBlock: 2785683,
  }
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { registry, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}

      const vaults = await api.call({ abi: 'function vaults() view returns (address[])', target: registry })
      const tokens = await api.multiCall({ abi: 'function vaultTokens() view returns (address[])', calls: vaults })
      const bals = await api.multiCall({ abi: 'function tvl() view returns (uint256[] minTokenAmounts, uint256[] maxTokenAmounts)', calls: vaults, permitFailure: true })
      tokens.forEach((tokens, i) => {
        if (!bals[i]) return;
        let balsInner = bals[i].minTokenAmounts
        tokens.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, balsInner[i], api.chain))
      })

      return balances
    }
  }
})