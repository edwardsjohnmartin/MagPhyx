//
//  initShaders.js
//

function initShaders( gl, vertexShaderId, fragmentShaderId )
{
  var vertShdr;
  var fragShdr;

  var vertElem = document.getElementById( vertexShaderId );
  if ( !vertElem ) { 
    alert( "Unable to load vertex shader " + vertexShaderId );
    return -1;
  }
  else {
    vertShdr = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertShdr, vertElem.text );
    gl.compileShader( vertShdr );
    if ( !gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS) ) {
      var msg = "Vertex shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( vertShdr ) + "</pre>";
      alert( msg );
      return -1;
    }
  }

  var fragElem = document.getElementById( fragmentShaderId );
  if ( !fragElem ) { 
    alert( "Unable to load vertex shader " + fragmentShaderId );
    return -1;
  }
  else {
    fragShdr = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragShdr, fragElem.text );
    gl.compileShader( fragShdr );
    if ( !gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS) ) {
      var msg = "Fragment shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( fragShdr ) + "</pre>";
      alert( msg );
      return -1;
    }
  }

  var program = gl.createProgram();
  gl.attachShader( program, vertShdr );
  gl.attachShader( program, fragShdr );
  gl.linkProgram( program );
  
  if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
    var msg = "Shader program failed to link.  The error log is:"
      + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
    alert( msg );
    return -1;
  }

  return program;
}

function initShadersNew(gl, vfilename, ffilename, callback) {
  loadFiles([vfilename, ffilename], function (shaderText) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderText[0]);

    gl.compileShader( vertexShader );
    if ( !gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) ) {
      var msg = "Vertex shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( vertexShader ) + "</pre>";
      alert( msg );
      return -1;
    }

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderText[1]);

    gl.compileShader( fragmentShader );
    if ( !gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) ) {
      var msg = "Fragment shader failed to compile.  The error log is:"
        + "<pre>" + gl.getShaderInfoLog( fragmentShader ) + "</pre>";
      alert( msg );
      return -1;
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );
    
    if ( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
      var msg = "Shader program failed to link.  The error log is:"
        + "<pre>" + gl.getProgramInfoLog( program ) + "</pre>";
      alert( msg );
      // return -1;
    }

    // return program;
    callback(program);
  }, function (url) {
    alert('Failed to download "' + url + '"');
  }); 
}


//--------------------------------------------------------
// Shader code from StackOverflow
//--------------------------------------------------------

function loadFile(url, data, callback, errorCallback) {
  // Set up an asynchronous request
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  // Hook the event that gets called as the request progresses
  request.onreadystatechange = function () {
    // If the request is "DONE" (completed or failed)
    if (request.readyState == 4) {
      // If we got HTTP status 200 (OK)
      if (request.status == 200) {
        callback(request.responseText, data)
      } else { // Failed
        errorCallback(url);
      }
    }
  };

  request.send(null);    
}

function loadFiles(urls, callback, errorCallback) {
  var numUrls = urls.length;
  var numComplete = 0;
  var result = [];

  // Callback for a single file
  function partialCallback(text, urlIndex) {
    result[urlIndex] = text;
    numComplete++;

    // When all files have downloaded
    if (numComplete == numUrls) {
      callback(result);
    }
  }

  for (var i = 0; i < numUrls; i++) {
    loadFile(urls[i], i, partialCallback, errorCallback);
  }
}

// var gl;
// // ... set up WebGL ...

// loadFiles(['vertex.shader', 'fragment.shader'], function (shaderText) {
//     var vertexShader = gl.createShader(gl.VERTEX_SHADER);
//     gl.shaderSource(vertexShader, shaderText[0]);
//     // ... compile shader, etc ...
//     var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
//     gl.shaderSource(fragmentShader, shaderText[1]);

//     // ... set up shader program and start render loop timer
// }, function (url) {
//     alert('Failed to download "' + url + '"');
// }); 
