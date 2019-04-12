(function() {
  var canvas = document.getElementById('planet');

  // Create our Planetary.js planet and set some initial values;
  // we use several custom plugins, defined at the bottom of the file
  var planet = planetaryjs.planet();
  // planet.loadPlugin(autocenter({extraHeight: -120}));
  // planet.loadPlugin(autoscale({extraHeight: -120}));
  planet.loadPlugin(autocenter({extraHeight: -200}));
  planet.loadPlugin(autoscale({extraHeight: -200}));
  planet.loadPlugin(planetaryjs.plugins.earth({
    topojson: { file:   'data/world-110m.json' },
    oceans:   { fill:   '#c9e8e3' },
    land:     { fill:   '#65c7b8' },
    borders:  { stroke: '#65c7b8' }
  }));
  //planet.loadPlugin(planetaryjs.plugins.pings());
  planet.loadPlugin(planetaryjs.plugins.outlines());
  planet.loadPlugin(planetaryjs.plugins.zoom({
    scaleExtent: [100, 1000]
  }));
  planet.loadPlugin(planetaryjs.plugins.drag({
    onDragStart: function() {
      this.plugins.autorotate.pause();
    },
    onDragEnd: function() {
      this.plugins.autorotate.resume();
    }
  }));
  planet.loadPlugin(autorotate(1));
  planet.projection.rotate([100, -10, 0]);

  //planet.plugins.outlines.add(50, 50, {color: 'white', ttl: 500, angle: 100});
  //planet.plugins.outlines.add(lng, lat, { color: color, ttl: 2000, angle: Math.random() * 10 });

    //TESTCODE START
    // var colors = ['red', 'yellow', 'white', 'orange', 'green', 'cyan', 'pink'];
    // setInterval(function() {
    //   var lat = Math.random() * 170 - 85;
    //   var lng = Math.random() * 360 - 180;
    //   var color = colors[Math.floor(Math.random() * colors.length)];
    //   planet.plugins.outlines.add(lng, lat, { color: color, ttl: 2000, angle: Math.random() * 10 });
    // }, 150);
    //TESTCODE END

  //--- LOAD IN METEORITE DATA FROM .CSV FILE ---//
  d3.csv("data/meteorite-landings.csv", function(err, data) {
    if (err) {
      alert("ERROR: Problem loading meteorite data.");
      return;
    } else {

      var minMassAccepted = 15000;

      var sqrtScale = d3.scale.sqrt()
        .domain([0, 60000000])
        .range([0.1, 20]);

      data.forEach(function(d) {
        d.id = +d.id;
        d.mass = +d.mass;
        d.year = +d.year;
        d.reclat = +d.reclat;
        d.reclong = +d.reclong;

        if(d.reclat !== 0 || !d.reclong !== 0){
          if(d.mass > minMassAccepted ){
            planet.plugins.outlines.add(d.reclong, d.reclat, {color: 'black', angle: sqrtScale(d.mass)} );
          }
        }

      });
      //console.log(data);
      console.log("Meteorite data loaded!");
    }
  });

  //--- ADD OUTLINES VIA CUSTOM PLUGIN ---//
  planet.onInit(function() {
    //planet.plugins.outlines.add(0, 0, {color: 'yellow', ttl: 2000, angle: 10});
    //console.log("Meteorite added!");
  });

    //planet.plugins.outlines.add(0, 0, {color: 'yellow', ttl: 2000, angle: 80});




  planet.draw(canvas);


  //planet.plugins.outlines.add();

// NEW
  // var dplanet = d3.select(#planet);
  // var meteoriteLayer = dplanet.append('g');
// NEWEND

  // Load our earthquake data and set up the controls.
  // The data consists of an array of objects in the following format:
  // {
  //   mag:  magnitude_of_quake
  //   lng:  longitude_coordinates
  //   lat:  latitude_coordinates
  //   time: timestamp_of_quake
  // }
  // The data is ordered, with the earliest data being the first in the file.
  // d3.json('data/meteorite-strike-data.json', function(err, data) {
  //   if (err) {
  //     alert("Problem loading the quake data.");
  //     return;
  //   }
  // });

  // //--- LOAD IN METEORITE DATA FROM .CSV FILE ---//
  // d3.csv("data/meteorite-landings.csv", function(err, data) {
  //   console.log(data[0]);
  //   if (err) {
  //     alert("ERROR: Problem loading meteorite data.");
  //     return;
  //   }
  // });



  // Plugin to resize the canvas to fill the window and to
  // automatically center the planet when the window size changes
  function autocenter(options) {
    options = options || {};
    var needsCentering = false;
    var globe = null;

    var resize = function() {
      var width  = window.innerWidth + (options.extraWidth || 0);
      var height = window.innerHeight + (options.extraHeight || 0);
      globe.canvas.width = width;
      globe.canvas.height = height;
      globe.projection.translate([width / 2, height / 2]);
    };

    return function(planet) {
      globe = planet;
      planet.onInit(function() {
        needsCentering = true;
        d3.select(window).on('resize', function() {
          needsCentering = true;
        });
      });

      planet.onDraw(function() {
        if (needsCentering) { resize(); needsCentering = false; }
      });
    };
  };

  // Plugin to automatically scale the planet's projection based
  // on the window size when the planet is initialized
  function autoscale(options) {
    options = options || {};
    return function(planet) {
      planet.onInit(function() {
        var width  = window.innerWidth + (options.extraWidth || 0);
        var height = window.innerHeight + (options.extraHeight || 0);
        planet.projection.scale(Math.min(width, height) / 2);
      });
    };
  };

  // Plugin to automatically rotate the globe around its vertical
  // axis a configured number of degrees every second.
  function autorotate(degPerSec) {
    return function(planet) {
      var lastTick = null;
      var paused = false;
      planet.plugins.autorotate = {
        pause:  function() { paused = true;  },
        resume: function() { paused = false; }
      };
      planet.onDraw(function() {
        if (paused || !lastTick) {
          lastTick = new Date();
        } else {
          var now = new Date();
          var delta = now - lastTick;
          var rotation = planet.projection.rotate();
          rotation[0] += degPerSec * delta / 1000;
          if (rotation[0] >= 180) rotation[0] -= 360;
          planet.projection.rotate(rotation);
          lastTick = now;
        }
      });
    };
  };


})();
