
import { DAPP_ADDRESS, INPUTBOX_ADDRESS } from "../constants"
import { ethers } from "ethers"
import { InputBox__factory } from "@cartesi/rollups"

export const sendInput = async (value,signer,toast) => {
    console.log(signer)

    try {
        const inputBox = InputBox__factory.connect(INPUTBOX_ADDRESS,signer)
        console.log(inputBox)
        const inputBytes = ethers.utils.isBytesLike(value) ? value : ethers.utils.toUtf8Bytes(value);
        const tx = await inputBox.addInput(DAPP_ADDRESS, inputBytes)
        return await waitForTransaction(tx,toast)
    } catch (e) {
        console.log("Send input failed: ",e)
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