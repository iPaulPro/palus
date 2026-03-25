import { lensDeployments } from "lens-modules/deployments";

export const IS_TESTNET = import.meta.env.VITE_USE_TESTNET === "true";

export const CONTRACTS = {
  actionHub: IS_TESTNET
    ? lensDeployments.testnet.ActionHub.address
    : lensDeployments.mainnet.ActionHub.address,
  app: IS_TESTNET
    ? "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7"
    : "0xCa01Da446811d76aa7aD885e5fa39DF2031096cB",
  banMemberGroupRule: IS_TESTNET
    ? lensDeployments.testnet.BanMemberGroupRule.address
    : lensDeployments.mainnet.BanMemberGroupRule.address,
  collectorOnlyPostRule: IS_TESTNET
    ? "0xD9e2306525a4b2B379A4a602684ff805a3A6aE88"
    : "0x322437950F4066b8771a3C07C8B8Dd1135979a9a",
  followingOnlyPostRule: IS_TESTNET
    ? "0x8d3f8e9cCB82c6B4903fc7E5f2dE1F5985E4F356"
    : "0x873A3Ea97181D1617B4bF80998E9D0fad26fB333",
  groupGatedFeedRule: IS_TESTNET
    ? lensDeployments.testnet.GroupGatedFeedRule.address
    : lensDeployments.mainnet.GroupGatedFeedRule.address,
  groupGatedPostRule: IS_TESTNET
    ? "0x83F5E3bb7209111002eB6C98A89a9869cD63a0e1"
    : "0x4450451C88DdfE41880D2b702c3Cf8D4d394432F",
  lensGlobalGraph: IS_TESTNET
    ? lensDeployments.testnet.LensGlobalGraph.address
    : lensDeployments.mainnet.LensGlobalGraph.address,
  nativeToken: "0x000000000000000000000000000000000000800A",
  pinPostAccountAction: IS_TESTNET
    ? "0x2E148a60881C62c9b396c45bA1D6347241F3ebc9"
    : "0x96a66659ca64Fc146Ee0f804cd582AAdA1c93e35",
  pointlessToken: IS_TESTNET
    ? "0x8827054498a0B36259A51e675Feb13C1fCa9f591" // $TEST
    : "0x2142a24c46f67432c3605dd1cccbbb4abfe90e63",
  pollVoteAction: IS_TESTNET
    ? "0x58C03173a0A71fb0e1AF00625E21f84CC799FC56"
    : "0x0B9507487800F0c385A240199fDf1d79131E8e25",
  simpleCollectAction: IS_TESTNET
    ? lensDeployments.testnet.SimpleCollectAction.address
    : lensDeployments.mainnet.SimpleCollectAction.address,
  tippingAccountAction: IS_TESTNET
    ? lensDeployments.testnet.TippingAccountAction.address
    : lensDeployments.mainnet.TippingAccountAction.address,
  tippingPostAction: IS_TESTNET
    ? lensDeployments.testnet.TippingPostAction.address
    : lensDeployments.mainnet.TippingPostAction.address,
  usdc: IS_TESTNET ? "" : "0x88F08E304EC4f90D644Cec3Fb69b8aD414acf884",
  weth: IS_TESTNET
    ? "0xaA91D645D7a6C1aeaa5988e0547267B77d33fe16"
    : "0xE5ecd226b3032910CEaa43ba92EE8232f8237553",
  wrappedNativeToken: IS_TESTNET
    ? "0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"
    : "0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"
} as const;
