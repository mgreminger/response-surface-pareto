<script>
  import { onDestroy } from 'svelte';
  import InputDataTable from "./InputDataTable.svelte";
  import Table from "./Table.svelte";
  import Tabs from "./Tabs.svelte";
  import Plot from "./Plot.svelte";
  import { data, parameters, parameterTypes, parameterOptions,
           numParetoPoints, fullyDefined, nonTargetOutputs, xAxisOutput,
           yAxisOutput, xlsxLoaded} from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  
  onDestroy(() => pyodideWorker.terminate());

  let selectedTab = 0;
  let plotData = null;
  let paretoData = null;
  let plotPromise = null;

  function updateXlsxLoaded(){
    $xlsxLoaded = true;
  }

  function getParetoData(){
    return new Promise((resolve, reject) => {

      function handleWorkerMessage(e){
        if (e.data === "pyodide_not_available") {
          // pyodide didn't load properly
          reject('Pyodide not available for calculations. Try refreshing page or using a different browser.');
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

<Tabs tabs={['Input Data', 'Pareto Plot', 'Pareto Data', 'Instructions', 'About']} bind:selectedTab>
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
          <span>{error}</span>
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
  <div class:hidden={selectedTab !== 3}>
    <h3>Instructions</h3>
    <p>The design of experiments (DOE) data can be loaded as either a spreadsheet file (Excel or CSV format)
      or it can be pasted into box indicated on the Input Data tab. The first row must be the data headers
      and these headers may be edited after the data is loaded. If an Excel file is loaded, only the first
      sheet will be used and there shouldn't be any other contents in the sheet besides the headers and 
      the DOE data. At least one input and two non-target outputs need to be specified in order to create
      a Pareto plot. A <a href="https://youtu.be/eRcOnL-D1DA" target="_blank">tutorial video</a> is available that goes 
      over how to use this tool.
    </p>
  </div>
  <div class:hidden={selectedTab !== 4}>
    <p>This tool was developed by <a href="https://www.d.umn.edu/~mgreming/">Michael Greminger</a> at the 
      University of Minnesota Duluth for use in his ME4145 CAD/CAM course. Report issues or bugs to the
      author at <a href="mailto:mgreming@d.umn.edu">mgreming@d.umn.edu</a>. </p>
    <p>Pareto front caculations are performed using Python in the browser with 
      <a href="https://github.com/iodide-project/pyodide">Pyodide</a>. The 
      <a href="https://github.com/mgreminger/trust-constr">trust-constr</a> algorithm that has been 
      extracted from the <a href="https://www.scipy.org/">SciPy</a> library is used to performed the 
      constrained optimization runs required to generated the Pareto front. 
      <a href="https://svelte.dev/">Svelte</a> is used to implement the user interface, 
      <a href="https://plotly.com/javascript/">plotly</a> is used for plotting, and 
      <a href="https://github.com/SheetJS/sheetjs">sheetjs</a> is used for spreadsheet 
      file I/O.
    </p>
    <p>This is an open source project and the source code is available on this project's 
      <a href="https://github.com/mgreminger/response-surface-pareto">GitHub Page</a>.
    </p>
  </div>
</Tabs>