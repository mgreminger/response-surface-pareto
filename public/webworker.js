self.languagePluginUrl = 'pyodide/';
importScripts('pyodide/pyodide.js');

languagePluginLoader
.then(() => self.pyodide.loadPackage('nlopt'))
.then(() => fetch("calculations.py"))
.then(response => response.text())
.then((data) => {
               self.py_funcs = self.pyodide.runPython(data);
               console.log('Python Ready');
               self.pyodide_ready = true
             })
.catch(e => {console.error('Python loading failed.');
             console.error(e);}
)

