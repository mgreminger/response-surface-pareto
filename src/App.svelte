<script>
  import EditableTable from "./EditableTable.svelte";

  let parameters = [
    "Material Thickness (mm)",
    "Rib Height (mm)",
    "Displacement (mm)",
    "Mass (g)",
  ];

  let parameterTypes = [];
  let parameterOptions = [];

  const types = [
    {name:undefined, text: ''},
    {name:'input', text: 'Input Paramater'},
    {name:'output', text: 'Output Paramater'},
    {name:'ignore', text: 'Ignore Parameter'}
  ]

  let data = [
    ["7.5", "15", "0.8779", "1270.98"],
    ["2.5", "15", "7.87986", "426.956"],
    ["7.5", "7", "1.46584", "1101.3"],
    ["2.5", "7", "22.17822", "368.753"],
    ["7.5", "11", "1.13536", "1186.14"],
    ["2.5", "11", "12.27396", "397.855"],
    ["5", "15", "2.14489", "850.594"],
    ["5", "7", "4.30295", "735.856"],
    ["5", "11", "2.94196", "793.225"],
  ];

  $: parameterTypes.length = parameters.length
  $: {
    parameterOptions.length = parameterTypes.length;
    parameterTypes.forEach((type, i) => {
      if (type.name === 'input') {
        parameterOptions[i] = {goal: 'minimize'};
      } else if (type.name === 'output') {
        parameterOptions[i] = {min: 0, max: 20};
      }
    });
  }
</script>

<EditableTable
  bind:data 
  editableData={true}
  bind:headers={parameters}
  editableHeaders={true}/>

{#each parameters as parameter, i}
  <label>
    <select bind:value={parameterTypes[i]}>
      {#each types as type}
        <option value={type}>
          {type.text}
        </option>
      {/each}
    </select>
    {parameter}
    {#if parameterTypes[i] && parameterTypes[i].name === 'input'}
      <div>input</div>
    {:else if parameterTypes[i] && parameterTypes[i].name === 'output'}
      <div>output</div>
    {/if}
  </label>
{/each}
