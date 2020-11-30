<script>
	import { onMount } from 'svelte';
	
	export let data = [['','',''],
										 ['','','']];
	
	let tableElement;
	let table;
	
	function handleChangeEvent(instance, cell, x, y, value) {
		console.log(x, y)
		data[y][x] = value
	}
	
	function initializeJexcel () {  
		table = jexcel(tableElement, {
				data:data,
				onchange: handleChangeEvent
				});
	}
	
	$: if (table) table.setData(data)
	
</script>

<svelte:head>
	<script src="https://bossanova.uk/jexcel/v4/jexcel.js" on:load={initializeJexcel}></script>
	<script src="https://bossanova.uk/jsuites/v3/jsuites.js"></script>
	<link rel="stylesheet" href="https://bossanova.uk/jsuites/v3/jsuites.css" type="text/css" />
	<link rel="stylesheet" href="https://bossanova.uk/jexcel/v4/jexcel.css" type="text/css" />
</svelte:head>

<div bind:this={tableElement}></div>
