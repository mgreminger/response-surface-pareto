<script>
  import { columnAdjust } from "./column_adjust";

  export let headers;
  export let editableHeaders = false;
  export let data = [[]];
  export let editableData = false;

  let longestRow;

  function handlePaste(event) {
    let pastedText = event.clipboardData.getData("text");

    // only paste if there are characters besides just white space
    if (pastedText.replace(/\s+/g, "").length > 0) {
      let rows = pastedText.split("\n");
      headers = rows[0].split("\t");
      data = [];
      rows.forEach((row, i) => {
        if (i > 0 && row.length > 0) {
          data.push(row.split("\t"));
        }
      });
    }
  }

  $: {
    longestRow = 0;
    if (headers) {
      longestRow = headers.length;
    }
    for (let row of data) {
      if (row.length > longestRow) {
        longestRow = row.length;
      }
    }
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
</style>

<table on:paste|preventDefault={handlePaste}>
  {#if headers}
    <thead>
      <tr>
        {#each Array(longestRow) as _, j}
          {#if editableHeaders}
            <th>
              <div contenteditable="true" bind:textContent={headers[j]}>
                {headers[j] ? headers[j] : ''}
              </div>
              <div class="grip" use:columnAdjust>&nbsp</div>
            </th>
          {:else}
            <th>
              <div>{headers[j] ? headers[j] : ''}</div>
              <div class="grip" use:columnAdjust>&nbsp</div>
            </th>
          {/if}
        {/each}
      </tr>
    </thead>
  {/if}
  {#each data as row, i}
    <tbody>
      <tr>
        {#each Array(longestRow) as _, j}
          {#if editableData}
            <td
              contenteditable="true"
              bind:textContent={data[i][j]}
              class:error={isNaN(parseFloat(data[i][j]))}>
              {data[i][j] ? data[i][j] : ''}
            </td>
          {:else}
            <td class:error={isNaN(parseFloat(data[i][j]))}>
              {data[i][j] ? data[i][j] : ''}
            </td>
          {/if}
        {/each}
      </tr>
    </tbody>
  {/each}
</table>
