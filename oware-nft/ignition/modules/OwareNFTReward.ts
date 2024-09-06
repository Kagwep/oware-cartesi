import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_OWNER = "1893456000";


const OwareNFTRewardModule = buildModule("OwareNFTRewardModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", INITIAL_OWNER);


  const owareNFTRewardModule = m.contract("OwareNFTReward", [initialOwner]);

  return {  owareNFTRewardModule };
});

export default OwareNFTRewardModule;
