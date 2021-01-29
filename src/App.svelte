<script>
  import { onDestroy } from 'svelte';
  import EditableTable from "./EditableTable.svelte";
  import Tabs from "./Tabs.svelte";
  import Plot from "./Plot.svelte";
  import { data, parameters, parameterTypes, parameterOptions,
           numParetoPoints, fullyDefined, nonTargetOutputs, xAxisOutput,
           yAxisOutput } from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  pyodideWorker.onmessage = handleWorkerMessage;
  onDestroy(() => pyodideWorker.terminate());

  let selectedTab = 0;
  let plotData = null;

  function getParetoData(){
    pyodideWorker.postMessage([$data, $parameters, $parameterTypes, $parameterOptions, $numParetoPoints]);
  }

  function handleWorkerMessage(e){
    if (e.data === "pyodide_not_available") {
      // pyodide didn't load properly
      console.error('Pyodide not available for calculations')
    } else {
      plotData = e.data;
    }
  }

  $: if(!$fullyDefined) {
    plotData = null;
  }

  $: $parameterOptions.forEach((option, i) => {
      option.x_axis = (i === $xAxisOutput) ? true : false;
      option.y_axis = (i === $yAxisOutput) ? true : false;
    });

</script>

<style>
</style>

<Tabs tabs={['Input Data', 'Pareto Plot', 'Pareto Data']}
      bind:selectedTab>
  {#if selectedTab === 0}
    <EditableTable />
  {:else if selectedTab === 1}
    {#if $data}
      {#if $nonTargetOutputs.length >= 3}
        <label>
          x-axis output:
          <select bind:value={$xAxisOutput}>
            {#each $nonTargetOutputs as output}
              <option value={output.index} selected={$xAxisOutput === output.index}>{output.text}</option>
            {/each}
          </select>
        </label>
        <label> 
          y-axis output:
          <select bind:value={$yAxisOutput}>
            {#each $nonTargetOutputs as output}
              <option value={output.index} selected={$yAxisOutput === output.index}>{output.text}</option>
            {/each}
          </select>
        </label>
      {/if}
    {:else}Data not defined{/if}
    {#if $fullyDefined}
      <label>
        Number of Pareto points: <input type=number bind:value={$numParetoPoints} min=3 max=100>
      </label>
      <button on:click={getParetoData}>Generate Pareto Data</button>
      <Plot plotData={plotData}></Plot>
    {/if}
  {:else}
      Pareto Data
  {/if}
</Tabs>