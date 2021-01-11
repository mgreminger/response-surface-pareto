self.languagePluginUrl = 'pyodide/';
importScripts('pyodide/pyodide.js');

languagePluginLoader
.then(() => self.pyodide.loadPackage('nlopt'))
.then(() => fetch("calculations.py"))
.then(response => response.text())
.then((data) => {
               self.pyodide.runPython(data);
               self.py_funcs = self.pyodide.runPython('py_funcs');
               console.log('Python Ready');
               self.py_funcs.test()
               self.pyodide_ready = true
             })
.catch(e => {console.error('Python loading failed.');
             console.error(e);}
)

