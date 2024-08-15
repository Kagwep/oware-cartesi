
import { DAPP_ADDRESS, INPUTBOX_ADDRESS, HARDHAT_LOCALHOST_RPC_URL,HARDHAT_DEFAULT_MNEMONIC } from "../constants"
import { ethers } from "ethers"
import { InputBox__factory } from "@cartesi/rollups"
import { JsonRpcProvider } from "@ethersproject/providers";

export const sendInput = async (value,accountIndex,toast) => {

  

    const provider = new JsonRpcProvider(HARDHAT_LOCALHOST_RPC_URL);
    const mnemonicInstance = ethers.Mnemonic.fromPhrase(HARDHAT_DEFAULT_MNEMONIC,);
    const signer = ethers.HDNodeWallet.fromMnemonic(
        mnemonicInstance,
        `m/44'/60'/0'/0/${accountIndex}`
    ).connect(provider);
    console.log(signer.privateKey)

    try {
        const inputBox = InputBox__factory.connect(
            INPUTBOX_ADDRESS,
            signer
        );

        const inputBytes = ethers.isBytesLike(value) ? value : ethers.toUtf8Bytes(value);
       
        const tx = await inputBox.addInput(DAPP_ADDRESS, inputBytes)
        return await waitForTransaction(tx,toast)
    } catch (e) {
        console.log("Send input failed: ",e.message)
    }
   

}

const waitForTransaction = async (tx, toast) => {

    toast({
        title:"Transaction Sent",
        description: `Waiting for confirmation`,
        status:"success",
        duration: 9000,
        isCloseable:true,
        position:"top-right"
    })

    const receipt = await tx.wait(1)
    const event = receipt.events?.find((e) => e.event === "InputAdded")

    toast({
        title:"Confirmed",
        description: `Input Added: ${event.args.inboxInputIndex}`,
        status:"success",
        duration: 9000,
        isCloseable:true,
        position:"top-right"
    })

    
    return receipt
}

export const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };