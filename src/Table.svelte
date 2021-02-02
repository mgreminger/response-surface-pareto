<script>
  export let headers;
  export let data = [[]];
  
  let longestRow;

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
    margin: 0px;
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
  div.table {
    overflow-y: auto;
  }
</style>

<div class="table">
  <table>
    {#if headers}
      <thead>
        <tr>
          {#each Array(longestRow) as _, j}
            <th>
              <div>{headers[j] ? headers[j] : ''}</div>
            </th>
          {/each}
        </tr>
      </thead>
    {/if}
    {#each data as row, i}
      <tbody>
        <tr>
          {#each Array(longestRow) as _, j}
            <td>
              {data[i][j] ? data[i][j] : ''}
            </td>
          {/each}
        </tr>
      </tbody>
    {/each}
  </table>
</div>