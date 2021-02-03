<script>
  import { onDestroy } from 'svelte';
  import InputDataTable from "./InputDataTable.svelte";
  import Table from "./Table.svelte";
  import Tabs from "./Tabs.svelte";
  import Plot from "./Plot.svelte";
  import { data, parameters, parameterTypes, parameterOptions,
           numParetoPoints, fullyDefined, nonTargetOutputs, xAxisOutput,
           yAxisOutput, xlsxLoaded, plotlyLoaded} from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  
  onDestroy(() => pyodideWorker.terminate());

  let selectedTab = 0;
  let plotData = null;
  let paretoData = null;
  let plotPromise = null;

  function updatePlotlyLoaded(){
    $plotlyLoaded = true;
  }

  function updateXlsxLoaded(){
    $xlsxLoaded = true;
  }

  function getParetoData(){
    return new Promise((resolve, reject) => {

      function handleWorkerMessage(e){
        if (e.data === "pyodide_not_available") {
          // pyodide didn't load properly
          reject('Pyodide not available for calculations');
        } else {
          resolve(e.data)
        }
      }
      pyodideWorker.onmessage = handleWorkerMessage;
      pyodideWorker.postMessage([$data, $parameters, $parameterTypes, $parameterOptions, $numParetoPoints]);

    });
  }

  function handleGenerateParetoData () {
    plotPromise = getParetoData()
      .then(data => {
        plotData = data.plot;
        paretoData = data.data;
      });
  }

  function handleSaveParetoData(e){
    if($xlsxLoaded && paretoData){
      let workbook = XLSX.utils.book_new();
      let sheet = XLSX.utils.aoa_to_sheet([paretoData.headers, ...paretoData.data]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Pareto Data');
      XLSX.writeFile(workbook, 'pareto_data.csv');
    }
  }

  $: if(!$fullyDefined) {
    plotData = null;
    paretoData = null;
    plotPromise = null;
  }

  $: $parameterOptions.forEach((option, i) => {
      option.x_axis = (i === $xAxisOutput) ? true : false;
      option.y_axis = (i === $yAxisOutput) ? true : false;
    });

</script>

<style>
  .hidden {
    display: none;
  }
</style>

<svelte:head>
  <script src="plotly/plotly-latest.min.js" on:load={updatePlotlyLoaded}></script>
  <script src="xlsx/xlsx.full.min.js" on:load={updateXlsxLoaded}></script>
</svelte:head>

<Tabs tabs={['Input Data', 'Pareto Plot', 'Pareto Data']} bind:selectedTab>
  <div class:hidden={selectedTab !== 0}>
    <InputDataTable />
  </div>
  <div class:hidden={selectedTab !== 1}>
    {#if $parameterOptions.length > 0}
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
      {:else}
        Select at least one input and at least 2 non-target outputs.
      {/if}
    {:else}
      No data loaded.
    {/if}
    {#if $fullyDefined}
      <label>
        Number of Pareto points: <input type=number bind:value={$numParetoPoints} min=3 max=100>
      </label>
      <button on:click={handleGenerateParetoData}>Generate Pareto Data</button>
      {#if plotPromise}
        {#await plotPromise}
          <span>Updating plot...</span>
        {:catch error}
          <span>{error.message}</span>
        {/await}
      {/if}
      {#if plotData}
        <Plot plotData={plotData}></Plot>
      {/if}
    {/if}
  </div>
  <div class:hidden={selectedTab !== 2}>
      {#if paretoData}
        <button on:click={handleSaveParetoData}>Export as csv...</button>
        <Table headers={paretoData.headers} data={paretoData.data}></Table>
      {:else}
        Generate Pareto plot to obtain Pareto data.
      {/if}
  </div>
</Tabs>