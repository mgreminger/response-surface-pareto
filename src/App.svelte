<script>
  import EditableTable from "./EditableTable.svelte";

  let headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  let data = [
    ['1', '', ''],
    ['2', ''],
  ];
</script>

<EditableTable editableData={true} bind:headers={headers} editableHeaders={true} bind:data />

<p>{headers.toString()}</p>

{#each data as row}
  <p>{row.toString()}</p>
{/each}


