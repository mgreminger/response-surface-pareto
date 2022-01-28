import { min, max } from "mathjs";
import { writable, derived } from "svelte/store";

export const dataText = writable([[]]);
export const parameters = writable([]);
export const parameterTypes = writable([]);
export const parameterOptions = writable([]);
export const numParetoPoints = writable(10);

export const xAxisOutput = writable(null);
export const yAxisOutput = writable(null);

export function resetOptions() {
  parameterTypes.update((types) => types.fill(""));
  parameterOptions.set([]);
  xAxisOutput.set(null);
  yAxisOutput.set(null);
}

export function loadPanelExample() {
  parameters.set([
    "Material Thickness (mm)",
    "Rib Height (mm)",
    "Displacement (mm)",
    "Mass (g)",
  ]);

  dataText.set([
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

  resetOptions();
}

export function loadBottleExample() {
  parameters.set([
    "Run #",
    "Thickness (mm)",
    "Rib Depth (mm)",
    "Diameter (mm)",
    "Volume (mm^3)",
    "Displacement (mm)",
    "Mass (g)",
  ]);

  dataText.set([
    ["1", "0.25", "3", "70", "536969.2575", "3.06534", "10.9"],
    ["2", "0.25", "3", "77.5", "663203.035", "3.53519", "12.2803"],
    ["3", "0.25", "3", "85", "802707.0177", "4.12399", "13.7027"],
    ["4", "0.25", "5.5", "70", "517727.7965", "2.07773", "11.3433"],
    ["5", "0.25", "5.5", "77.5", "641624.9273", "2.35683", "12.8037"],
    ["6", "0.25", "5.5", "85", "778792.2632", "2.64563", "14.3061"],
    ["7", "0.25", "8", "70", "494105.8283", "1.34917", "11.68"],
    ["8", "0.25", "8", "77.5", "615034.2578", "1.46801", "13.2204"],
    ["9", "0.25", "8", "85", "749232.8924", "1.68117", "14.8028"],
    ["10", "0.625", "3", "70", "520523.6141", "3.02367", "27.0462"],
    ["11", "0.625", "3", "77.5", "644591.1772", "3.50397", "30.4888"],
    ["12", "0.625", "3", "85", "781862.6776", "4.04763", "34.0365"],
    ["13", "0.625", "5.5", "70", "500601.978", "2.05396", "28.1371"],
    ["14", "0.625", "5.5", "77.5", "622206.8094", "2.32417", "31.7797"],
    ["15", "0.625", "5.5", "85", "757015.578", "2.59952", "35.5275"],
    ["16", "0.625", "8", "70", "476467.9482", "1.3472", "28.9612"],
    ["17", "0.625", "8", "77.5", "594977.9932", "1.45322", "32.8039"],
    ["18", "0.625", "8", "85", "726691.9754", "1.64208", "36.7517"],
    ["19", "1", "3", "70", "504320.9012", "2.96539", "42.9485"],
    ["20", "1", "3", "77.5", "626232.6593", "3.48282", "48.4434"],
    ["21", "1", "3", "85", "761282.0866", "3.96967", "54.1065"],
    ["22", "1", "5.5", "70", "483741.1794", "2.03255", "44.6659"],
    ["23", "1", "5.5", "77.5", "603064.1207", "2.29423", "50.4809"],
    ["24", "1", "5.5", "85", "735524.7312", "2.5721", "56.4641"],
    ["25", "1", "8", "70", "459117.1772", "1.33094", "45.9565"],
    ["26", "1", "8", "77.5", "575219.2471", "1.4858", "52.0916"],
    ["27", "1", "8", "85", "704458.9863", "1.6249", "58.3949"],
  ]);

  resetOptions();
}

export const data = derived(dataText, ($dataText) => {
  let data = undefined;
  if ($dataText.length > 0) {
    data = $dataText.map((row) => row.map(parseFloat));
    if (!data.flat().reduce((total, value) => total && !isNaN(value), true)) {
      data = undefined; // at least on entry in the table is NaN
    }
  }
  return data;
});

export const inputs = derived(
  [parameters, parameterTypes],
  ([$parameters, $parameterTypes]) => {
    let inputs = [];
    $parameterTypes.forEach((value, index) => {
      if (value === "input") {
        inputs.push({ index: index, text: $parameters[index] });
      }
    });
    return inputs;
  }
);

export const nonTargetOutputs = derived(
  [parameters, parameterTypes, parameterOptions],
  ([$parameters, $parameterTypes, $parameterOptions]) => {
    let nonTargetOutputs = [{ index: null, text: "" }];
    $parameterTypes.forEach((value, index) => {
      if (
        value === "output" &&
        $parameterOptions[index] &&
        $parameterOptions[index].goal !== "target"
      ) {
        nonTargetOutputs.push({ index: index, text: $parameters[index] });
      }
    });
    return nonTargetOutputs;
  }
);

export const fullyDefined = derived(
  [nonTargetOutputs, inputs, xAxisOutput, yAxisOutput],
  ([$nonTargetOutputs, $inputs, $xAxisOutput, $yAxisOutput]) => {
    return (
      $nonTargetOutputs.length >= 3 &&
      $inputs.length >= 1 &&
      $xAxisOutput !== null &&
      $yAxisOutput !== null &&
      $xAxisOutput !== $yAxisOutput
    );
  }
);

export const parMin = derived(data, ($data) => {
  let parMin;
  if ($data) {
    parMin = min($data, 0);
  }
  return parMin;
});

export const parMax = derived(data, ($data) => {
  let parMax;
  if ($data) {
    parMax = max($data, 0);
  }
  return parMax;
});
