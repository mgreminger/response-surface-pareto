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

export const data = derived(
  dataText,
  $dataText => {
    let result = undefined;
    if ($dataText.length > 0) {
      result = $dataText.map((row) => row.map(parseFloat));
      if (!result.flat().reduce((total, value) => total && !isNaN(value), true)) {
        result = undefined; // at least on entry in the table is NaN
      }
    }
    return result;
  }
);
