<script>
	
  export let plotData = null;
  
  let plotElement;
  let plot = null;

  $: if(plotData) {
    if(!plot){
      Plotly.newPlot( plotElement, plotData.data, plotData.layout);
    } else {
      Plotly.react( plotElement, plotData.data, plotData.layout)
    }
  }

</script>

<svelte:head>
  <script src="plotly/plotly-latest.min.js"></script>
</svelte:head>

<div bind:this={plotElement} style="width:800px;height:600px;"></div>