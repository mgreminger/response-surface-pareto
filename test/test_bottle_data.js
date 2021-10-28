import { chromium, firefox, webkit } from 'playwright';
import expect from 'expect';

const headless = false;

// number of digits of accuracy after decimal point for .toBeCloseTo() calls
const precision = 4; 

[chromium, firefox, webkit].forEach(async (currentBrowser) => {

  let args = [];

  const browser = await currentBrowser.launch({ headless: headless});
  const context = await browser.newContext();

  // Open new page
  const page = await context.newPage();

  let startTime = Date.now();

  if (process.argv.length > 2) {
    // use provided URL
    await page.goto(process.argv[2]);
  } else {
    // no URL provided, use default local host
    await page.goto('http://localhost:5000/');
  }

  // Click text=Load Bottle Example Dataset
  await page.click('text=Load Bottle Example Dataset');

  // Select ignore
  await page.selectOption('select', 'ignore');

  // Select input
  await page.selectOption('text=Thickness (mm) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'input');

  // Select input
  await page.selectOption('text=Rib Depth (mm) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'input');

  // Select input
  await page.selectOption('text=Diameter (mm) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'input');

  // Select output
  await page.selectOption('text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'output');

  // Select target
  await page.selectOption('text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> :nth-match(select, 2)', 'target');

  // Click text=Diameter (mm) Input ParamaterOutput ParamaterIgnore Parameter Lower Limit: Upper
  await page.click('text=Diameter (mm) Input ParamaterOutput ParamaterIgnore Parameter Lower Limit: Upper');

  // Click text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input
  await page.click('text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input');

  // Triple click text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input
  await page.click('text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input', {
    clickCount: 3
  });

  // Fill text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input
  await page.fill('text=Volume (mm^3) Input ParamaterOutput ParamaterIgnore Parameter Goal: MinimizeMaxi >> input', '600000');

  // Select output
  await page.selectOption('text=Displacement (mm) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'output');

  await page.click('text=Displacement (mm)', {
    clickCount: 3
  });

  await page.fill('text=Displacement (mm)', 'Disp. (mm)');

  // Select output
  await page.selectOption('text=Mass (g) Input ParamaterOutput ParamaterIgnore Parameter >> select', 'output');

  // Click text=Pareto Plot
  await page.click('text=Pareto Plot');

  // Select 5
  await page.selectOption('text=x-axis output: Disp. (mm)Mass (g) >> select', '5');

  // Select 6
  await page.selectOption('text=y-axis output: Disp. (mm)Mass (g) >> select', '6');

  // Click text=Generate Pareto Data
  await page.click('text=Generate Pareto Data');

  // Click text=Pareto Data
  await page.click('text=Pareto Data');

  let content
  const numCols = 6
  const numInputs = 3

  const paretoPoints = [
    [599999.9999999999, 1.4680800885850518, 12.976662751524792],
    [599999.9999999916, 1.6785765727934905, 12.796701600250397],
    [599999.9999999925, 1.889073240571328, 12.627976102981403],
    [599999.9999999976, 2.099568541512021, 12.467192573968793],
    [600000.0, 2.3100227447722457, 12.312367049043763],
    [599999.9999999942, 2.520563254538012, 12.161955621036777],
    [599999.9999999949, 2.7310599316552118, 12.01519248116402],
    [599999.9999999905, 2.941555094465, 11.871319427777948],
    [599999.9999999979, 3.1520530354737497, 11.729805591040765],
    [600000.0000000038, 3.3221495332976563, 11.617061861965416],
  ];

  for (let row=0; row<paretoPoints.length; row++) {
    for(let col=0; col<paretoPoints[0].length; col++) {
      content = await page.textContent(`:below(button:has-text("Export as csv...")) >> :nth-match(td, ${col+numInputs+row*numCols+1})`,
                                       {timeout : 150000});
      expect(parseFloat(content)).toBeCloseTo(paretoPoints[row][col], precision)
    }
  }

  // Click text=Pareto Data
  await page.click('text=Pareto Plot');

  content = await page.textContent('text.xtitle');
  expect(content).toBe('Disp. (mm)')

  console.log(`Elapsed time (${currentBrowser.name()}): ${(Date.now()-startTime)/1000} seconds`)

  // await page.pause();

  // ---------------------
  await context.close();
  await browser.close();
});