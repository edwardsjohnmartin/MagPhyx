var Logger = function() {
  this.state = new Object();

  this.verbosePanel = false;

  this.logEntries = [
    "num_events", "event_type", "t",
    "r", "theta", "phi", "pr", "ptheta", "pphi", "beta",
    "E", "dE" ];
  this.logEntrySet = new Set(this.logEntries);

  this.id2label = new Object();
  this.id2label["event_type"] = "type";
  this.id2label["theta"] = "&theta;";
  this.id2label["phi"] = "&phi;";
  this.id2label["beta"] = "&beta;";
  this.id2label["pr"] = "p<sub>r</sub>";
  this.id2label["ptheta"] = "p<sub>&theta;</sub>";
  this.id2label["pphi"] = "p<sub>&phi;</sub>";
  this.id2label["dE"] = "&Delta;E";
  this.id2label["num_events"] = "n";
  this.id2label["v_at_collision"] = "v<sub>coll</sub>";
  this.id2label["t_at_collision"] = "t<sub>coll</sub>";
  this.id2label["time_at_zero_crossing"] = "t<sub>zero</sub>";
  this.id2label["w_at_zero_crossing"] = "&omega;<sub>zero</sub>";
  this.id2label["theta_range"] = "&theta; range";
  this.id2label["phi_range"] = "&phi; range";
  this.id2label["t_eddy_mag"] = "|&tau;<sub>eddy</sub>|";
  this.id2label["f_eddy_mag"] = "|F<sub>eddy</sub>|";
  this.id2label["U"] = "U";
  this.id2label["T"] = "T";
  this.id2label["R"] = "R";
  this.id2label["E"] = "E";
  this.id2label["w"] = "&omega;";
  this.id2label["v_mag"] = "|v|";
  this.id2label["m"] = "m (&deg;)";
  this.id2label["B_mag"] = "|B|";
  this.id2label["tau"] = "|&tau;|";
  this.id2label["tau_net"] = "|&tau;<sub>net</sub>|";
  this.id2label["F"] = "F";
  this.id2label["F_mag"] = "|F|";
  this.id2label["F_mag_net"] = "|F<sub>net</sub>|";
  this.id2label["elapsed_time"] = "t";
  this.id2label["time_step"] = "&Delta;t";

  this.id2logLabel = new Object();
  this.id2logLabel["num_events"] = "n";
  this.id2logLabel["event_type"] = "event type";
  this.id2logLabel["elapsed_time"] = "t";

  this.logString = "";
}

Logger.prototype.getLabel = function(property) {
  var label = property;
  if (this.id2label.hasOwnProperty(property)) {
    label = this.id2label[property];
  }
  return label;
}

Logger.prototype.getLogLabel = function(property) {
  var label = property;
  if (this.id2logLabel.hasOwnProperty(property)) {
    label = this.id2logLabel[property];
  }
  return label;
}

Logger.prototype.reset = function() {
  this.logString = "";
  for (var i = 0; i < this.logEntries.length; i++) {
    var property = this.logEntries[i];
    var label = this.getLogLabel(property);
    this.logString += label + ",";
  }
  this.logString += "\n";
}

// Called anytime the free dipole moves.
Logger.prototype.setDebugValue = function(name, value) {
  this.state[name] = value;
}

// Called anytime the free dipole moves.
Logger.prototype.stateChanged = function(dipole) {
  this.state.r = dipole.r().toFixed(4);
  this.state.theta = degrees(dipole.theta()).toFixed(4);
  this.state.phi = degrees(dipole.phi()).toFixed(4);
  this.state.pr = dipole.pr().toFixed(4);
  this.state.ptheta = dipole.ptheta().toFixed(4);
  this.state.pphi = dipole.pphi().toFixed(4);
  this.state.beta = degrees(dipole.beta()).toFixed(4);
  this.state.E = dipole.E().toFixed(8);
  this.state.dE = (dipole.E()-dipole.E0).toExponential(2);

  this.state.t = elapsedTime.toFixed(4);
}

// Called at events.
Logger.prototype.event = function(eventType, dipole) {
  this.stateChanged(dipole);

  this.state.num_events = numEvents;
  this.state.event_type = eventType;

  for (var i = 0; i < this.logEntries.length; i++) {
    var property = this.logEntries[i];
    var value = "";
    if (this.state.hasOwnProperty(property)) {
      value = this.state[property];
    }
    
    this.logString += value + ",";
  }
  this.logString += "\n";
}

//------------------------------------------------------------
// Log file methods
//------------------------------------------------------------

Logger.prototype.exportLog = function() {
  window.open('data:text/csv;charset=utf-8,' + escape(this.logString));
}

//------------------------------------------------------------
// GUI panel methods
//------------------------------------------------------------

Logger.prototype.toggleVerbosePanel = function() {
  this.verbosePanel = !this.verbosePanel;
}

Logger.prototype.renderPanel = function() {
  var debug = document.getElementById("debug");
  var html = "";
  html = "<table border=\"0\">";
  var first = true;

  // Render debug values that don't go in the log file. Only render them
  // if in verbose mode. Render them in a smaller font.
  if (this.verbosePanel) {
    for (var property in this.state) {
      if (this.state.hasOwnProperty(property)) {
        if (!logger.logEntrySet.has(property)) {
          var label = logger.getLabel(property);
          html += "<tr style=\"font-size:12px\">";
          html += "<td>" + label + ":</td>";
          html += "<td>" + this.state[property] + "</td>";
          html += "</tr>";
        }
      }
    }
  }

  // Render debug values that go in the log file.
  for (var i = 0; i < logger.logEntries.length; i++) {
    var property = logger.logEntries[i];
    var label = logger.getLabel(property);
    var value = "";
    if (this.state.hasOwnProperty(property)) {
      value = this.state[property];
    }
    html += "<tr>";
    html += "<td>" + label + ":</td>";
    html += "<td>" + value + "</td>";
    html += "</tr>";
  }
  debug.innerHTML = html;
}
