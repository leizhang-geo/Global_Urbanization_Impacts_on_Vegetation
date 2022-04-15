// Get global urban boundary data from Earth Engine asset
var gub = ee.FeatureCollection("users/frank/GUB_Global_2018_final");
var min_areaSize = 100;
var urban_boundaries = gub.filter(ee.Filter.gt('area', min_areaSize));

// Calculate the urban size and set the value to the property of each feature
urban_boundaries = urban_boundaries.map(function (feature) {
  feature = ee.Feature(feature.geometry().simplify({'maxError': 100}));  // simplify polygons for speedup calculation
  return feature.set({'urban_size': ee.Number(feature.area().divide(1000*1000))});
});
print(urban_boundaries);

// Generate buffered urabn areas
var urban_boundaries_buffer = urban_boundaries.map(function(feature) {
  // Get the urban size from the property
  var urban_size = ee.Dictionary({value:feature.get('urban_size')})
  
  // Create the buffer with a same size of urban area
  var urban_bou_buffer = feature.geometry().buffer(
    ee.Number.expression('(sqrt(2)-1)*sqrt(value/Math.PI)*1000', urban_size)
    );
  //Coerce that geometry to a feature, copy the properties of the input feature
  return ee.Feature(urban_bou_buffer).copyProperties(feature);
});
print(urban_boundaries_buffer);

// Generate rural areas by subtracting buffered areas to the urabn core
var rural_boundaries = ee.Feature(urban_boundaries_buffer.geometry().difference(urban_boundaries.geometry()));

// Show the urban boundaries with their buffer areas (rural area) on the map
Map.addLayer(urban_boundaries, {'color': 'red', opacity: 0.1}, 'Urban boundaries');
Map.addLayer(rural_boundaries, {'color': 'blue', opacity: 0.1}, 'Rural boundaries');
// Map.addLayer(urban_boundaries_buffer, {'color': 'green', opacity: 0.1}, 'Urban boundaries with buffer');
Map.setCenter(8, 20, 3.5);

// Export urban boundaries with buffer to Earth Engine asset
Export.table.toAsset({
  collection: urban_boundaries_buffer,
  description:'urban_boundaries_buffer',
  assetId: 'urban_boundaries_buffer_IDxxx',
});
