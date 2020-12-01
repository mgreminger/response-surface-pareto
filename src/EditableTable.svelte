<script>
  export let data = [[A, B, C, D], [1, 2, 3]];
  export let editable = true;

  let longestRow;

  $: {
    longestRow = 0;
    for (let row of data){
      if (row.length > longestRow){
        longestRow = row.length;
      }    
    }
}

</script>

<style>
  table {
    width: 80%;
  }
  table, th, td {
    border: 1px solid black;
    border-collapse: collapse;
  }
  th, td {
    padding: 5px;
    text-align: left;    
  }
</style>


<table>
  {#each data as row, i}
    <tr>
    {#each Array(longestRow) as _, j}
      {#if editable}
        <td contenteditable="true"
            bind:textContent={data[i][j]}
        >{data[i][j] ? data[i][j] : ''}</td>
      {:else}
        <td>{data[i][j] ? data[i][j] : ''}</td>
      {/if}
    {/each}
    </tr>
  {/each}
</table>

<p>{longestRow}</p>

