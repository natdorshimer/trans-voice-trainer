import {UserMicrophone} from "@/app/lib/microphone/UserMicrophone";

export const getFrequencyMagnitudeData = (
    userMicrophone: UserMicrophone
): number[] => {
    const analyserNode = userMicrophone.analyserNode
    const byteFreqData = new Uint8Array(analyserNode.frequencyBinCount)
    analyserNode.getByteFrequencyData(byteFreqData)

    return Array.from(byteFreqData).reverse()
}