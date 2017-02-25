require([
      "esri/Map",
      "esri/layers/FeatureLayer",
      "esri/views/MapView",
      "esri/widgets/Legend",
      "esri/config",
      "esri/core/urlUtils",
      "esri/widgets/Locate",
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
      "esri/symbols/SimpleFillSymbol",
      "esri/geometry/geometryEngine",
      "esri/geometry/Point",
      "esri/tasks/support/Query",
      "dojo/dom-construct",
      "esri/geometry/support/webMercatorUtils",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/renderers/UniqueValueRenderer",
      "dojo/dom",
      "dojo/on",
      "dojo/domReady!"
    ], function(
      Map,
      FeatureLayer,
      MapView,
      Legend,
      esriConfig,
      urlUtils,
      Locate,
      GraphicsLayer,
      Graphic,
      SimpleFillSymbol,
      geometryEngine,
      Point,
      Query,
      domConstruct,
      webMercatorUtils,
      SimpleMarkerSymbol,
      UniqueValueRenderer,
      dom,
      on) {
      
    	/**********************************
         * Add feature and graphic layers *
         **********************************/
    	
      var gLayer = new GraphicsLayer();
    	
      var floodLayer = new FeatureLayer({
        url: "https://igems.doi.gov/arcgis/rest/services/igems_haz/MapServer/0",
        visible: true
      });       

      var volcanoeLayer = new FeatureLayer({
          url: "https://igems.doi.gov/arcgis/rest/services/igems_haz/MapServer/1",
          visible: true
        });    
      
      var earthquakeLayer = new FeatureLayer({
          url: "https://igems.doi.gov/arcgis/rest/services/igems_haz/MapServer/3",
          visible: true
        });    
      
      var hurricaneLayer = new FeatureLayer({
          url: "https://igems.doi.gov/arcgis/rest/services/igems_haz/MapServer/5",
          visible: true
        });   
      
      var wildfireLayer = new FeatureLayer({
          url: "https://igems.doi.gov/arcgis/rest/services/igems_haz/MapServer/10",
          visible: true
        }); 
      
      // Create SimpleMarkerSymbols to display unique values in renderer
      var yesPet = new SimpleMarkerSymbol({
    	  color: "seagreen"
      });
      
      var noPet = new SimpleMarkerSymbol({
    	  color: "red"
      });
      
      // Create a UniqueValueRenderer using uniqueValueInfos
      var renderer = new UniqueValueRenderer({
    	  field: "ALLOWPETS",
    	  uniqueValueInfos: [{
    		  value: "Yes",
    		  symbol: yesPet,
    		  label: "Yes"
    	  },
    	  {
    		  value: "No",
    		  symbol: noPet,
    		  label: "No"
    	  }]
      });
      
      
      var shelterLayer = new FeatureLayer({
    	  //url: "http://services.femadata.com/arcgis/rest/services/Shelters/FEMA_Open_Shelters/FeatureServer/0",
    	  url: "http://services3.arcgis.com/srAyaQgvZkzUzL4M/arcgis/rest/services/Shelters/FeatureServer/0",
          renderer: renderer,
          outFields: ["*"],
    	  visible: false
        }); 
      
      // Create the map and add the layers to the map
      var map = new Map({
        basemap: "dark-gray",
        layers: [gLayer, shelterLayer, floodLayer, volcanoeLayer, earthquakeLayer, hurricaneLayer, wildfireLayer]
      });

      // Create the view
      var view = new MapView({
        container: "viewDiv",
        center: [-96.050173, 39.216911],
        zoom: 4,
        map: map,
        padding: {
            right: 300
          }
      });
      
      var listNode = dom.byId("shelter_graphics");
      
  	  /****************
       * Add a legend *
       ****************/
      
      // Create the legend
      var legend = new Legend({
          view: view,
          layerInfos: [{
              layer: floodLayer,
              title: "Floods"
            },
            {
            	layer: volcanoeLayer,
            	title: "Volcanoes"
            },
            {
            	layer: earthquakeLayer,
            	title: "Earthquakes"
            },
            {
            	layer: hurricaneLayer,
            	title: "Hurricanes"
            },
            {
            	layer: wildfireLayer,
            	title: "Wildfires"
            },
            {
            	layer: shelterLayer,
            	title: "Shelters"
            }]
        }, "legendDiv");
      
  	  // Add the legend to the view
      view.ui.add(legend, "bottom-left");

      /*******************************************
       * Create a Checkbox Toggle for the layers *
       *******************************************/
      
      var shelterTog = dom.byId("shelterToggle");
      var wildfireTog = dom.byId("wildfireToggle");
      var hurricaneTog = dom.byId("hurricaneToggle");
      var earthquakeTog = dom.byId("earthquakeToggle");
      var volcanoeTog = dom.byId("volcanoeToggle");
      var floodTog = dom.byId("floodToggle");
      
      on(shelterTog, "change", function(){
    	  shelterLayer.visible = shelterTog.checked;
      });
      
      on(wildfireTog, "change", function(){
   	      wildfireLayer.visible = wildfireTog.checked;
      });
      
      on(hurricaneTog, "change", function(){
   	      hurricaneLayer.visible = hurricaneTog.checked;
      });

      on(earthquakeTog, "change", function(){
   	      earthquakeLayer.visible = earthquakeTog.checked;
      });
      
      on(volcanoeTog, "change", function(){
   	      volcanoeLayer.visible = volcanoeTog.checked;
      });
      
      on(floodTog, "change", function(){
   	      floodLayer.visible = floodTog.checked;
      });
     
      /***************************************
       * Add and Customize the Locate Button *
       ***************************************/
      
      // Create the Locate Button using the Locate Widget
      var locateBtn = new Locate({
    	  view: view,
      });
      locateBtn.startup();
      
      // Add the button to the view
      view.ui.add(locateBtn, {
    	  position: "top-left",
    	  index: 0
      });
      
      // Create a SimpleFillSymbol for the buffer
      var bufferSym = new SimpleFillSymbol({
          color: [255, 255, 255, 0.5],
          outline: {
            color: [0, 0, 0, 0.5],
            width: 2
          }
        });
      
      // Create a SimpleMarkerSymbol to display the buffered features
      var ptSym = new SimpleMarkerSymbol({
    	  color: [227, 139, 79, 0.8]
      });
      
      var graphics;
      
      // Use the Locate Button to Trigger other Events
      locateBtn.on("locate", function geoProcess(){
              	  
    	  //Change Zoom Level
    	  view.zoom = 13;
          
    	  //Buffer the geolocation
          var locPnt = locateBtn.graphic.geometry;
          var ptGeom = webMercatorUtils.geographicToWebMercator(locPnt); 
          var buffer = geometryEngine.buffer(ptGeom, 5, "miles");
          var bufferGraphic = new Graphic({
              geometry: buffer,
              symbol: bufferSym
          });
          
          // Remove all the graphics for each new buffer
          gLayer.removeAll();
          
          // Add the buffer graphic to the map
          gLayer.add(bufferGraphic);
          

          
          //Use the buffer as the filter to query features 
          var query = new Query();
    	  query.geometry = buffer;
    	  query.spatialRelationship="intersects";
    	  query.outSpatialReference = view.spatialReference;
    	  query.returnGeometry = true;
    	  query.outFields = [ "CAPACITY", "FACNAME", "OCCUPANCY", "FULLADDR", "ALLOWPETS" ];

    	  // Create a popup template to display information for each point graphic
          var pTemplate = {
            title: "{FACNAME}",
            content: " <b> Address: </b> &nbsp; {FULLADDR} <br> <br> <b> Total Capacity: </b> &nbsp; {CAPACITY} <br> <br> <b> Current Occupancy: </b> &nbsp; {OCCUPANCY}"
          };
    	    
    	  	// Query the features
    	  	shelterLayer.queryFeatures(query).then(function(results){
    	  		
    	  		graphics = results;
    	  		var fragment = document.createDocumentFragment();
  				
    	  		results.features.forEach(function(result, index) {
  					var attributes = result.attributes;
  					var availCapacity = attributes.CAPACITY - attributes.OCCUPANCY;
  					var name = attributes.FACNAME + " (Available Occupancy: " + availCapacity + ")";
  					
  					// Display the results of the buffer outside of the mapview in the side panel
  					domConstruct.create("li", {
  						className: "panel-result",
  						tabIndex: 0,
  						"data-result-id": index,
  						textContent: name
  					}, fragment);
  					
  					// Add the point graphics to the map view for each feature in the buffer
  					var intersectGeo = geometryEngine.intersect(result.geometry, buffer);
  					var intersectGraphic = new Graphic({
  						geometry: intersectGeo,
  						symbol: ptSym,
  						attributes: result.attributes,
  						popupTemplate: pTemplate
  					});	
  					gLayer.add(intersectGraphic);
  					
  			});
			domConstruct.place(fragment, listNode, "only");
  			});
      	  });
          


  	    
    }); 
