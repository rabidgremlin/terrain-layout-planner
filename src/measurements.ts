export type Units = 'in' | 'cm'
export const unitFactor = (units: Units) => units === 'cm' ? 2.54 : 1
export const displayNumber = (value: number) => Number(value.toFixed(8)).toString()
export const measurement = (value: number, units: Units) => `${displayNumber(value * unitFactor(units))}${units === 'in' ? '″' : ' cm'}`

