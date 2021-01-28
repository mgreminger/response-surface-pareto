<script>
  import { onDestroy } from 'svelte';
  import EditableTable from "./EditableTable.svelte";
  import Plot from "./Plot.svelte";
  import { data, parameters, parameterTypes, parameterOptions,
           numParetoPoints, fullyDefined } from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  pyodideWorker.onmessage = handleWorkerMessage;
  onDestroy(() => pyodideWorker.terminate());

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
</script>

<style>
</style>

<EditableTable />

{#if $fullyDefined}
  <label>
    Number of Pareto points: <input type=number bind:value={$numParetoPoints} min=3 max=100>
  </label>
  <button on:click={getParetoData}>Generate Pareto Data</button>
  <Plot plotData={plotData}></Plot>
{/if}