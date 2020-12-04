<script>
  export let headers;
  export let editableHeaders = false;
  export let data = [[]];
  export let editableData = false;

  let longestRow;
  function handlePaste(event) {
    let pastedText = event.clipboardData.getData("text");
    let rows = pastedText.split("\n");
    headers = rows[0].split("\t");
    data = [];
    rows.forEach((row, i) => {
      if (i > 0 && row.length > 0) {
        data.push(row.split("\t"));
      }
    });
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
    width: 500px;
    border-collapse: collapse;
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
  }
</style>

<table on:paste|preventDefault={handlePaste}>
  {#if headers}
    <thead>
      <tr>
        {#each Array(longestRow) as _, j}
          {#if editableHeaders}
            <th contenteditable="true" bind:textContent={headers[j]}>
              {headers[j] ? headers[j] : ''}
            </th>
          {:else}
            <th>{headers[j] ? headers[j] : ''}</th>
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
            <td contenteditable="true" bind:textContent={data[i][j]}>
              {data[i][j] ? data[i][j] : ''}
            </td>
          {:else}
            <td>{data[i][j] ? data[i][j] : ''}</td>
          {/if}
        {/each}
      </tr>
    </tbody>
  {/each}
</table>

<p>{longestRow}</p>
