<script>
  import { onDestroy } from 'svelte';
  import EditableTable from "./EditableTable.svelte";
  import Tabs from "./Tabs.svelte";
  import Plot from "./Plot.svelte";
  import { data, dataText, parameters, parameterTypes, parameterOptions,
           numParetoPoints, fullyDefined, nonTargetOutputs, xAxisOutput,
           yAxisOutput } from './stores.js';

  // start webworker for python calculations
  const pyodideWorker = new Worker('webworker.js');
  pyodideWorker.onmessage = handleWorkerMessage;
  onDestroy(() => pyodideWorker.terminate());

  let selectedTab = 0;
  let plotData = null;
  let xlsxLoaded = false;

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

  function updateXlsxLoaded(){
    xlsxLoaded = true;
  }

  function handleFile(e) {
    if (xlsxLoaded) {
      let files = e.target.files, f = files[0];
      let reader = new FileReader();
      reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, {type: 'array'});

        let first_sheet_name = workbook.SheetNames[0];

        let worksheet = workbook.Sheets[first_sheet_name];

        let new_data = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        $parameters = new_data[0];
        $dataText = new_data.slice(1);

        // reset the options the user has chosen when loading a new file
        $parameterTypes.fill("");
        $parameterOptions = [];
        $xAxisOutput = null;
        $yAxisOutput = null;

      } 
      reader.readAsArrayBuffer(f);
    } else {
          alert("XLSX Library not loaded yet, please try again.");
    }
  };

  $: if(!$fullyDefined) {
    plotData = null;
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
  <script src="./xlsx/xlsx.full.min.js" on:load={updateXlsxLoaded}></script>
</svelte:head>

<Tabs tabs={['Input Data', 'Pareto Plot', 'Pareto Data']}
      bind:selectedTab>
  <div class="{selectedTab === 0 ? '' : 'hidden'}">
    <input type="file" on:change={handleFile}/>
    <EditableTable />
  </div>
  <div class="{selectedTab === 1 ? '' : 'hidden'}">
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
  </div>
  <div class="{selectedTab === 2 ? '' : 'hidden'}">
      Pareto Data
  </div>
</Tabs>