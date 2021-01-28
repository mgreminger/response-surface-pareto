<script>
  import { min, max } from "mathjs";
  import { onDestroy } from 'svelte';
  import EditableTable from "./EditableTable.svelte";
  import Plot from "./Plot.svelte";
  import { data, dataText, parameters, parameterTypes, parameterOptions,
           numParetoPoints } from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  pyodideWorker.onmessage = handleWorkerMessage;
  onDestroy(() => pyodideWorker.terminate());

  let parMax, parMin;
  let xAxisOutput = null; 
  let yAxisOutput = null;
  let nonTargetOutputs = [];
  let inputs = [];
  let fullyDefined = false;
  let plotData = null;

  const types = [
    { name: "", text: "" },
    { name: "input", text: "Input Paramater" },
    { name: "output", text: "Output Paramater" },
    { name: "ignore", text: "Ignore Parameter" },
  ];

  function getParetoData(){
    pyodideWorker.postMessage([$data, $parameters, $parameterTypes, $parameterOptions, $numParetoPoints]);
  }

  function handlePaste(e){
    // reset the options the user has chosen on a paste event
    $parameterTypes.fill("");
    $parameterOptions = [];
    xAxisOutput = null;
    yAxisOutput = null;
  }

  function handleWorkerMessage(e){
    if (e.data === "pyodide_not_available") {
      // pyodide didn't load properly
      console.error('Pyodide not available for calculations')
    } else {
      plotData = e.data;
    }
  }

  $: $parameterTypes.length = $parameters.length;

  $: if($parameterTypes.length > 0) {
      nonTargetOutputs = [{index:null, text: ''}]
      inputs = []
      $parameterTypes.forEach( (value, index) => {
        if(value === 'output' && $parameterOptions[index].goal !== 'target') {
          nonTargetOutputs.push({index: index, text: $parameters[index]})
        } else if(value === 'input') {
          inputs.push({index: index, text: $parameters[index]})
        }
      })
    }

  $: if ($data) {
    $parameterOptions.length = $parameterTypes.length;
    $parameterTypes.forEach((type, i) => {
      if (type) {
        if (type === "output") {
          if (
            $parameterOptions[i] === undefined ||
            !("goal" in $parameterOptions[i])
          ) {
            $parameterOptions[i] = {
              goal: "minimize",
              target: (parMin[i] + parMax[i]) / 2,
              targetText: (parMin[i] + parMax[i]) / 2
            };
          } else {
            $parameterOptions[i].target = parseFloat($parameterOptions[i].targetText)
          }
          $parameterOptions[i].x_axis = (i === xAxisOutput) ? true : false
          $parameterOptions[i].y_axis = (i === yAxisOutput) ? true : false
        } else if (type === "input") {
          if (
            $parameterOptions[i] === undefined ||
            !("minText" in $parameterOptions[i])
          ) {
            $parameterOptions[i] = { minText: parMin[i], maxText: parMax[i],
                                    min: parMin[i], max: parMax[i] };
          } else {
            $parameterOptions[i].min = parseFloat($parameterOptions[i].minText)
            $parameterOptions[i].max = parseFloat($parameterOptions[i].maxText)
          }
        }
      }
    });
  }

  $: if ($data) {
    parMax = max($data, 0);
    parMin = min($data, 0);
  }

  $: fullyDefined = nonTargetOutputs.length >= 3 && inputs.length >= 1 && xAxisOutput !== null && 
                    yAxisOutput !== null && xAxisOutput !== yAxisOutput;

$: if(!fullyDefined) {
  plotData = null;
}
</script>

<style>
  input.error {
    background-color: lightcoral;
  }
</style>

<EditableTable
  bind:data={$dataText}
  editableData={true}
  bind:headers={$parameters}
  editableHeaders={true}
  on:paste={handlePaste} />

{#if $data}
  {#each $parameters as parameter, i}
    <label>
      {parameter}:
      <select bind:value={$parameterTypes[i]}>
        {#each types as type}
          <option value={type.name}>{type.text}</option>
        {/each}
      </select>
      {#if $parameterTypes[i] && $parameterTypes[i] === 'input'}
        <span>Lower Limit: </span>
        <input
          class:error={isNaN(parseFloat($parameterOptions[i].minText))}
          bind:value={$parameterOptions[i].minText} />
        <span>Upper Limit: </span>
        <input
          class:error={isNaN(parseFloat($parameterOptions[i].maxText))}
          bind:value={$parameterOptions[i].maxText} />
      {:else if $parameterTypes[i] && $parameterTypes[i] === 'output'}
        <span>Goal: </span>
        <select bind:value={$parameterOptions[i].goal}>
          <option value={'minimize'}>Minimize</option>
          <option value={'maximize'}>Maximize</option>
          <option value={'target'}>Target</option>
        </select>
        {#if $parameterOptions[i].goal === 'target'}
          <span>=</span>
          <input
            class:error={isNaN(parseFloat($parameterOptions[i].targetText))}
            bind:value={$parameterOptions[i].targetText} />
        {/if}
      {/if}
    </label>
  {/each}
  {#if nonTargetOutputs.length >= 3}
    <label>
      x-axis output:
      <select bind:value={xAxisOutput}>
        {#each nonTargetOutputs as output}
          <option value={output.index} selected={xAxisOutput === output.index}>{output.text}</option>
        {/each}
      </select>
    </label>
    <label>
      y-axis output:
      <select bind:value={yAxisOutput}>
        {#each nonTargetOutputs as output}
          <option value={output.index} selected={yAxisOutput === output.index}>{output.text}</option>
        {/each}
      </select>
    </label>
  {/if}
  {#if fullyDefined}
    <label>
      Number of Pareto points: <input type=number bind:value={$numParetoPoints} min=3 max=100>
    </label>
    <button on:click={getParetoData}>Generate Pareto Data</button>
    <Plot plotData={plotData}></Plot>
  {/if}
{:else}Data not defined{/if}
