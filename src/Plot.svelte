<script>
  import { onMount } from 'svelte';
  import { plotlyLoaded } from './stores.js';  

  export let plotData = null;

  let plotElement;
  let plot = null;
  let mounted = false;

  onMount( () => {
    if(plotData){
      plot = Plotly.newPlot( plotElement, plotData.data, plotData.layout);
      mounted = true;
    }
  });

  $: if(mounted && plotData && $plotlyLoaded) {
    if(!plot){
      plot = Plotly.newPlot( plotElement, plotData.data, plotData.layout);
    } else {
      Plotly.react( plotElement, plotData.data, plotData.layout)
    }
  }

</script>

<div bind:this={plotElement} style="width:800px;height:600px;"></div>
