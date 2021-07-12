# Response Surface Pareto Front Generator

<img src="images/logo.png" alt="logo" width="300" height="300">

[Browser based tool](https://mgreminger.github.io/response-surface-pareto/) for creating a tradeoff curve (Pareto front) for two competing design requirements by fitting a response surface to design of experiments (DOE) data. A [tutorial video](https://youtu.be/eRcOnL-D1DA) is available explaining how to use this tool.

This tool runs in your browser and is available [here](https://mgreminger.github.io/response-surface-pareto/). Pareto front caculations are performed using Python in the browser with [Pyodide](https://github.com/iodide-project/pyodide). The [trust-constr](https://github.com/mgreminger/trust-constr) algorithm that has been extracted from the [SciPy](https://www.scipy.org/) library is used to perform the constrained optimization runs required to generated the pareto front. [Svelte](https://svelte.dev/) is used to implement the user interface, [plotly](https://plotly.com/javascript/) is used for plotting, and [sheetjs](https://github.com/SheetJS/sheetjs) is used for spreadsheet file I/O. 

## Build Instructions
### [npm](https://www.npmjs.com/)
``` bash
# Install dependencies
npm install

# Server with hot reload at localhost:5000
npm run dev

# Build for production with minification
npm run build

# Deploy public folder to GitHub pages
npm run deploy
```
## License
MIT
