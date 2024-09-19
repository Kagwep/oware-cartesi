import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_OWNER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";


const OwareNFTRewardModule = buildModule("OwareNFTRewardModule", (m) => {
  const initialOwner = m.getParameter("initialOwner", INITIAL_OWNER);


  const owareNFTRewardModule = m.contract("OwareNFTReward", [initialOwner]);

  return {  owareNFTRewardModule };
});

export default OwareNFTRewardModule;
