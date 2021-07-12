"use strict";

importScripts('pyodide/pyodide.js');

let pyodideReady = false;
let pyFuncs;

async function setupPyodide() {
  try {
    await self.loadPyodide({ indexURL: 'pyodide/'});
    await self.pyodide.loadPackage(['micropip', 'numpy']);
    await self.pyodide.runPythonAsync(`
      import micropip
      await micropip.install('pyodide/trust_constr-1.0.0-py3-none-any.whl')
    `);
    const response = await fetch("calculations.py");
    const pythonScript = await response.text();
    pyFuncs = self.pyodide.runPython(pythonScript);
    console.log('Python Ready');
    pyodideReady = true;
  } catch(e) {
    console.error('Python loading failed.');
    console.error(e);
  }
}

const pyodidePromise = setupPyodide();

self.onmessage = async function(e){
  await pyodidePromise;
  if (!pyodideReady) {
    postMessage("pyodide_not_available");
    return;
  }

  const result = pyFuncs.getParetoPoints(...e.data.map(JSON.stringify));

  postMessage(JSON.parse(result));
}
