var Module=typeof pyodide._module!=="undefined"?pyodide._module:{};if(!Module.expectedDataFileDownloads){Module.expectedDataFileDownloads=0;Module.finishedDataFileDownloads=0}Module.expectedDataFileDownloads++;(function(){var loadPackage=function(metadata){var PACKAGE_PATH;if(typeof window==="object"){PACKAGE_PATH=window["encodeURIComponent"](window.location.pathname.toString().substring(0,window.location.pathname.toString().lastIndexOf("/"))+"/")}else if(typeof location!=="undefined"){PACKAGE_PATH=encodeURIComponent(location.pathname.toString().substring(0,location.pathname.toString().lastIndexOf("/"))+"/")}else{throw"using preloaded data can only be done on a web page or in a web worker"}var PACKAGE_NAME="trust-constr.data";var REMOTE_PACKAGE_BASE="trust-constr.data";if(typeof Module["locateFilePackage"]==="function"&&!Module["locateFile"]){Module["locateFile"]=Module["locateFilePackage"];err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")}var REMOTE_PACKAGE_NAME=Module["locateFile"]?Module["locateFile"](REMOTE_PACKAGE_BASE,""):REMOTE_PACKAGE_BASE;var REMOTE_PACKAGE_SIZE=metadata.remote_package_size;var PACKAGE_UUID=metadata.package_uuid;function fetchRemotePackage(packageName,packageSize,callback,errback){var xhr=new XMLHttpRequest;xhr.open("GET",packageName,true);xhr.responseType="arraybuffer";xhr.onprogress=function(event){var url=packageName;var size=packageSize;if(event.total)size=event.total;if(event.loaded){if(!xhr.addedTotal){xhr.addedTotal=true;if(!Module.dataFileDownloads)Module.dataFileDownloads={};Module.dataFileDownloads[url]={loaded:event.loaded,total:size}}else{Module.dataFileDownloads[url].loaded=event.loaded}var total=0;var loaded=0;var num=0;for(var download in Module.dataFileDownloads){var data=Module.dataFileDownloads[download];total+=data.total;loaded+=data.loaded;num++}total=Math.ceil(total*Module.expectedDataFileDownloads/num);if(Module["setStatus"])Module["setStatus"]("Downloading data... ("+loaded+"/"+total+")")}else if(!Module.dataFileDownloads){if(Module["setStatus"])Module["setStatus"]("Downloading data...")}};xhr.onerror=function(event){throw new Error("NetworkError for: "+packageName)};xhr.onload=function(event){if(xhr.status==200||xhr.status==304||xhr.status==206||xhr.status==0&&xhr.response){var packageData=xhr.response;callback(packageData)}else{throw new Error(xhr.statusText+" : "+xhr.responseURL)}};xhr.send(null)}function handleError(error){console.error("package error:",error)}var fetchedCallback=null;var fetched=Module["getPreloadedPackage"]?Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE):null;if(!fetched)fetchRemotePackage(REMOTE_PACKAGE_NAME,REMOTE_PACKAGE_SIZE,function(data){if(fetchedCallback){fetchedCallback(data);fetchedCallback=null}else{fetched=data}},handleError);function runWithFS(){function assert(check,msg){if(!check)throw msg+(new Error).stack}Module["FS_createPath"]("/","lib",true,true);Module["FS_createPath"]("/lib","python3.8",true,true);Module["FS_createPath"]("/lib/python3.8","site-packages",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","trust_constr-1.0.0-py3.8.egg-info",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages","trust_constr",true,true);Module["FS_createPath"]("/lib/python3.8/site-packages/trust_constr","_trustregion_constr",true,true);function DataRequest(start,end,audio){this.start=start;this.end=end;this.audio=audio}DataRequest.prototype={requests:{},open:function(mode,name){this.name=name;this.requests[name]=this;Module["addRunDependency"]("fp "+this.name)},send:function(){},onload:function(){var byteArray=this.byteArray.subarray(this.start,this.end);this.finish(byteArray)},finish:function(byteArray){var that=this;Module["FS_createPreloadedFile"](this.name,null,byteArray,true,true,function(){Module["removeRunDependency"]("fp "+that.name)},function(){if(that.audio){Module["removeRunDependency"]("fp "+that.name)}else{err("Preloading file "+that.name+" failed")}},false,true);this.requests[this.name]=null}};function processPackageData(arrayBuffer){Module.finishedDataFileDownloads++;assert(arrayBuffer,"Loading data file failed.");assert(arrayBuffer instanceof ArrayBuffer,"bad input to processPackageData");var byteArray=new Uint8Array(arrayBuffer);var curr;var compressedData={data:null,cachedOffset:197322,cachedIndexes:[-1,-1],cachedChunks:[null,null],offsets:[0,1112,2110,3263,4337,5421,6478,7922,9273,10542,11810,12968,14358,15852,17173,18497,19675,20734,21719,22604,23631,24428,25161,26003,27175,28441,29499,30694,32076,33420,34780,36320,37632,38713,40036,41426,42697,44095,45305,46422,47632,49136,50407,51496,52719,53825,55207,56565,57870,59242,60500,61931,63115,64377,65699,67041,68402,69535,70608,71748,72759,74180,75572,76882,78187,79490,80384,81601,82862,84136,85574,86842,88149,89191,90295,91637,92505,93330,94036,95126,96088,97404,98478,99629,100783,101986,103177,104388,105529,106764,107922,109109,110383,111811,112944,114315,115733,117302,118828,120148,121339,122383,123158,124257,125615,126998,128118,129428,130712,132122,133251,134562,135533,136663,137847,138918,140234,141508,142612,143482,144235,145310,146249,147097,148045,149401,150473,151612,152668,153767,154946,156203,157430,158714,159734,161007,162225,163464,164869,166122,167008,168299,169686,170822,171753,173012,174168,175129,175885,176772,177856,178994,180075,181017,182041,183323,184556,185894,186809,188082,189076,189847,190639,191682,193058,194054,195237,196357],sizes:[1112,998,1153,1074,1084,1057,1444,1351,1269,1268,1158,1390,1494,1321,1324,1178,1059,985,885,1027,797,733,842,1172,1266,1058,1195,1382,1344,1360,1540,1312,1081,1323,1390,1271,1398,1210,1117,1210,1504,1271,1089,1223,1106,1382,1358,1305,1372,1258,1431,1184,1262,1322,1342,1361,1133,1073,1140,1011,1421,1392,1310,1305,1303,894,1217,1261,1274,1438,1268,1307,1042,1104,1342,868,825,706,1090,962,1316,1074,1151,1154,1203,1191,1211,1141,1235,1158,1187,1274,1428,1133,1371,1418,1569,1526,1320,1191,1044,775,1099,1358,1383,1120,1310,1284,1410,1129,1311,971,1130,1184,1071,1316,1274,1104,870,753,1075,939,848,948,1356,1072,1139,1056,1099,1179,1257,1227,1284,1020,1273,1218,1239,1405,1253,886,1291,1387,1136,931,1259,1156,961,756,887,1084,1138,1081,942,1024,1282,1233,1338,915,1273,994,771,792,1043,1376,996,1183,1120,965],successes:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]};compressedData.data=byteArray;assert(typeof Module.LZ4==="object","LZ4 not present - was your app build with  -s LZ4=1  ?");Module.LZ4.loadPackage({metadata:metadata,compressedData:compressedData});Module["removeRunDependency"]("datafile_trust-constr.data")}Module["addRunDependency"]("datafile_trust-constr.data");if(!Module.preloadResults)Module.preloadResults={};Module.preloadResults[PACKAGE_NAME]={fromCache:false};if(fetched){processPackageData(fetched);fetched=null}else{fetchedCallback=processPackageData}}if(Module["calledRun"]){runWithFS()}else{if(!Module["preRun"])Module["preRun"]=[];Module["preRun"].push(runWithFS)}};loadPackage({files:[{filename:"/lib/python3.8/site-packages/trust_constr-1.0.0-py3.8.egg-info/top_level.txt",start:0,end:13,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr-1.0.0-py3.8.egg-info/dependency_links.txt",start:13,end:14,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr-1.0.0-py3.8.egg-info/SOURCES.txt",start:14,end:906,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr-1.0.0-py3.8.egg-info/requires.txt",start:906,end:920,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr-1.0.0-py3.8.egg-info/PKG-INFO",start:920,end:12721,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/sputils.py",start:12721,end:24311,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/interface.py",start:24311,end:49732,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_numdiff.py",start:49732,end:70044,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/optimize.py",start:70044,end:163322,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_hessian_update_strategy.py",start:163322,end:179460,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_minimize.py",start:179460,end:217329,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/__init__.py",start:217329,end:217680,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_constraints.py",start:217680,end:236136,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_differentiable_functions.py",start:236136,end:254610,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/tr_interior_point.py",start:254610,end:266404,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/qp_subproblem.py",start:266404,end:287479,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/equality_constrained_sqp.py",start:287479,end:296034,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/canonical_constraint.py",start:296034,end:307895,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/report.py",start:307895,end:309943,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/minimize_trustregion_constr.py",start:309943,end:334416,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/projections.py",start:334416,end:343420,audio:0},{filename:"/lib/python3.8/site-packages/trust_constr/_trustregion_constr/__init__.py",start:343420,end:343555,audio:0}],remote_package_size:201418,package_uuid:"d72bd5ea-17a9-4957-ae90-ed227e479f47"})})();