<script>
  import EditableTable from "./EditableTable.svelte";

  let data = [
    [1, 2, 3],
    ["A", "B"],
  ];
</script>

<EditableTable editable={true} bind:data />


{#each data as row}
  <p>{row.toString()}</p>
{/each}

