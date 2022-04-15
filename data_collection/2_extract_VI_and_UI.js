// Define the time period of the data extraction (taking the year of 2017 (2016-2018) as an example)
var year = 2017;
var time_1 = year-1 + '-01-01';
var time_2 = year+2 + '-01-01';
print(time_1 + '   ' + time_2);

// Get the urban boundaries for clip the image data
var city_bous_all = ee.FeatureCollection("users/frank/GUB_Global_2018_final_buf");

var maskQA = function(image) {
  return image.updateMask(image.select("SummaryQA").lte(1).gt(-1));
};

var dataset = ee.ImageCollection('MODIS/006/MOD13A1')
                  .filter(ee.Filter.date(time_1, time_2))
                  .map(maskQA);
var evi_img = dataset.select('EVI').mean();
evi_img = evi_img.reproject('EPSG:4326', null, 500).clip(city_bous_all);
var evi_vis = {
  min: 1000.0,
  max: 9000.0,
  palette: [
    'FFFFFF', 'CE7E45', 'DF923D', 'F1B555', 'FCD163', '99B718', '74A901',
    '66A000', '529400', '3E8601', '207401', '056201', '004C00', '023B01',
    '012E01', '011D01', '011301'
  ],
};

var img_global_isa = ee.Image("Tsinghua/FROM-GLC/GAIA/v10").unmask(-1).clip(city_bous_all);
var isa_30m = img_global_isa.remap(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34],
    [0, 1, 1, 1, 1, 1, 1, 1, 1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],  // change 0/1 values in this vector to achieve the impervious surface area for the cooresponding year (current vector represents extracting data in 2017 (2016-2018)).
    0
  ).rename('UI');
var ui_img = isa_30m
  .reduceResolution({
    reducer: ee.Reducer.mean(),
    maxPixels: 1024
  })
  .reproject('EPSG:4326', null, 500);
var ui_vis = {
  min: 0.0,
  max: 1.0,
  palette: ["#000080","#0000D9","#4000FF","#8000FF","#0080FF","#00FFFF", "#00FF80","#80FF00","#DAFF00","#FFFF00","#FFF500","#FFDA00", "#FFB000","#FFA400","#FF4F00","#FF2500","#FF0A00","#FF00FF"]
};

Map.addLayer(city_bous_all, {'color': 'red', opacity: 0.1}, 'Urban boundaries');
Map.addLayer(ui_img, ui_vis, 'Urbanization intensity');
Map.addLayer(evi_img, evi_vis, 'EVI');
Map.setCenter(8, 20, 3.5);

// Merge the images of urban intensity (UI) and EVI to a ImageCollection
var img_merged = ee.Image.cat([ui_img, evi_img]);
img_merged = ee.ImageCollection(img_merged);
print(img_merged);

// A function for extracting the pixel data into the form of a table
function extract_sample_data(extract_data, band_names, region_geom, scale, export_fn) {
  var sample_data = extract_data.select(band_names).getRegion(region_geom, scale);
  var keys = ee.List(sample_data.get(0));
  var sample_data_collection = ee.FeatureCollection(sample_data.slice(1).map(function(singleData){
    singleData = ee.List(singleData);
    var dict = ee.Dictionary.fromLists(keys, singleData);
    var point = ee.Geometry.Point([dict.get('longitude'), dict.get('latitude')]);
    var result = ee.Feature(null, dict);
    return result;
  }));
  // print(sample_data_collection.limit(10));
  
  Export.table.toDrive({
    collection: sample_data_collection,
    description: "Table2Drive_" + export_fn,
    folder: driver_folder,
    fileNamePrefix: export_fn,
    fileFormat: "CSV"
  });
}

// Export dataframe (each table contains all pixel data in a city)
var driver_folder = "city_data_" + year;  // Define the folder name for exporting data
// var city_id_list = city_bous_all.aggregate_array('OBJECTID');  // all city ids
var city_id_list = ee.List.sequence(1, 3);  // Extract data of three cities as an example

city_id_list.getInfo().map(function(city_id) {
  // print(city_id);
  var city_bou = city_bous_all.filter(ee.Filter.eq('OBJECTID', city_id)).first();
  var export_fn = 'df_' + year + '_' + city_id;
  extract_sample_data(img_merged, ['UI', 'EVI'], city_bou.geometry(), 500, export_fn);
  
  // Export table (CSV file)
  var export_img_fn = 'EVI_city_' + year + '_' + city_id;
  Export.image.toDrive({
    image: evi_img,
    description: 'ImageToDrive__' + export_img_fn,
    folder: driver_folder,
    fileNamePrefix: export_img_fn,
    region: city_bou.geometry(),
    scale: 500,
    fileFormat: 'GeoTIFF'
  });
  
  // Export image (TIFF file)
  export_img_fn = 'UI_city_' + year + '_' + city_id;
  Export.image.toDrive({
    image: ui_img,
    description: 'ImageToDrive__' + export_img_fn,
    folder: driver_folder,
    fileNamePrefix: export_img_fn,
    region: city_bou.geometry(),
    scale: 500,
    fileFormat: 'GeoTIFF'
  });
  
  return 1;
});
