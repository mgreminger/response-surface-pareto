<script>
	
  export let plotData = null;
  
  let plotlyLoaded = false;

  let plotElement;
  let plot = null;

  function updatePlotlyLoaded(){
    plotlyLoaded = true;
  }

  $: if(plotData && plotlyLoaded) {
    if(!plot){
      Plotly.newPlot( plotElement, plotData.data, plotData.layout);
    } else {
      Plotly.react( plotElement, plotData.data, plotData.layout)
    }
  }

</script>

<svelte:head>
  <script src="plotly/plotly-latest.min.js" on:load={updatePlotlyLoaded}></script>
</svelte:head>

<div bind:this={plotElement} style="width:800px;height:600px;"></div>