Proj4js.defs["EPSG:25832"] = "+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs";
Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";
Proj4js.defs["EPSG:900913"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs";

var defaultProjection = new OpenLayers.Projection('EPSG:3857');
var jsT= {
	de:{
		altitudep:'Höhenprofil',
		altitude:'Höhenmeter',
		freeBikes:'Freie Fahrräder',
		freeCars:'Verfügbare Autos',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike für Erwachsene',
		mountain_bike_teenager:'Mountain bike für Jugendliche',
		mountain_bike_child:'Mountain bike für Kinder',
		city_bike_adult_without_gears:'City bike für Erwachsene ohne Gangschaltung',
		chargingStates:{
			1:'Verfügbar',
			2:'Besetzt',
			3:'Reserviert',
			4:'Auser Dienst'
		}
	},
	it:{
		altitudep:'Profilo altimetrico',
		altitude:'Altitudine',
		freeBikes:'Bici disponibili',
		freeCars:'Macchine disponibili',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike per adulti',
		mountain_bike_teenager:'Mountain bike per adolescenti',
		mountain_bike_child:'Mountain bike per bambini',
		city_bike_adult_without_gears:'City bike per adulti senza cambio',
		chargingStates:{
			1:'Disponibile',
			2:'Occupato',
			3:'Prenotato',
			4:'Fuori servizio'
		}
	},
	en:{
		altitudep:'Altitude profile',
		altitude:'Altitude',
		freeBikes:'Available bikes',
		freeCars:'Available cars',
		mountain_bike_adult:'Mountain bike',
		city_bike_adult_with_gears:'City bike for adults',
		mountain_bike_teenager:'Mountain bike for teenager',
		mountain_bike_child:'Mountain bike for children',
		city_bike_adult_without_gears:'City bike for adults without gears',
		chargingStates:{
			1:'Available',
			2:'Occupied',
			3:'Reserved',
			4:'Out of order'
		}
	}

}
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
}
function getPresetFromUrl(value){
	return location.search.substring(1)===value;
}
var preConfigMap = {
	p1:{
		zoom:8,
		longitude:1242107.3809149,
		latitude:5889462.4783187,
	}
	//insert Points here
}
var epsg25832 = new OpenLayers.Projection('EPSG:25832');
var SASABus = {
    config: {
	city:'',
        r3EndPoint: 'http://realtimebus.tis.bz.it/',
	integreenEndPoint:'http://ipchannels.integreen-life.bz.it/',
	apiediEndPoint:'http://apiedi.tis.bz.it/apiedi',
	//apiediEndPoint:'http://localhost:8080/apiedi',
	geoserverEndPoint:'http://geodata.integreen-life.bz.it/geoserver/',
        busPopupSelector: '#busPopup',
        stopPopupSelector: '#stopPopup',
        rowsLimit: 6,
        mapDivId: null,
        defaultDialogOptions: {},
        pinToDialogDistance: 47,
        pinHeight: 74,
        yOffset: 0,
        xOffset: 20
    },
    
    tpl: {
        busRow: undefined,
        busContent: undefined,
        stopRow: undefined,
        stopContent: undefined
    },

    updateBusTimeout: undefined,
    map: undefined,
    linesLayer: undefined,
    stopsLayer: undefined,
    positionLayer: undefined,
    lines: undefined,
    geolocate: undefined,
    locationLayer: undefined,
    activateSelectedThemes: function(activeThemes){
	var me = this;
	var layerMap = {
		walk:[me.wegeStartPointsLayer,me.artPoints].concat(me.map.getLayersByName("routes").concat(me.map.getLayersByName("zugang"))),
		bus:[me.linesLayer,me.positionLayer,me.stopsLayer],
		carsharing:[me.carSharingLayer],
		bikesharing:[me.bikeSharingLayer],
		echarging:[me.echargingLayer]
	}
	$.each(layerMap,function(key,value){				//hide all layers which are in non active Themes
		if ($.inArray(key,activeThemes) == -1){
			$.each(value,function(index,object){
				if (me.map.getLayer(object.id) != null){
					object.setVisibility(false);
				}
			});
		}
	});
	var activeLayers=[];
	activeLayers.push(me.locationLayer);
	$('.config').hide();
	$.each(activeThemes,function(index,object){		//choose Layers to activate
		$('#'+object+'-c').show();
		if (object != undefined && object.length>0){
			activeLayers = activeLayers.concat(layerMap[object]);
		}
	});
	$.each(activeLayers,function(index,object){		//add Layers or set to visible if already added
		if (me.map.getLayer(object.id) == null){
			me.map.addLayer(object);
		}
		else
			object.setVisibility(true);
	});
	var controlOptions={toggle:true};
        var control = new OpenLayers.Control.SelectFeature([me.wegeStartPointsLayer,me.positionLayer,me.stopsLayer,me.bikeSharingLayer,me.artPoints,me.carSharingLayer,me.echargingLayer],controlOptions);//choose Layers which can be interacted with
        me.map.addControl(control);
        control.activate();
    }, 
    init: function(targetDivId) {
        var me = this;
        me.config.mapDivId = targetDivId;
        var mapOptions = {
            projection: defaultProjection,
            controls: [new OpenLayers.Control.Attribution(), new OpenLayers.Control.Navigation()],
	    fractionalZoom: false,
	    units:'m',
	    center:new OpenLayers.LonLat(1242107.3809149, 5889462.4783187),
            resolutions:[156543.033928041,78271.51696402048,39135.75848201023,19567.87924100512,9783.93962050256,4891.96981025128,2445.98490512564,1222.99245256282,611.49622628141,305.7481131407048,152.8740565703525,76.43702828517624,38.21851414258813,19.10925707129406,9.554628535647032,4.777314267823516,2.388657133911758,1.194328566955879,0.5971642834779395,0.29858214173896974,0.14929107086948487],

        };
        me.map = new OpenLayers.Map(targetDivId, mapOptions);
        var topoMap = new OpenLayers.Layer.TMS('topo', 'http://sdi.provincia.bz.it/geoserver/gwc/service/tms/',{
            'layername': 'WMTS_OF2011_APB-PAB', 
            'type': 'png8',
            visibility: true,
            opacity: 0.75,
            attribution: '',
	    numZoomLevels: 18

        });
	function osm_getTileURL(bounds) {
            var res = me.map.getResolution();
            var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
            var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
            var z = this.map.getZoom();
            var limit = Math.pow(2, z);

            if (y < 0 || y >= limit) {
                return OpenLayers.Util.getImagesLocation() + "404.png";
            } else {
                x = ((x % limit) + limit) % limit;
                return this.url + z + "/" + x + "/" + y + "." + this.type;
            }
        }
        var osm = new OpenLayers.Layer.TMS(
                "OSM",
                "http://otile1.mqcdn.com/tiles/1.0.0/map/",
                { type: 'png', getURL: osm_getTileURL,
                  maxResolution: 156543.0339, projection: defaultProjection, numZoomLevels: 19
                }
        ); 
        me.linesLayer = new OpenLayers.Layer.WMS('SASA Linee', me.config.r3EndPoint + 'ogc/wms', {layers: 0, transparent: true,isBaseLayer:false}, {projection:defaultProjection,visibility: true, singleTile: true});
        //if(permalink) attiva le linee del permalink
        
        // if(permalink) map.zoomToExtent(extentDelPermalink);
        // else...
        
	me.routes = [];
        me.stopsLayer = me.getStopsLayer();
	me.wegeStartPointsLayer = me.getWegeStartPoints(); 
        me.positionLayer = me.getBusPositionLayer();
	me.artPoints = me.getArtPoints();
        me.bikeSharingLayer = me.getBikeSharingLayer();
        me.carSharingLayer = me.getCarSharingLayer();
	me.echargingLayer = me.getEchargingLayer();
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 20,
            externalGraphic: 'images/pin.png'
        });
        me.locationLayer = new OpenLayers.Layer.Vector('Geolocation layer', {
            styleMap: styleMap
        });
        me.map.addLayers([osm,topoMap]);

	var reqP = {
		zoom:parseInt(getParameterByName('zoom')),
		longitude:parseFloat(getParameterByName('longitude')),
		latitude:parseFloat(getParameterByName('latitude')),
		
	}
	var keys = Object.keys(preConfigMap);
	$.each(keys,function(index,value){
		if (getPresetFromUrl(value))
			reqP = preConfigMap[value];
	});
	var merano = new OpenLayers.Bounds(662500, 5169000, 667600, 5174000).transform(epsg25832,defaultProjection);				
        me.map.zoomToExtent(merano);
	if (reqP.longitude && reqP.latitude)
		me.map.setCenter(new OpenLayers.LonLat(reqP.longitude,reqP.latitude));	
	if (me.map.isValidZoomLevel(reqP.zoom))		
		me.map.zoomTo(reqP.zoom);
        me.showLines(['all']);
        
        setTimeout(function() {
            $('#zoomInButton').click(function(event) {
                event.preventDefault();

                me.map.zoomIn();
            });
            $('#zoomOutButton').click(function(event) {
                event.preventDefault();
                
                me.map.zoomOut();
            });
            $('#zoomToMyPosition').click(function(event) {
                event.preventDefault();
                
                me.zoomToCurrentPosition();
            });
            me.stopsLayer.setVisibility(true);
	    $('#switcheroo').click(function(event){
		if (me.map.baseLayer == osm){
			me.map.setBaseLayer(topoMap);
			$('#switcheroo').text('OSM');
		}
		else{
			me.map.setBaseLayer(osm);
			$('#switcheroo').text('EARTH');
		}
	    });

        }, 2500);
    },
    addRouteLayer : function(obj){
	var coordinates=obj.data.route.path.coordinates
	var me = this;
	var pointList = [];
	$.each(coordinates,function(index,value){
		var point = new OpenLayers.Geometry.Point(value.coordinate[0],value.coordinate[1]);
		pointList.push(point);
	});
	var styleMap = {
        	strokeColor: '#d35400',
                strokeWidth: 6,
        };
	var lineFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pointList),null,styleMap);
	var vectorLayer = new OpenLayers.Layer.Vector("routes");
	vectorLayer.addFeatures([lineFeature]);
	var zugang = me.map.getLayersByName("zugang");
	removeLayers(zugang);
	if (obj.displayName.de=='Spurenweg')
		vectorLayer.addFeatures([me.getSpurenEagles()]);
	else if (obj.displayName.de.indexOf('Spring 2015')>=0)
		vectorLayer.addFeatures([me.getArtAndNature()]);
	else if (obj.displayName.de.indexOf('Tappeiner')>=0)
		me.map.addLayer(me.getTappeinerZugang());
	var layers =me.map.getLayersByName("routes");
	removeLayers(layers);
	//me.wegeStartPointsLayer.setVisibility(false); //to remove all start Points on route selection
	me.map.addLayer(vectorLayer);
	me.routes = layers;
	me.map.zoomToExtent(vectorLayer.getDataExtent());
	function removeLayers(layers){
		if (layers.length>0)
			me.map.removeLayer(layers[0]);
	}
    },
    getArtPoints : function(){
	var styleMap = new OpenLayers.StyleMap({
            externalGraphic: 'images/Themenwege/parcours_bueste.svg',
            graphicWidth: 35,
            graphicYOffset:-35.75
        });
	
        var point = new OpenLayers.Geometry.Point(1242010.4917555, 5888330.0435492);
        var pointFeature = new OpenLayers.Feature.Vector(point, null, null);
        var vectorLayer = new OpenLayers.Layer.Vector("artLayer",{
                styleMap:styleMap
        });
        vectorLayer.addFeatures([pointFeature]);
	vectorLayer.events.on({
                "featureselected":function(e){
			$(".modal").hide();
                        $("#artModal").show();
                }
        });
	return vectorLayer;
    },
    getSpurenEagles : function(){
        var styleMap = {
            externalGraphic: 'images/Themenwege/parcours_adler.svg',
            graphicWidth: 35,
            graphicYOffset:-35.75
        };
        var a1 = new OpenLayers.Geometry.Point(1242547.1976388, 5888946.4435471);
        var a2 = new OpenLayers.Geometry.Point(1242807.5612664, 5888848.5086046);
        var a3 = new OpenLayers.Geometry.Point(1242830.2535091, 5888830.5936761);
        var a4 = new OpenLayers.Geometry.Point(1242940.1317373, 5888761.3226192);
        var a5 = new OpenLayers.Geometry.Point(1243299.6246359, 5888601.2825912);
        var a6 = new OpenLayers.Geometry.Point(1243254.2457289, 5888547.5322271);
        var adler = new OpenLayers.Geometry.MultiPoint([a1,a2,a3,a4,a5,a6]);
        var pointFeature = new OpenLayers.Feature.Vector(adler, null, styleMap);
        return pointFeature;
    },
    getTappeinerZugang : function(){
	var me = this;
	var zugangMap = new OpenLayers.StyleMap({
        	strokeColor: 'orange',
	        strokeWidth: 5,           
        });
        var route = new OpenLayers.Layer.Vector("zugang", {
	        strategies: [new OpenLayers.Strategy.Fixed()],
	        protocol: new OpenLayers.Protocol.HTTP({
	                url: "kml/tappzu.kml",
        	        format: new OpenLayers.Format.KML({
	        	        extractStyles: true, 
        	        	extractAttributes: true,
	                	maxDepth: 2
        	        })
                }),
                preFeatureInsert: function(feature) {
	                feature.geometry.transform(new OpenLayers.Projection("EPSG:4326"),defaultProjection);
                },
                styleMap: zugangMap                     
        });
	return route;
    },
    getArtAndNature : function(){
        var styleMap = {
            externalGraphic: 'images/Themenwege/parcours_kunst.svg',
            graphicWidth: 35,
            graphicYOffset:-35.75
        };
        var a4 = new OpenLayers.Geometry.Point(1242745.4729163,5888025.5994863);
        var a10 = new OpenLayers.Geometry.Point(1242530.8030306,5888901.4926254);
        var a11 = new OpenLayers.Geometry.Point(1242887.9016938,5888797.5916185);
        var a12 = new OpenLayers.Geometry.Point(1243162.2935862,5888651.4276554);
        var a9 = new OpenLayers.Geometry.Point(1243393.9933282,5888649.0389983);
        var a8 = new OpenLayers.Geometry.Point(1243370.1067568,5888601.2658556);
        var a7 = new OpenLayers.Geometry.Point(1243225.5930002,5888277.602814);
        var a6 = new OpenLayers.Geometry.Point(1242826.8587081307,5888218.633061022);
        var a5 = new OpenLayers.Geometry.Point(1242808.7723304,5888164.1416001);
        var a3 = new OpenLayers.Geometry.Point(1242740.6956021278,5888173.696228666);
        var a13 = new OpenLayers.Geometry.Point(1242629.6230453,5888385.092385);
        var aan = new OpenLayers.Geometry.MultiPoint([a3,a4,a5,a6,a7,a8,a9,a10,a11,a12]);
        var pointFeature = new OpenLayers.Feature.Vector(aan, null, styleMap);
        return pointFeature;
    },
    getRoutes : function(){
	var me =this;
	var theme,hike;
	function displayRoutesList(){
		var list = '';
		hike = $("#hike").hasClass("enabled");
		theme = $("#theme").hasClass("enabled");
		var sortedroutes = me.myroutes.sort(function(obj1, obj2) {
			var f = obj1.displayName[lang].toLowerCase();
			var s = obj2.displayName[lang].toLowerCase();
			return ((f < s) ? -1 : ((f > s) ? 1 : 0));;	
		}); 
		$.each(sortedroutes,function(index,value){
			if ((theme == false && value.type=="themenweg")||(hike==false && value.type=="wanderweg"))
				return true;
			list+='<a href="#" title=""  id="'+value.id+'"class="list-route"><li>';
			list+='<h4>'+value.displayName[lang]+'</h4>';
			list+='<div class="metadata clearfix">';
			list+='<div class="time">'+moment.duration(value.data,'seconds').humanize()+'</div>';
			list+='<div class="distance">'+(Math.round(value.distance)/1000).toString().replace('.',',')+' km </div>';
			list+='<div class="drop">'+Math.round(value.altitude)+' hm </div>';
			list+='<div class="kcal"> '+value.kcal+' kCal</div>';
			list+='</div>';
			list+='</li></a>';
		});
		$(".walk .routes-list").html(list);
		$(".walk").height($( window ).height()-$("#header").outerHeight());	
		$(".list-route").click(function(){
			var id = $(this).attr("id");
		 	me.getRouteProfile(id);
		});
	}
	function loadRoutes(url){
		$.ajax({
	            type: 'GET',
        	    crossDomain: true,
	            url: url,
        	    dataType: 'json',
	            success: function(response, status, xhr) {
			me.myroutes=response;
			displayRoutesList();	
			$(".main-config .toggler").click(function(evt){
				$(this).toggleClass("enabled");
				displayRoutesList();
			});
	            },
        	    error: function(xhr, status, error) {
                	console.log(error);
	            }
        	});	
	}
	var url = this.config.apiediEndPoint+"/get-routes";
	if (me.myroutes== undefined)
		loadRoutes(url);
	else
		displayRoutesList();
    },	
    getRouteProfile : function(route){
	var me = this;
	function drawRoutProfileAsArea(obj){
		  var visualization = new google.visualization.AreaChart(document.getElementById('highChart'));
	          visualization.draw(dataTable,options);	
	}
	function drawRouteProfile(obj){
	        var chart = new google.visualization.LineChart(document.getElementById('highChart'));
		var options = {
	          title: jsT[lang].altitudep,
        	  curveType: 'function',
	          legend: { position: 'bottom' },
		  width:'100%',
	          height: '100%',
		  backgroundColor:'none',
	          vAxis: {
		    gridlines: {
		        color: 'transparent'
    		    }
		  },
	          hAxis: {
		    ticks:'none',
		    gridlines: {
		        color: 'transparent'
    		    }
		  },
		  colors:['#ce5400']
			
        	};
		var dataArray =[['Distance',jsT[lang].altitude]];
		$.each(obj.data.route.altitude_profile,function(index,value){
			var valueArray = [];
			valueArray[0] = value.distance;
			valueArray[1] = value.altitude;
			dataArray.push(valueArray);
		});
			
		var data = google.visualization.arrayToDataTable(dataArray);
		chart.draw(data,options);	
	}
	function displayRouteMetaData(obj){
		$('.walk-route .title').html("<h3>"+obj.displayName[lang]+"</h3>");
		$('.walk-route .metadata .time').text(moment.duration(obj.data.route.time,'seconds').humanize());
		$('.walk-route .metadata .distance').text((Math.round(obj.data.route.distance)/1000).toString().replace('.',',') +' km');//obj.data.route.altitude_profile[obj.data.route.altitude_profile.length-1].distance
		$('.walk-route .metadata .drop').text(Math.round(obj.data.route.pos_altitude_difference) +' hm');
		$('.walk-route .metadata .kcal').text(obj.kcal+' kCal');
		$('.walk-route a.more').attr('href',obj.url);
		drawRouteProfile(obj);
		$('.modal').hide();
		$('.walk-route').show();
		google.setOnLoadCallback(drawRouteProfile(obj));
	};
	$.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.apiediEndPoint+"/get-route?route="+route,
            dataType: 'json',
            success: function(response, status, xhr) {
		displayRouteMetaData(response);
		me.addRouteLayer(response);
            },
            error: function(xhr, status, error) {
                console.log(error);
            }
        });	
    },
    getLines: function(success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('');
        if(this.lines) return success.call(scope, this.lines);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'lines?city='+this.config.city,
            //url: this.config.r3EndPoint + 'lines',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                me.lines = response;
                success.call(scope, me.lines);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getServerTime: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'time',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || !response.time) failure.call(scope, xhr, status, response);
                success.call(scope, response.time);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getAllLines: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling getAllLines');
        //if(this.lines) return success.call(scope, this.lines);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            //url: this.config.r3EndPoint + 'lines/all?city='+this.config.city,
            url: this.config.r3EndPoint + 'lines/all',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                //this.lines = response;
                success.call(scope, response);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getStops: function(success, failure, scope) {
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling getStops');
        if(this.stops) return success.call(scope, this.stops);
        
        $.ajax({
            type: 'GET',
            crossDomain: true,
            url: this.config.r3EndPoint + 'stops',
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response) failure.call(scope, xhr, status, response);
                this.stops = response;
                success.call(scope, this.stops);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    getStopsLayer: function() {
	var me =this;
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 6,
            strokeColor: '#000000',
            strokeWidth: 2,
            fillColor: '#FFFFFF'
        });
        var stopsLayer = new OpenLayers.Layer.Vector('stopsLayer', {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.Script({
                url: this.config.r3EndPoint + "stops",
                callbackKey: "jsonp"
            }),
	    preFeatureInsert: function(feature) {
                feature.geometry.transform(epsg25832,defaultProjection);
            },
            styleMap: styleMap,
            minScale:10000,
            visibility: false
        });
	stopsLayer.events.on({
                "featureselected":function(e){
                        me.showStopPopup(e.feature);
                }
        });
        return stopsLayer;
    },
    getWegeStartPoints: function(){
	var me=this;
        var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            externalGraphic: '${externalGraphic}',
            graphicWidth: 35,
	    graphicYOffset:-35.75,
	},{
	    context: {
            	externalGraphic:function(feature){
			var pin= 'images/4_Piedi/Pin.svg';
			if (feature.cluster){
				if (feature.cluster.length>5)
					pin = 'images/4_Piedi/Pin_5+.png';
				else
					pin = 'images/4_Piedi/Pin_'+feature.cluster.length+'.png';
			}
			return pin;
		}
	    }	
        }));
	var positionsLayer = new OpenLayers.Layer.Vector("wegeStartPointsLayer", {
            strategies: [new OpenLayers.Strategy.Fixed(),new OpenLayers.Strategy.Cluster({distance: 40,threshold: 3})],
            protocol: new OpenLayers.Protocol.Script({
                url: this.config.apiediEndPoint+"/startPoints"
            }),
            styleMap: styleMap,
        });
	positionsLayer.events.on({
		"featureselected":function(e){
			if (!e.feature.cluster){
				var id = e.feature.attributes['id'];
				me.getRouteProfile(id);
			}
		},
		"featureunselected":function(e){
			if (!e.feature.cluster){
				var id = e.feature.attributes['id'];
				me.getRouteProfile(id);
			}
		}
	});
	return positionsLayer;
    },
    getBikeSharingLayer: function(){
        var me=this;
        var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            externalGraphic: '${externalGraphic}',
            graphicWidth: 35,
            graphicYOffset:-35.75,
        },{
            context: {
                externalGraphic:function(feature){
                        var pin= 'images/5_Bike/marker.svg';
			var max = feature.attributes.max_available;
			var now = feature.attributes.value;
			var a = now/max;
			if (a == 0.)
                        	pin= 'images/5_Bike/marker_red.svg';
			else if (a < 0.6 && a > 0)
                        	pin= 'images/5_Bike/marker_orange.svg';
			else if (a>=0.6)
                        	pin= 'images/5_Bike/marker_green.svg';
                        return pin;
                }
            }
        }));
	var  params = {
                        request:'GetFeature',
                        typeName:'edi:Bikesharing',
                        outputFormat:'text/javascript',
                        format_options: 'callback: getJson'
        };

	var positionsLayer = new OpenLayers.Layer.Vector("bikeStationsLayer", {
	        styleMap: styleMap
        });
	positionsLayer.events.on({
	       	"featureselected":function(e){
			var station = e.feature.attributes.stationcode;
			me.getBikesharingDetails(station);
		}
	});
	$.ajax({
		url : me.config.geoserverEndPoint+'wfs?'+$.param(params),
		dataType : 'jsonp',
		crossDomain: true,
		jsonpCallback : 'getJson',
		success : function(data) {
			var features = new OpenLayers.Format.GeoJSON().read(data);
			positionsLayer.addFeatures(features);
		},
		error : function() {
			console.log('problems with data transfer');
		}		
	});
	return positionsLayer;
    },
    getCarSharingLayer: function(){
        var me=this;
        var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            externalGraphic: '${externalGraphic}',
            graphicWidth: 35,
            graphicYOffset:-35.75,
        },{
            context: {
                externalGraphic:function(feature){
                        var pin= 'images/6_Car_sharing/marker.svg';
			var max = feature.attributes.parking;
			var now = feature.attributes.value;
			var a = now/max;
			if (a == 0.)
                        	pin= 'images/6_Car_sharing/marker_red.svg';
			else if (a>0 && a <= 0.6)
                        	pin= 'images/6_Car_sharing/marker_orange.svg';
			else if (a>=0.6)
                        	pin= 'images/6_Car_sharing/marker_green.svg';
                        return pin;
                }
            }
        }));
	var  params = {
                        request:'GetFeature',
                        typeName:'edi:Carsharing',
                        outputFormat:'text/javascript',
                        format_options: 'callback: carJson'
        };

	var positionsLayer = new OpenLayers.Layer.Vector("carStationsLayer", {
	        styleMap: styleMap
        });
	positionsLayer.events.on({
	       	"featureselected":function(e){
			var station = e.feature.attributes.stationcode;
			me.getCarStationDetails(station);
		}
	});
	$.ajax({
		url : me.config.geoserverEndPoint+'wfs?'+$.param(params),
		dataType : 'jsonp',
		crossDomain: true,
		jsonpCallback : 'carJson',
		success : function(data) {
			var features = new OpenLayers.Format.GeoJSON().read(data);
			positionsLayer.addFeatures(features);
		},
		error : function() {
			console.log('problems with data transfer');
		}		
	});
	return positionsLayer;
    },
    getEchargingLayer: function(){
        var me=this;
        var styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({
            externalGraphic: '${externalGraphic}',
            graphicWidth: 35,
            graphicYOffset:-35.75,
        },{
            context: {
                externalGraphic:function(feature){
                        var pin= 'images/8_Echarging/marker.svg';
                        var max = feature.attributes.chargingpointscount;
                        var now = feature.attributes.value;
                        var a = now/max;
                        if (a == 0.)
                                pin= 'images/8_Echarging/marker_red.svg';
                        else if (a>0 && a <= 0.6)
                                pin= 'images/8_Echarging/marker_orange.svg';
                        else if (a>=0.6)
                                pin= 'images/8_Echarging/marker_green.svg';
                        return pin;
                }
            }
        }));
        var  params = {
                        request:'GetFeature',
                        typeName:'edi:Echarging',
                        outputFormat:'text/javascript',
                        format_options: 'callback: json'
        };

        var positionsLayer = new OpenLayers.Layer.Vector("echargingLayer", {
                styleMap: styleMap,
		//strategies: [new OpenLayers.Strategy.Fixed(),new OpenLayers.Strategy.Cluster({distance: 40,threshold: 3})],
        });
        positionsLayer.events.on({
                "featureselected":function(e){
                        var station = e.feature.attributes.stationcode;
			integreen.retrieveData(station,"EchargingFrontEnd/rest/",displayData);
                }
        });
	function displayData(details,state){
		$('.station .title').text(details.name.replace("CU_","")+" ("+details.provider+")");
		if (details.state != 'ACTIVE'){
			$(".content").html('<h3>This charging station is temporary out of order </h3>');	
			$('.modal').hide();
			$('.station').show();
			return;
		}
		var html = "";
		integreen.retrieveData(details.id,"EchargingFrontEnd/rest/plugs/",displayPlugs);
		function displayPlugs (plugDetails,plugState){
			var state = plugState['e-charging plugs availability status'];
			if (state == 1)	
				plugColor='#8faf30';
			else if(state == 2 || state == 3)
				plugColor = '#f28e1e';
			else
				plugColor = '#e81c24';
			html += "<div class='plug' style='width:" + 100/details.capacity + "%'>" 
			+'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 290 300" enable-background="new 0 0 200 200" xml:space="preserve">  <g style="fill:'+plugColor+';stroke:'+plugColor+'">'/*
			+'<image width="295" height="295" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="data:image/png;base64,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 " id="image10" x="-4" y="-9.9996414"></image>'*/
			+'<path  d="M 33.024244,273.39727 C 26.113063,271.54007 19.87336,267.89743 13.680433,262.10467 7.882453,256.68134 4.4285825,251.05123 1.8839959,242.87546 0.0919446,237.11759 0,231.97497 0,137.50036 0,43.025745 0.0919446,37.883128 1.8839959,32.125256 5.4002077,20.827645 12.600371,11.83442 23.014626,5.7324514 33.054932,-0.15041147 29.885833,3.5843335e-4 143.5,3.5843335e-4 c 113.61417,0 110.44507,-0.15076990335 120.48537,5.73209296665 10.41426,6.1019686 17.61442,15.0951936 21.13063,26.3928046 1.79206,5.757872 1.884,10.900489 1.884,105.375104 0,94.47461 -0.0919,99.61723 -1.884,105.3751 -3.51621,11.29761 -10.71637,20.29084 -21.13063,26.39281 -10.05429,5.89106 -6.79041,5.73814 -120.94547,5.66628 -88.727455,-0.0559 -105.368149,-0.28838 -110.015656,-1.53728 z m 227.186206,-5.65609 c 12.34022,-6.0993 20.84068,-17.06465 23.67496,-30.54004 1.5637,-7.4345 1.5637,-191.967065 0,-199.401561 -2.83438,-13.475843 -11.33484,-24.440957 -23.6755,-30.5400396 l -7.60618,-3.759181 -109.10373,0 -109.103726,0 -7.606185,3.759181 C 14.449433,13.358622 5.9489665,24.323736 3.1145872,37.799579 c -1.5637003,7.434496 -1.5637003,191.967061 0,199.401561 3.2777258,15.5837 14.0414208,27.68029 29.3723558,33.00961 4.662091,1.62063 12.542841,1.72677 112.565457,1.51612 l 107.5524,-0.22651 7.60565,-3.75918 z M 34.870172,263.44469 c -10.465523,-3.24323 -20.477773,-13.08656 -23.410267,-23.0153 -1.294679,-4.38348 -1.461274,-18.61867 -1.228818,-105 L 10.5,35.500358 l 2.296776,-4.66235 c 3.682906,-7.476132 9.598275,-13.41451 16.984837,-17.050902 l 6.676332,-3.286748 107.021025,0 107.02103,0 5.67515,2.660407 c 7.57163,3.549449 13.81317,9.488269 17.38918,16.545804 l 2.93567,5.793789 0,102.000002 0,102 -2.93567,5.79379 c -3.57601,7.05753 -9.81755,12.99635 -17.38918,16.5458 L 250.5,264.50036 145,264.68991 C 55.785583,264.8502 38.785313,264.65801 34.870172,263.44469 z m 221.933378,-4.88241 c 6.61167,-3.66275 11.6464,-9.159 15.06128,-16.44191 l 2.63517,-5.62001 0,-99 0,-99.000002 -2.63517,-5.620011 C 268.44995,25.597433 263.41522,20.101185 256.80355,16.438434 L 251.5,13.500358 l -108,0 -108,0 -5.303553,2.938076 C 23.584776,20.101185 18.550049,25.597433 15.135165,32.880347 L 12.5,38.500358 l 0,99.000002 0,99 2.601113,5.54563 c 4.351131,9.27671 10.82705,15.36039 19.78117,18.58304 2.900279,1.04384 24.737985,1.25934 110.117717,1.08669 l 106.5,-0.21536 5.30355,-2.93808 z M 130.65975,215.95273 C 96.89558,210.28572 71.047713,185.61141 64.374316,152.67685 63.192549,146.84458 62.877175,141.53644 63.238055,133.55213 64.720268,100.7588 86.652735,72.159177 118,62.143348 c 52.71062,-16.841679 106,21.042551 106,75.357012 0,29.12916 -15.19683,54.78242 -41.08997,69.36262 -14.63349,8.24 -35.59095,11.88587 -52.25028,9.08975 z m 28.73426,-3.46223 c 29.48429,-6.09015 53.38099,-29.15603 60.19035,-58.09772 2.09932,-8.92266 2.09932,-24.86218 0,-33.78484 C 216.19211,106.18992 206.29842,89.64946 195.67555,80.636707 178.86996,66.378369 161.17164,60.261224 139.55177,61.238413 110.34719,62.558419 85.341446,79.196208 72.866651,105.60794 c -5.097288,10.79201 -7.072655,19.69945 -7.072655,31.89242 0,12.19297 1.975367,21.10041 7.072655,31.89242 15.391484,32.58697 51.160609,50.40292 86.527359,43.09772 z M 124.5,206.99586 C 111.86016,203.59364 101.50577,197.54804 92,188.02015 82.583105,178.58133 78.0865,171.70089 74.392042,161.07748 67.614127,141.58759 69.809855,118.8563 80.179214,101.16576 84.964171,93.002428 98.1469,80.075897 106.31002,75.542801 c 8.49776,-4.71893 18.70688,-8.218768 26.56908,-9.108275 l 6.0323,-0.682477 0.2943,7.769053 c 0.30834,8.139705 1.64601,10.51761 5.15838,9.169788 C 145.69074,82.181803 146,80.544838 146,74.031743 l 0,-8.031385 4.18611,0 c 6.84515,0 16.70446,2.864339 26.81389,7.790003 7.94311,3.87016 10.893,6.028392 18,13.169363 9.41342,9.458414 13.91722,16.350816 17.59517,26.926756 6.79124,19.52821 4.60321,42.24388 -5.77438,59.94848 -1.82644,3.11597 -7.14579,9.50869 -11.82079,14.20603 -7.107,7.14098 -10.05689,9.29921 -18,13.16937 -10.10943,4.92566 -19.96874,7.79 -26.81389,7.79 l -4.18611,0 0,-8.56336 0,-8.56336 -3.25,0.31336 -3.25,0.31336 -0.29044,8.25 -0.29044,8.25 -3.70956,-0.0602 C 133.1693,208.9071 128.35,208.03215 124.5,206.99586 z m 42.8346,-4.47745 c 19.66963,-6.83937 35.87792,-23.17867 43.0523,-43.4003 2.81537,-7.93538 3.05646,-9.64712 3.04472,-21.61775 -0.0114,-11.61939 -0.30832,-13.84859 -2.79582,-20.9904 C 201.60934,90.594258 177.7341,71.176228 152,68.820722 l -3.5,-0.320364 -0.5,8 -0.5,8 -5,0 -5,0 -0.29448,-7.884023 -0.29447,-7.884024 -4.90082,0.580429 C 119.89139,70.748038 106.1866,77.487942 95.441428,87.296983 65.78915,114.36592 65.739042,160.22109 95.331783,187.63712 105.8241,197.35766 119.81708,204.24388 132.0121,205.6882 l 4.90268,0.58065 0.29261,-8.38425 0.29261,-8.38424 5,0 5,0 0.27095,7.5 c 0.14902,4.125 0.44854,8.00033 0.6656,8.61185 0.54198,1.52691 10.11747,-0.0407 18.89805,-3.0938 z m -63.5992,-55.05537 c -1.39552,-1.39553 -2.82683,-3.69084 -3.18068,-5.10069 -0.91402,-3.64175 1.09489,-8.90239 4.16873,-10.91645 3.29344,-2.15794 9.45318,-2.21505 12.65472,-0.11732 5.42579,3.55511 5.48815,13.56367 0.10649,17.08987 -3.87509,2.53906 -10.73121,2.06264 -13.74926,-0.95541 z m 10.58034,-0.62602 c 6.18327,-3.29323 6.42275,-10.36917 0.45537,-13.45502 -3.53786,-1.8295 -6.93522,-1.19524 -9.74343,1.81903 -2.83593,3.04401 -2.52677,6.45409 0.8954,9.87625 3.17139,3.1714 5.01599,3.55816 8.39266,1.75974 z m 53.60734,-0.75974 c -5.3322,-5.33219 -2.91824,-13.87979 4.49814,-15.92756 C 179.9186,128.0796 186,132.28864 186,139.54783 c 0,3.54577 -0.52467,4.71623 -3.07673,6.86364 -4.50062,3.78702 -11.02433,3.64168 -15.00019,-0.33419 z m 13.15384,-2 c 1.6077,-1.60769 2.92308,-3.6673 2.92308,-4.57692 0,-2.51107 -5.51324,-7.5 -8.28822,-7.5 -3.94755,0 -7.71178,3.62063 -7.71178,7.41759 0,6.98265 7.92863,9.80763 13.07692,4.65933 z" id="path2987" connector-curvature="0"></path></g></svg>'
			+"<h4 style='text-align:center;color:" + plugColor + "'>" + jsT[lang]['chargingStates'][state] + "</h4>"
			+"<p>"+plugDetails.plugType +"<br/>"
			+ plugDetails.minCurrent +" - "+plugDetails.maxCurrent+" A<br/>"
			+ plugDetails.maxPower +" W </p>"
			+"</div>"
			$('.station .content').html(html);
			$('.modal').hide();
			$('.station').show();
		}
	}
        $.ajax({
                url : me.config.geoserverEndPoint+'wfs?'+$.param(params),
                dataType : 'jsonp',
                crossDomain: true,
                jsonpCallback : 'json',
                success : function(data) {
                        var features = new OpenLayers.Format.GeoJSON().read(data);
                        positionsLayer.addFeatures(features);
                },
                error : function() {
                        console.log('problems with data transfer');
                }
        });
        return positionsLayer;
    },
    getBikesharingDetails: function(station){
	var me = this;	
	$.ajax({
                url : this.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-station-details',
	        dataType : 'json',
               	crossDomain: true,
	        success : function(data) {
			for (i in data){
				if (data[i].id == station){
					me.getCurrentBikesharingData(data[i]);
				}
			}
		}
        });
    },
    getCarStationDetails: function(station){
	var me = this;	
	$.ajax({
                url : this.config.integreenEndPoint+'/carsharingFrontEnd/rest/get-station-details',
	        dataType : 'json',
               	crossDomain: true,
	        success : function(data) {
			for (i in data){
				if (data[i].id == station){
					me.getCurrentCarsharingData(data[i]);
				}
			}
		}
        });
    },
    getCurrentCarsharingData: function(data){
	var me = this;
	var currentState = {	
	};
	var numbersByBrand={};
	var params ={station:data.id,name:'number available',seconds:600};
	$.ajax({
                url : me.config.integreenEndPoint+'carsharingFrontEnd/rest/get-records?'+$.param(params),
        	dataType : 'json',
       	      	crossDomain: true,
	        success : function(result) {
			currentState['number available'] = result[result.length-1].value;
			displayCurrentState();
		}
    	});
	$.ajax({
        	url : this.config.integreenEndPoint+'carsharingFrontEnd/rest/cars/get-station-details',
	        dataType : 'json',
               	crossDomain: true,
	        success : function(cardetails) {
			var cars =[];
			$.each(cardetails,function(index,value){
				if (value.carsharingstation==data.id){
					cars.push(value);
				}
			});
			getDataOfCars(cars)
		}
	});
	function getDataOfCars(cardetails){
		if (cardetails.length==0){
			$('.carsharingstation .car-categorys').empty();
			$('.carsharingstation .legend').empty();
			for (brand in numbersByBrand){
				var brandClass= brand.replace(/[^a-zA-Z0-9]/g,'_');
				$('.carsharingstation .car-categorys').append("<div class='"+brandClass+"'></div>");
				radialProgress($('.carsharingstation .car-categorys .'+brandClass)[0])
                                 .diameter(76)
                                 .value(numbersByBrand[brand].current)
                                 .maxValue(numbersByBrand[brand].total)
                                 .render();
                        	$('.carsharingstation .legend').append("<li class='"+brandClass+"'>"+brand+"</li>");
			}
			return;
		}
		var car = cardetails.pop();
		var params ={
			station:car.id,
			name:'vehicle availability',
			seconds:10000
		}
		$.ajax({
	                url : me.config.integreenEndPoint+'carsharingFrontEnd/rest/cars/get-records?'+$.param(params),
        	        dataType : 'json',
                	crossDomain: true,
	                success : function(records) {
				var record = records[records.length-1];
				if (numbersByBrand[car.brand]==undefined){
					numbersByBrand[car.brand]={total:0,current:0}
				}
				numbersByBrand[car.brand]['total']= numbersByBrand[car.brand]['total']+1;
				if (record!=undefined && record.value==0)
					numbersByBrand[car.brand]['current']=numbersByBrand[car.brand]['current']+1;
				getDataOfCars(cardetails);
			}
                	
	        });

	}
	function displayCurrentState(){
		$('.carsharingstation .title').text(data.name);	
		var catHtml;
		$.each(currentState,function(key,value){
			if (key=="number available"){
				radialProgress($(".carsharingstation .number-available")[0])
		                .label(jsT[lang]['freeCars'])
                		.diameter(180)
		                .value(currentState[key])
				.maxValue(data.availableVehicles)
		                .render();
			}
			else{
				var cat = key.replace(/\s/g,"_");
				radialProgress(document.getElementById(cat+'-container'))
                		.diameter(78)
		                .value(currentState[key])
				.maxValue(data.bikes[key])
		                .render();
				$('.bikesharingstation .legend').append("<li class='"+cat+"'>"+jsT[lang][cat]+"</li>");	
			}
		});
		$('.modal').hide();
               	$('.carsharingstation').show();
	}
    },
    getCurrentBikesharingData: function(data){
	var me = this;
	var currentState = {	
	};
	$.ajax({url:me.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-data-types?station='+data.id,success: function(datatypes){
		getData(datatypes);
	}});
	function getData(types){
		if (types.length==0){
			displayCurrentState();
			return;
		}
		var type = types.pop()[0];
		var params ={station:data.id,name:type,seconds:600};
		$.ajax({
	                url : me.config.integreenEndPoint+'/bikesharingFrontEnd/rest/get-records?'+$.param(params),
	        	dataType : 'json',
        	      	crossDomain: true,
		        success : function(result) {
				currentState[type] = result[result.length-1].value;
				getData(types);
			}
        	});
	}
	function displayCurrentState(){
		$('.bikesharingstation .title').text(data.name);	
		var catHtml;
		$('.bikesharingstation .legend').empty();
		$.each(currentState,function(key,value){
			if (key=="number available"){
				radialProgress(document.getElementById('totalAvailable'))
		                .label(jsT[lang]['freeBikes'])
                		.diameter(180)
		                .value(currentState[key])
				.maxValue(data.bikes[key])
		                .render();
			}
			else{
				var cat = key.replace(/\s/g,"_");
				radialProgress(document.getElementById(cat+'-container'))
                		.diameter(78)
		                .value(currentState[key])
				.maxValue(data.bikes[key])
		                .render();
				$('.bikesharingstation .legend').append("<li class='"+cat+"'>"+jsT[lang][cat]+"</li>");	
			}
		});
		$('.modal').hide();
               	$('.bikesharingstation').show();
	}
    },
    getBusPositionLayer: function() {
        var me = this;
        
        var styleMap = new OpenLayers.StyleMap({
            pointRadius: 12,
            externalGraphic: 'images/${hexcolor2}.png'
        });
        
        
        var positionsLayer = new OpenLayers.Layer.Vector("positionLayer", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.Script({
                url: this.config.r3EndPoint + "positions", //TODO: modificare il nome del callback, renderlo più breve
                callbackKey: "jsonp"
            }),
	    preFeatureInsert: function(feature) {
           	feature.geometry.transform(epsg25832,defaultProjection);
            },
            styleMap: styleMap
        });
	positionsLayer.events.on({
                "featureselected":function(e){
                        me.showBusPopup(e.feature);
                }
        });


        positionsLayer.events.register('loadend', positionsLayer, function(e) {
/* NON UTILIZZATO... ci serve?
            var interval = 500 * (14 - map.getZoom()) + 2000; // 11
            if (interval < 1000) { // 2000
                interval = 1000; // 2000
            }
            if (interval > 5000) {
                interval = 5000;
            }
            if (timeout) {
                window.clearTimeout(timeout);
            } */
            // set to 1 s
            var interval = 2500;
            
            if(me.updateBusTimeout) window.clearTimeout(me.updateBusTimeout);
            
            me.updateBusTimeout = window.setTimeout(function() {
                positionsLayer.refresh();
            }, interval);
        });
        return positionsLayer;
    },
    
    //es. SASABus.showLines(['211:1', '211:2', '211:3', '201:1']);
    showLines: function(lines) {
        var visibility = true;
        
        if(!lines || !lines.length) {
            lines = [0];
            visibility = false;
        }
        
        //il cambio visibility va fatto prima oppure dopo a seconda se il layer va acceso o spento
        //questo per evitare chiamate "finte" con layers=0
        if(!visibility) this.linesLayer.setVisibility(visibility);
        this.linesLayer.mergeNewParams({layers: lines});
        if(visibility) this.linesLayer.setVisibility(visibility);
        
        if(lines.length > 0 && lines[0] != 'all') {
            this.positionLayer.protocol.options.params = {lines:lines};
        } else {
            delete this.positionLayer.protocol.options.params;
        }
        if(this.updateBusTimeout) window.clearTimeout(this.updateBusTimeout);
        this.positionLayer.refresh();
        
        if(lines.length > 0 && lines[0] != 'all') {
            this.stopsLayer.protocol.options.params = {lines:lines};
        } else {
            delete this.stopsLayer.protocol.options.params;
        }
        this.stopsLayer.refresh();
    },
    
    showBusPopup: function(feature) {
        var me = this,
            x = feature.geometry.x,
            y = feature.geometry.y,
            lonLat = new OpenLayers.LonLat(x, y),
            pixel = me.map.getPixelFromLonLat(lonLat);
        if(!me.tpl.busRow) {
            var tr = $(me.config.busPopupSelector + ' table tbody tr');
            me.tpl.busRow = tr.clone().wrap('<div>').parent().html();
            tr.remove();
            me.tpl.busContent = $(me.config.busPopupSelector).html();
        }
        var url = me.config.r3EndPoint + feature.attributes.frt_fid + '/stops';
        
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response) {
                if(!response || typeof(response) != 'object' || !response.features || typeof(response.features.length) == 'undefined') {
                    return me.alert('System Error');
                }
                
                me.showTplPopup('bus', feature, response.features, pixel,'.bus-position');

            },
            error: function() {
                return me.alert('System Error');
            }
        });
        
        return false;
    },
    
    showStopPopup: function(feature) {
        var me = this,
            lonLat = new OpenLayers.LonLat(feature.geometry.x, feature.geometry.y),
            pixel = me.map.getPixelFromLonLat(lonLat);
        
        if(!me.tpl.stopRow) {
            var tr = $(me.config.stopPopupSelector + ' table tbody tr');
            me.tpl.stopRow = tr.clone().wrap('<div>').parent().html();
            tr.remove();
            me.tpl.stopContent = $(me.config.stopPopupSelector).html();
        }
        
        var url = me.config.r3EndPoint + feature.attributes.ort_nr + '.' + feature.attributes.onr_typ_nr + '/buses';
        
        $.ajax({
            type: 'GET',
            url: url,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response) {
                if(!response || typeof(response) != 'object' || typeof(response.length) == 'undefined') {
                    return me.alert('System Error');
                }
                return me.showTplPopup('stop', feature, response, pixel,'.stop-position');
            },
            error: function() {
                return me.alert('System Error');
            }
        });
        
        return false;
    },
    
    showTplPopup: function(type, selectedFeature, features, position, type_id) {
        var contentTpl = (type == 'bus') ? this.tpl.busContent : this.tpl.stopContent,
            rowTpl = (type == 'bus') ? this.tpl.busRow : this.tpl.stopRow,
            selector = (type == 'bus') ? this.config.busPopupSelector : this.config.stopPopupSelector,
            content = OpenLayers.String.format(contentTpl, selectedFeature.attributes),
            pixel;
        $(selector).empty().html(content);
       	$('#bus-pop-img').attr('src','images/'+selectedFeature.attributes.hexcolor2+'.png'); 
        if(features.length > 0) {                   
            var rows = [],
                len = (features.length > this.config.rowsLimit) ? this.config.rowsLimit : features.length,
                i, row, number;

            for(i = 0; i < len; i++) {
                row = features[i];
                if(row.geometry && row.properties) row = row.properties;
                number = (i + 1);
                row.odd = (number % 2 == 1) ? 'odd' : '';
                row.last = (number == (len)) ? 'last' : '';
                rows.push(OpenLayers.String.format(rowTpl, row));
            }
            
	    $('.modal').hide();
            $(selector + ' table tbody').append(rows.join());
            $(selector + ' table').show();
            $(selector + ' .noData').hide();
        } else {
            $(selector + ' table').hide();
            $(selector + ' .noData').show();                    
        }
        

        $(type_id).show();
        
    }, 
    
    alert: function(msg) {
        if(typeof(SASABusAlert) == 'function') {
            SASABusAlert.call(null, msg);
        } else {
            alert(msg);
        }
    },
    
    zoomToCurrentPosition: function() {
        if(!this.geolocate) {
            this.geolocate = new OpenLayers.Control.Geolocate({
                bind: true,
                watch: false,
                geolocationOptions: {
                    enableHighAccuracy: true,
                    maximumAge: 3000,
                    timeout: 50000
                }
            });
            this.geolocate.events.register('locationupdated', this, function(e) {
                this.locationLayer.removeAllFeatures();

                var lonLat = new OpenLayers.LonLat(e.point.x, e.point.y);
                if(!this.map.getExtent().containsLonLat(lonLat)) {
                    this.alert('Your position is outside this map');
                }
                
                var geometry = new OpenLayers.Geometry.Point(e.point.x, e.point.y);
                var feature = new OpenLayers.Feature.Vector(geometry);
                this.locationLayer.addFeatures([feature]);
                this.map.panTo(lonLat);
            });
            this.geolocate.events.register('locationfailed', this, function() {
                this.alert('Unable to get your position');
            });
            this.geolocate.events.register('locationuncapable', this, function() {
                this.alert('Geolocation is disabled');
            });
            this.map.addControl(this.geolocate);
        }
        this.geolocate.activate();
    },
    
    showGeoJSON: function(geojson) {
        if(!this.testLayer) {
            this.testLayer = new OpenLayers.Layer.Vector('TEST');
            this.map.addLayers([this.testLayer]);
        }
        
        var format = new OpenLayers.Format.GeoJSON();
        var features4326 = format.read(geojson);
        if(!features4326) return console.log('errore nel parsing...');
        var features = [];
        for(var i = 0; i < features4326.length; i++) {
            var geometry = features4326[i].geometry.transform(new OpenLayers.Projection('EPSG:4326'),defaultProjection);
            features.push(new OpenLayers.Feature.Vector(geometry, features4326[i].attributes));
        }
        this.testLayer.removeAllFeatures();
        this.testLayer.addFeatures(features);
        this.map.zoomToExtent(this.testLayer.getDataExtent());
    },
    
    geocode: function(params, success, failure, scope) {
        var me = this;
        scope = scope || null;
        failure = failure || function() {};
        if(!success) return console.log('success callback is mandatory when calling geocode');
        
        if(typeof(params) == 'string') {
            params = {
                source: 'both',
                query: params
            };
        } else {
            if(!params.source) params.source = 'both';
            else if(params.source != 'google' && params.source != 'stops') {
                return console.log('source param shall be google or stops, '+params.source+' given');
            }
        }
        if(this.lines) {
            var lines = [];
            for(var i = 0; i < this.lines.length; i++) {
                lines.push(this.lines[i].li_nr+':'+this.lines[i].str_li_var);
            }
            params.lines = lines.join(',');
        }
        $.ajax({
            type: 'GET',
            url: me.config.r3EndPoint + 'geocode',
            data: params,
            dataType: 'jsonp',
            crossDomain: true,
            jsonp: 'jsonp',
            success: function(response, status, xhr) {
                if(!response || typeof(response) != 'object') failure.call(scope, xhr, status, response);
                var results = [];
                for(var i = 0; i < response.length; i++) {
                    var row = response[i];
                    if(row.srid) {
                        var lonLat = new OpenLayers.LonLat(row.lon, row.lat);
                        lonLat.transform(new OpenLayers.Projection(row.srid), defaultProjection);
                        row.lon = lonLat.lon;
                        row.lat = lonLat.lat;
                    }
                    results.push(row);
                }
                success.call(scope, results);
            },
            error: function(xhr, status, error) {
                failure.call(scope, xhr, status, error);
            }
        });
    },
    
    showLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');
        
        this.map.setCenter(lonLat, 6);
        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.removeAllFeatures();
        this.locationLayer.addFeatures([feature]);
    },
    
    zoomToStop: function(ort_nr, onr_typ_nr) {
        var me = this,
            len = this.stopsLayer.features.length,
            i, feature, zoomFeature;
        
        for(i = 0; i < len; i++) {
            feature = me.stopsLayer.features[i];
            if(feature.attributes.ort_nr == ort_nr && feature.attributes.onr_typ_nr == onr_typ_nr ) {
                zoomFeature = feature;
                var lonLat = new OpenLayers.LonLat(zoomFeature.geometry.x, zoomFeature.geometry.y);
                me.map.moveTo(lonLat);
                
                me.showStopPopup(zoomFeature);
            }
        }
    },
    
    addLocation: function(lon, lat) {
        try {
            var lonLat = new OpenLayers.LonLat(lon, lat);
        } catch(e) {
            return console.log('invalid lon lat');
        }
        if(!lonLat.lon || !lonLat.lat) return console.log('invalid lon lat');
        
        var geometry = new OpenLayers.Geometry.Point(lon, lat);
        var feature = new OpenLayers.Feature.Vector(geometry);
        this.locationLayer.addFeatures([feature]);
    },
    
    removeAllLocations: function() {
        this.locationLayer.removeAllFeatures();
    }
};


if(typeof(console) == 'undefined') console = {log: function(){}, trace: function(){}, error: function(){}};
