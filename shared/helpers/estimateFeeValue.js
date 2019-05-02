import helpers, { constants } from 'helpers'


const setEstimatedFeeValues = async ({ estimatedFeeValues }) => {

  let newEstimatedFeeValues = { ...estimatedFeeValues }

  for await (let item of constants.coinsWithDynamicFee) { // eslint-disable-line
    try {
      const newValue = await helpers[item].estimateFeeValue({ method: 'swap', speed: 'fast' })
      if (newValue) {
        newEstimatedFeeValues[item] = newValue
      }
    } catch (error) {
      console.error('Set Estimated Fee Values in for error: ', error)
    }
  }
  return newEstimatedFeeValues
}


export default {
  setEstimatedFeeValues,
}
