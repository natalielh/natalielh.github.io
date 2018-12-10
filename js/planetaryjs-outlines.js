  //--- CUSTOM VERSION OF 'PINGS' PLUGIN ---//
  planetaryjs.plugins.outlines = function(config) {
    var outlines = [];
    config = config || {};

    var addOutline = function(lng, lat, options) {
      options = options || {};
      options.color = options.color || config.color || 'white';
      options.angle = options.angle || config.angle || 5;
      //options.ttl   = options.ttl   || config.ttl   || 2000;
      //var outline = { time: new Date(), options: options };
      var outline = { options: options };
      if (config.latitudeFirst) {
        outline.lat = lng;
        outline.lng = lat;
      } else {
        outline.lng = lng;
        outline.lat = lat;
      }
      outlines.push(outline);
    };

    //var drawOutlines = function(planet, context, now) {
    var drawOutlines = function(planet, context) {
      var newOutlines = [];
      for (var i = 0; i < outlines.length; i++) {
        var outline = outlines[i];
        // var alive = now - outline.time;
        // if (alive < outline.options.ttl) {
        //   newOutlines.push(outline);
        //   drawOutline(planet, context, now, alive, outline);
        // }
        newOutlines.push(outline);
        //drawOutline(planet, context, now, outline);
        drawOutline(planet, context, outline);
      }
      outlines = newOutlines;
    };

    //var drawOutline = function(planet, context, now, alive, outline) {
    //var drawOutline = function(planet, context, now, outline) {
    var drawOutline = function(planet, context, outline) {
      var alpha = 1;
      //var alpha = 1 - (alive / outline.options.ttl);
      var color = d3.rgb(outline.options.color);
      color = "rgba(" + color.r + "," + color.g + "," + color.b + "," + alpha + ")";
      context.strokeStyle = color;
      var circle = d3.geo.circle().origin([outline.lng, outline.lat])
        //.angle(alive / outline.options.ttl * outline.options.angle)();
        .angle(outline.options.angle)();
      context.beginPath();
      planet.path.context(context)(circle);
      context.stroke();
    };

    return function (planet) {
      planet.plugins.outlines = {
        add: addOutline
      };

      planet.onDraw(function() {
        //var now = new Date();
        planet.withSavedContext(function(context) {
          //drawOutlines(planet, context, now);
          drawOutlines(planet, context);
        });
      });
    };
  };
