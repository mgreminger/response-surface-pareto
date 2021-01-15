<script>
	
  let plot
  
  function createPlot(){
    Plotly.newPlot( plot, [{
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 4, 8, 16] }], {
    margin: { t: 0 } } );
  }
</script>

<svelte:head>
  <script src="plotly/plotly-latest.min.js" on:load={createPlot}></script>
</svelte:head>

<div bind:this={plot} style="width:600px;height:250px;"></div>