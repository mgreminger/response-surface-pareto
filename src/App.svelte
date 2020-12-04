<script>
  import EditableTable from "./EditableTable.svelte";

  let headers = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

  let data = [
    ['1', '', ''],
    ['2', ''],
  ];
</script>

<EditableTable editableData={true} headers={headers} editableHeaders={true} bind:data />

{#each data as row}
  <p>{row.toString()}</p>
{/each}

