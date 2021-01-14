<script>
  import { onDestroy } from 'svelte';
  import EditableTable from "./EditableTable.svelte";
  import { min, max } from "mathjs";

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  pyodideWorker.onmessage = handleWorkerMessage;
  onDestroy(() => pyodideWorker.terminate());

  let parameters = [
    "Material Thickness (mm)",
    "Rib Height (mm)",
    "Displacement (mm)",
    "Mass (g)",
  ];

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

  let parameterTypes = [];
  let parameterOptions = [];
  let data, parMax, parMin;
  let xAxisOutput, yAxisOutput;
  let nonTargetOutputs = [];
  let inputs = [];
  let numParetoPoints = 10;

  const types = [
    { name: "", text: "" },
    { name: "input", text: "Input Paramater" },
    { name: "output", text: "Output Paramater" },
    { name: "ignore", text: "Ignore Parameter" },
  ];

  function getParetoData(){
    pyodideWorker.postMessage({data, parameterTypes, parameters, parameterOptions});

  }

  function handleWorkerMessage(e){
    if (e.data === "pyodide_not_available") {
      // pyodide didn't load properly
      console.error('Pyodide not available for calculations')
    } else {
      console.log(e.data)
    }
  }

  $: parameterTypes.length = parameters.length;

  $: if(parameterTypes.length > 0) {
      nonTargetOutputs = []
      inputs = []
      parameterTypes.forEach( (value, index) => {
        if(value === 'output' && parameterOptions[index].goal !== 'target') {
          nonTargetOutputs.push({index: index, text: parameters[index]})
        } else if(value === 'input') {
          inputs.push({index: index, text: parameters[index]})
        }
      })
    }

  $: if (data) {
    parameterOptions.length = parameterTypes.length;
    parameterTypes.forEach((type, i) => {
      if (type) {
        if (type === "output") {
          if (
            parameterOptions[i] === undefined ||
            !("goal" in parameterOptions[i])
          ) {
            parameterOptions[i] = {
              goal: "minimize",
              target: (parMin[i] + parMax[i]) / 2,
            };
          }
          parameterOptions[i].x_axis = (i === xAxisOutput) ? true : false
          parameterOptions[i].y_axis = (i === yAxisOutput) ? true : false
        } else if (type === "input") {
          if (
            parameterOptions[i] === undefined ||
            !("min" in parameterOptions[i])
          ) {
            parameterOptions[i] = { min: parMin[i], max: parMax[i] };
          }
        }
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
  input.error {
    background-color: lightcoral;
  }
</style>

<EditableTable
  bind:data={dataText}
  editableData={true}
  bind:headers={parameters}
  editableHeaders={true} />

{#if data}
  {#each parameters as parameter, i}
    <label>
      {parameter}:
      <select bind:value={parameterTypes[i]}>
        {#each types as type}
          <option value={type.name}>{type.text}</option>
        {/each}
      </select>
      {#if parameterTypes[i] && parameterTypes[i] === 'input'}
        <span>Lower Limit: </span>
        <input
          class:error={isNaN(parseFloat(parameterOptions[i].min))}
          bind:value={parameterOptions[i].min} />
        <span>Upper Limit: </span>
        <input
          class:error={isNaN(parseFloat(parameterOptions[i].max))}
          bind:value={parameterOptions[i].max} />
      {:else if parameterTypes[i] && parameterTypes[i] === 'output'}
        <span>Goal: </span>
        <select bind:value={parameterOptions[i].goal}>
          <option value={'minimize'}>Minimize</option>
          <option value={'maximize'}>Maximize</option>
          <option value={'target'}>Target</option>
        </select>
        {#if parameterOptions[i].goal === 'target'}
          <span>=</span>
          <input
            class:error={isNaN(parseFloat(parameterOptions[i].target))}
            bind:value={parameterOptions[i].target} />
        {/if}
      {/if}
    </label>
  {/each}
  {#if nonTargetOutputs.length >= 2}
    <label>
      x-axis output:
      <select bind:value={xAxisOutput}>
        {#each nonTargetOutputs as output}
          <option value={output.index}>{output.text}</option>
        {/each}
      </select>
    </label>
    <label>
      y-axis output:
      <select bind:value={yAxisOutput}>
        {#each nonTargetOutputs as output}
          {#if output.index !== xAxisOutput}
            <option value={output.index}>{output.text}</option>
          {/if}
        {/each}
      </select>
    </label>
  {/if}
  {#if nonTargetOutputs.length >= 2 && inputs.length >= 1}
    <label>
      Number of Pareto points: <input type=number bind:value={numParetoPoints} min=3 max=100>
    </label>
    <button on:click={getParetoData}>Generate Pareto Data</button>
  {/if}
{:else}Data not defined{/if}
