<script>
  import EditableTable from "./EditableTable.svelte";
  import { min, max } from "mathjs";

  let parameters = [
    "Material Thickness (mm)",
    "Rib Height (mm)",
    "Displacement (mm)",
    "Mass (g)",
  ];

  let parameterTypes = [];
  let parameterOptions = [];

  const types = [
    { name: undefined, text: "" },
    { name: "input", text: "Input Paramater" },
    { name: "output", text: "Output Paramater" },
    { name: "ignore", text: "Ignore Parameter" },
  ];

  let data, parMax, parMin;

  let dataText = [
    ["7.5", "15", "0.8779", "1270.98"],
    ["2.5", "15", "7.87986", "426.956"],
    ["7.5", "7", "1.46584", "1101.3"],
    ["2.5", "7", "22.17822", "368.753"],
    ["7.5", "11", "1.13536", "1186.14"],
    ["2.5", "11", "12.27396", "397.855"],
    ["5", "15", "2.14489", "850.594"],
    ["5", "7", "4.30295", "735.856"],
    ["5", "11", "2.94196", "793.225"],
  ];

  $: parameterTypes.length = parameters.length;

  $: if (data) {
    parameterOptions.length = parameterTypes.length;
    parameterTypes.forEach((type, i) => {
      if (type.name === "output") {
        parameterOptions[i] = { goal: "minimize" };
      } else if (type.name === "input") {
        parameterOptions[i] = { min: parMin[i], max: parMax[i] };
      }
    });
  }

  $: {
    data = undefined;
    if (dataText.length > 0) {
      data = dataText.map((row) => row.map(parseFloat));
      if (!data.flat().reduce((total, value) => total && !isNaN(value), true)) {
        data = undefined; // at least on entry in the table is NaN
      }
    }
  }

  $: if (data) {
    parMax = max(data, 0);
    parMin = min(data, 0);
  }
</script>

<style>
</style>

<EditableTable
  bind:data={dataText}
  editableData={true}
  bind:headers={parameters}
  editableHeaders={true} />

{#if data}
  {#each parameters as parameter, i}
    <label>
      {parameter}
      <select bind:value={parameterTypes[i]}>
        {#each types as type}
          <option value={type}>{type.text}</option>
        {/each}
      </select>
      {#if parameterTypes[i] && parameterTypes[i].name === 'input'}
        <span>input</span>
      {:else if parameterTypes[i] && parameterTypes[i].name === 'output'}
        <span>output</span>
      {/if}
    </label>
  {/each}
{:else}Data not defined{/if}
