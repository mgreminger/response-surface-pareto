import { min, max } from "mathjs";
import { writable, derived } from 'svelte/store';

export const dataText = writable([
  ["7.5", "15", "0.8779", "1270.98"],
  ["2.5", "15", "7.87986", "426.956"],
  ["7.5", "7", "1.46584", "1101.3"],
  ["2.5", "7", "22.17822", "368.753"],
  ["7.5", "11", "1.13536", "1186.14"],
  ["2.5", "11", "12.27396", "397.855"],
  ["5", "15", "2.14489", "850.594"],
  ["5", "7", "4.30295", "735.856"],
  ["5", "11", "2.94196", "793.225"],
]);
export const parameters = writable([
  "Material Thickness (mm)",
  "Rib Height (mm)",
  "Displacement (mm)",
  "Mass (g)",
]);
export const parameterTypes = writable([]);
export const parameterOptions = writable([]);
export const numParetoPoints = writable(10);

export const xAxisOutput = writable(null);
export const yAxisOutput = writable(null);

export const data = derived(
  dataText,
  $dataText => {
    let data = undefined;
    if ($dataText.length > 0) {
      data = $dataText.map((row) => row.map(parseFloat));
      if (!data.flat().reduce((total, value) => total && !isNaN(value), true)) {
        data = undefined; // at least on entry in the table is NaN
      }
    }
    return data;
  }
);

export const inputs = derived(
  [parameters, parameterTypes],
  ([$parameters, $parameterTypes]) => {
    let inputs = []
    $parameterTypes.forEach( (value, index) => {
      if(value === 'input') {
        inputs.push({index: index, text: $parameters[index]})
      }
    })
    return inputs;
  }
)

export const nonTargetOutputs = derived(
  [parameters, parameterTypes, parameterOptions],
  ([$parameters, $parameterTypes, $parameterOptions]) => {
    let nonTargetOutputs = [{index:null, text: ''}]
    $parameterTypes.forEach( (value, index) => {
      if(value === 'output' && $parameterOptions[index] &&
         $parameterOptions[index].goal !== 'target') {
        nonTargetOutputs.push({index: index, text: $parameters[index]})
      }
    })
    return nonTargetOutputs;
  }
)

export const fullyDefined = derived(
  [nonTargetOutputs, inputs, xAxisOutput, yAxisOutput],
  ([$nonTargetOutputs, $inputs, $xAxisOutput, $yAxisOutput]) => {
    return $nonTargetOutputs.length >= 3 && $inputs.length >= 1 && $xAxisOutput !== null && 
    $yAxisOutput !== null && $xAxisOutput !== $yAxisOutput;
  }
)

export const parMin = derived(
  data,
  $data => {
    let parMin;
    if ($data){
      parMin = min($data, 0);
    }
    return parMin;
  }
)

export const parMax = derived(
  data,
  $data => {
    let parMax;
    if ($data){
      parMax = max($data, 0);
    }
    return parMax;
  }
)

