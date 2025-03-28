# Response Surface Pareto Front Generator

<img src="images/logo.png" alt="logo" width="300" height="300">

[Browser based tool](https://mgreminger.github.io/response-surface-pareto/) for creating a tradeoff curve (Pareto front) for two competing design requirements by fitting a response surface to design of experiments (DOE) data. A [tutorial video](https://youtu.be/eRcOnL-D1DA) is available explaining how to use this tool.

This tool runs in your browser and is available [here](https://mgreminger.github.io/response-surface-pareto/). Pareto front caculations are performed using Python in the browser with [Pyodide](https://github.com/iodide-project/pyodide). The [scipy.optimize `minimize`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.minimize.html#scipy.optimize.minimize) function is used to perform the constrained optimization runs required to generated the pareto front. [Svelte](https://svelte.dev/) is used to implement the user interface, [plotly](https://plotly.com/javascript/) is used for plotting, and [sheetjs](https://github.com/SheetJS/sheetjs) is used for spreadsheet file I/O. 

## Build Instructions
### [npm](https://www.npmjs.com/)
``` bash
# Install dependencies
npm install

# Server with hot reload at localhost:5000
npm run dev

# Build for production with minification
npm run build

# Run local server using production build
npm run start &

# Run Playwright tests
npm run test

# Deploy public folder to GitHub pages
npm run deploy
```
## License
MIT
