export const contractAccounts = {
  deployer: {
    default: 0, // here this will by default take the first account as deployer
    hardhat: 0, // similarly on hardhat it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    fuji: 0,
    mainnet: 0,
  },
  user: {
    // Used for testing
    default: 1,
    hardhat: 1,
  },
  sushiSwapFactory: {
    default: "0x99653EfFF54a26bc24567A251F74d8A0A9905390",
    hardhat: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    fuji: "0x99653EfFF54a26bc24567A251F74d8A0A9905390",
    mainnet: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  },
  sushiSwapRouter: {
    default: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    hardhat: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    fuji: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    mainnet: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
  },
  pangolinFactory: {
    default: "0x5898f69bA879346AB91d1582F5450335Dd94DaCd",
    hardhat: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
    fuji: "0x5898f69bA879346AB91d1582F5450335Dd94DaCd",
    mainnet: "0xefa94DE7a4656D787667C749f7E1223D71E9FD88",
  },
  pangolinRouter: {
    default: "0x456eb2F55555bF72a728bF971846686253910547",
    hardhat: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
    fuji: "0x456eb2F55555bF72a728bF971846686253910547",
    mainnet: "0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106",
  },
  traderJoeFactory: {
    default: "0x6b516B23A260E2d904Dbfa47c7e7AFd04E5ADBC9",
    hardhat: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
    fuji: "0x6b516B23A260E2d904Dbfa47c7e7AFd04E5ADBC9",
    mainnet: "0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10",
  },
  traderJoeRouter: {
    default: "0x4C7Edcc43424f474C2b37680565c1163f94c66FC",
    hardhat: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    fuji: "0x4C7Edcc43424f474C2b37680565c1163f94c66FC",
    mainnet: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
  },
  wavax: {
    default: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    hardhat: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    fuji: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c",
    mainnet: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
  },
  usdt: {
    default: "0x320f9A00BDDFE466887A8D0390cF32e9373fFc9f",
    hardhat: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
    fuji: "0x320f9A00BDDFE466887A8D0390cF32e9373fFc9f",
    mainnet: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
  },
  usdc: {
    default: "0x684ebfda880c16652F7F571223c11029b96d0e10",
    hardhat: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
    fuji: "0x684ebfda880c16652F7F571223c11029b96d0e10",
    mainnet: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  },
  dai: {
    default: "0x2125829808Fb3466d2114590b704f0266421951D",
    hardhat: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    fuji: "0x2125829808Fb3466d2114590b704f0266421951D",
    mainnet: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
  },
  joeToken: {
    default: "0x2E4828F1a2dFC54d15Ef398ee4d0BE26d7211d56",
    hardhat: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
    fuji: "0x2E4828F1a2dFC54d15Ef398ee4d0BE26d7211d56",
    mainnet: "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd",
  },
  png: {
    default: "0x6d0A79756774c7cbac6Ce5c5e3b0f40b0ccCcB20",
    hardhat: "0x60781C2586D68229fde47564546784ab3fACA982",
    fuji: "0x6d0A79756774c7cbac6Ce5c5e3b0f40b0ccCcB20",
    mainnet: "0x60781C2586D68229fde47564546784ab3fACA982",
  },
  flashSwapPangolinSushiAddr: {
    fuji: "0x9a8Fc5F22615b870196964495A23BA874bDa0CAC",
    mainnet: "0xf66D30CEb072ea114EeD5444534E0f445e31763B",
  },
  flashSwapSushiPangoAddr: {
    fuji: "0x3F57Fba60C2D4Cf51e5220193390c0802e0440ee",
    mainnet: "0x81347bD22546025E37E385739AB189f44D3bA013",
  },
  flashSwapPangoJoeAddr: {
    fuji: "0x4493288630f293cF5aFd94F325b85978f7ADE1Cb",
    mainnet: "0xC433434C62f413Ec69f392AeC74Fa74a3551782F",
  },
  flashSwapJoePangoAddr: {
    fuji: "0x75AE8752151746079B66B6B9A7ED1dbe20F156A5",
    mainnet: "0x6a247370CE1D82af104987cB22046eC554b95cD3",
  },
  pangolinComputeLiquidityValueAddr: {
    fuji: "0x1998eA0830C7A8961d235Fe1F48e02B73Ffbe335",
    mainnet: "0xE08998b1C3dE1f9Bca9DcFcE945E4bB4DEfD6A7d",
  },
  sushiswapV2ComputeLiquidityValueAddr: {
    fuji: "0xe0c855673912B805620545d0372D36861B8FC87B",
    mainnet: "0x6f1B2B1eae80b5C03f27E961162B664789895B85",
  },
  traderJoeComputeLiquidityValueAddr: {
    fuji: "0xc32608bBb75c20f09ab5e794F64283A7E4C00e59",
    mainnet: "0x2Ae1F94eFaC53e0394251E59D46436350dB64C15",
  },
  avaxChainLink: {
    hardhat: "0x0A77230d17318075983913bC2145DB16C7366156",
    fuji: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD",
    mainnet: "0x0A77230d17318075983913bC2145DB16C7366156",
  },
  daiChainLink: {
    hardhat: "0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300",
    mainnet: "0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300",
  },
  joeChainLink: {
    hardhat: "0x02D35d3a8aC3e1626d3eE09A78Dd87286F5E8e3a",
    mainnet: "0x02D35d3a8aC3e1626d3eE09A78Dd87286F5E8e3a",
  },
  mimChainLink: {
    hardhat: "0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb",
    mainnet: "0x54EdAB30a7134A16a54218AE64C73e1DAf48a8Fb",
  },
  spellChainLink: {
    hardhat: "0x4F3ddF9378a4865cf4f28BE51E10AECb83B7daeE",
    mainnet: "0x4F3ddF9378a4865cf4f28BE51E10AECb83B7daeE",
  },
  usdcChainLink: {
    hardhat: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
    mainnet: "0xF096872672F44d6EBA71458D74fe67F9a77a23B9",
  },
  usdtChainLink: {
    hardhat: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
    fuji: "0x7898AcCC83587C3C55116c5230C17a6Cd9C71bad",
    mainnet: "0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a",
  },
};
