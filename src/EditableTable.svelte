<script>
  import { createEventDispatcher } from 'svelte';
  import { columnAdjust } from "./column_adjust";

  import { data, dataText, parameters, parameterTypes, parameterOptions,
           nonTargetOutputs, xAxisOutput, yAxisOutput, parMin, parMax,
         } from './stores.js';

  export let editableHeaders = true;
  export let editableData = true;

  const dispatch = createEventDispatcher();

  let longestRow;

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

      // reset the options the user has chosen on a paste event
      $parameterTypes.fill("");
      $parameterOptions = [];
      $xAxisOutput = null;
      $yAxisOutput = null;

      dispatch('paste');
    }
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
          $parameterOptions[i].x_axis = (i === $xAxisOutput) ? true : false
          $parameterOptions[i].y_axis = (i === $yAxisOutput) ? true : false
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
    margin: 5px;
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

  div.grip {
    top: 0;
    right: 0;
    bottom: 0;
    width: 5px;
    position: absolute;
    cursor: col-resize;
  }

  input.error {
    background-color: lightcoral;
  }
</style>

<table on:paste|preventDefault={handlePaste}>
  {#if $parameters}
    <thead>
      <tr>
        {#each Array(longestRow) as _, j}
        <th>
          <label>
            {#if editableHeaders}
                <div contenteditable="true" bind:textContent={$parameters[j]}>
                  {$parameters[j] ? $parameters[j] : ''}
                </div>
                <div class="grip" use:columnAdjust>&nbsp</div>
            {:else}
                <div>{$parameters[j] ? $parameters[j] : ''}</div>
                <div class="grip" use:columnAdjust>&nbsp</div>
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
          </label>

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
