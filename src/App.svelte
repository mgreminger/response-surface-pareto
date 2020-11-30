<script>
	import Spreadsheet from './Spreadsheet.svelte'
	
	let data = [[1, 2], ['A', 'B']]
</script>

<Spreadsheet bind:data/>
<Spreadsheet bind:data/>
<Spreadsheet/>

{#each data as row}
	{#each row as value}
  		<p>{value}</p>
	{/each}
{/each}