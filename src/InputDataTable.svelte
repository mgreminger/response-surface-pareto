<script>
  import { createEventDispatcher } from 'svelte';

  import { data, dataText, parameters, parameterTypes, parameterOptions,
           parMin, parMax, resetOptions, loadPanelExample,
           loadBottleExample
         } from './stores.js';

  export let editableHeaders = true;
  export let editableData = true;

  const dispatch = createEventDispatcher();

  let longestRow;
  let fileSelector;
  let inDropZone = false;

  const types = [
    { name: "", text: "" },
    { name: "input", text: "Input Paramater" },
    { name: "output", text: "Output Paramater" },
    { name: "ignore", text: "Ignore Parameter" },
  ];

  function handlePaste(event) {
    let pastedText = event.clipboardData.getData("text");

    // only paste if there are characters besides just white space
    if (pastedText.replace(/\s+/g, "").length > 0) {
      let rows = pastedText.split("\n");
      $parameters = rows[0].split("\t");
      $dataText = [];
      rows.forEach((row, i) => {
        if (i > 0 && row.length > 0) {
          $dataText.push(row.split("\t"));
        }
        $dataText = $dataText  // force svelte reactivity (push doesn't trigger reactivity)
      });

      console.log($parameters);
      console.log($dataText);

      // reset the options the user has chosen on a paste event
      resetOptions();

      dispatch('paste');
    }
  }

  function handleFile(e) {
    dispatch('loadfile', e);
  }

  $: {
    longestRow = 0;
    if ($parameters) {
      longestRow = $parameters.length;
    }
    for (let row of $dataText) {
      if (row.length > longestRow) {
        longestRow = row.length;
      }
    }
  }

  $: $parameterTypes.length = $parameters.length;

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
              target: ($parMin[i] + $parMax[i]) / 2,
              targetText: ($parMin[i] + $parMax[i]) / 2
            };
          } else {
            $parameterOptions[i].target = parseFloat($parameterOptions[i].targetText)
          }
        } else if (type === "input") {
          if (
            $parameterOptions[i] === undefined ||
            !("minText" in $parameterOptions[i])
          ) {
            $parameterOptions[i] = { minText: $parMin[i], maxText: $parMax[i],
                                    min: $parMin[i], max: $parMax[i] };
          } else {
            $parameterOptions[i].min = parseFloat($parameterOptions[i].minText)
            $parameterOptions[i].max = parseFloat($parameterOptions[i].maxText)
          }
        }
      }
    });
  }

</script>


<style>
  table {
    border-collapse: collapse;
    margin: 0px;
  }

  div.table {
    overflow-y: auto;
  }

  div.drop {
    width: 600px;
    height: 400px;
    background: lightgray;
    border-radius: 10px;
    border: 1px dashed black;
    /* text-align: center; */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  div.drop::before {
    content: 'Drop File Here';
  }

  div.in_zone {
    border: 2px solid black;
    background: rgb(241, 241, 241);
    font-weight: bold;
  } 

  table,
  th,
  td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 5px;
    text-align: left;
    width: 50px;
  }

  th {
    position: relative;
    vertical-align: top;
  }

  td.error {
    background-color: lightcoral;
  }

  input.error {
    background-color: lightcoral;
  }
</style>


<input bind:this={fileSelector} type="file" on:change={handleFile}/>
<button on:click={loadPanelExample}>Load Panel Example Dataset</button>
<button on:click={loadBottleExample}>Load Bottle Example Dataset</button>

{#if $parameters.length === 0}
  <h3>Load the Response Surface Data</h3>
  <ul>
    <li>Drag and drop a spreadsheet file into the box below</li>
    <li><a href="javscript:void(0)" on:click|preventDefault={fileSelector.click()}>Browse</a> to select a file</li>
    <li>Paste the spreadsheet data here: <input on:paste|preventDefault={handlePaste}/></li>
  </ul>
  <div class="drop" class:in_zone="{inDropZone}" on:drop={handleFile} on:dragover|preventDefault
       on:dragenter={e => inDropZone=true} on:dragleave={e => inDropZone=false}>
  </div>
{:else}
  <div class="table">
    <table on:paste|preventDefault={handlePaste}>
      {#if $parameters}
        <thead>
          <tr>
            {#each Array(longestRow) as _, j}
            <th>
              {#if editableHeaders}
                  <div contenteditable="true" bind:textContent={$parameters[j]}>
                    {$parameters[j] ? $parameters[j] : ''}
                  </div>
              {:else}
                  <div>{$parameters[j] ? $parameters[j] : ''}</div>
              {/if}
            
            
              <select bind:value={$parameterTypes[j]}>
                {#each types as type}
                  <option value={type.name}>{type.text}</option>
                {/each}
              </select>
              {#if $parameterTypes[j] && $parameterTypes[j] === 'input'}
                <div>Lower Limit: </div>
                <input
                  class:error={isNaN(parseFloat($parameterOptions[j].minText))}
                  bind:value={$parameterOptions[j].minText} />
                <div>Upper Limit: </div>
                <input
                  class:error={isNaN(parseFloat($parameterOptions[j].maxText))}
                  bind:value={$parameterOptions[j].maxText} />
              {:else if $parameterTypes[j] && $parameterTypes[j] === 'output'}
                <div>Goal: </div>
                <select bind:value={$parameterOptions[j].goal}>
                  <option value={'minimize'}>Minimize</option>
                  <option value={'maximize'}>Maximize</option>
                  <option value={'target'}>Target</option>
                </select>
                {#if $parameterOptions[j].goal === 'target'}
                  <span>=</span>
                  <input
                    class:error={isNaN(parseFloat($parameterOptions[j].targetText))}
                    bind:value={$parameterOptions[j].targetText} />
                {/if}
              {/if}
            </th>
            {/each}
          </tr>
        </thead>
      {/if}
      {#each $dataText as row, i}
        <tbody>
          <tr>
            {#each Array(longestRow) as _, j}
              {#if editableData}
                <td
                  contenteditable="true"
                  bind:textContent={$dataText[i][j]}
                  class:error={isNaN(parseFloat($dataText[i][j]))}>
                  {$dataText[i][j] ? $dataText[i][j] : ''}
                </td>
              {:else}
                <td class:error={isNaN(parseFloat($dataText[i][j]))}>
                  {$dataText[i][j] ? $dataText[i][j] : ''}
                </td>
              {/if}
            {/each}
          </tr>
        </tbody>
      {/each}
    </table>
  </div>
{/if}