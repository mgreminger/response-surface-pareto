<script>
  export let tabs = [];
  export let selectedTab = 0;
</script>

<style>
  .tab {
    border: 1px solid #ccc;
    background-color: #f1f1f1;
  }

  .tab button {
    background-color: inherit;
    float: left;
    border: none;
    cursor: pointer;
    position: relative;
    padding: 14px 16px;
    transition: 0.3s;
    margin: 0;
    border-radius: 0;
  }

  .tab button:focus {
    z-index: 100;
  }

  .tab button:hover {
    background-color: #ddd;
  }

  .tab button.selected {
    background-color: #ccc;
  }

  .tabcontent {
    overflow: auto;
    height: 100%;
    display: block;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-top: none;
  } 
</style>

<div class="tab">
  {#each tabs as tab, i}
    <button class="{selectedTab === i ? 'selected' : ''}"
    on:click={() => selectedTab=i}>{tab}</button>
  {/each}
</div>

<div class="tabcontent">
  <slot></slot>
</div>