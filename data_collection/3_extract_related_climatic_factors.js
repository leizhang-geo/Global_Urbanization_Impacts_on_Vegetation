// Define the time period
var year = 2017;
var time_span = 1;
var time_1 = year-time_span + '-01-01';
var time_2 = year+time_span+1 + '-01-01';
print(time_1 + '   ' + time_2);

var global_urbans_buf = ee.FeatureCollection("users/frank/GUB_Global_2018_final_buf");
var global_urbans = ee.FeatureCollection("users/frank/GUB_Global_2018_final");
var global_rurals = ee.FeatureCollection("users/frank/GUB_Global_2018_final_rural");

// Air temperature
var dataset = ee.ImageCollection("ECMWF/ERA5/MONTHLY")
                .filter(ee.Filter.date(time_1, time_2));
var airT = dataset.select('mean_2m_air_temperature').mean().clip(global_urbans_buf);

var airT_urban_reduced = airT.reduceRegions({
  collection: global_urbans,
  reducer: ee.Reducer.mean(),
  scale: 1000
});
var airT_rural_reduced = airT.reduceRegions({
  collection: global_rurals,
  reducer: ee.Reducer.mean(),
  scale: 1000
});

var airT_vis = {
  min: 250.0,
  max: 300.0,
  palette: [
    "#000080","#0000D9","#4000FF","#8000FF","#0080FF","#00FFFF",
    "#00FF80","#80FF00","#DAFF00","#FFFF00","#FFF500","#FFDA00",
    "#FFB000","#FFA400","#FF4F00","#FF2500","#FF0A00","#FF00FF",
  ]
};

// Precipitaiton
var pre = dataset.select('total_precipitation').sum().divide(3).clip(global_urbans_buf);
var pre_urban_reduced = pre.reduceRegions({
  collection: global_urbans,
  reducer: ee.Reducer.mean(), 
  scale: 1000
});
var pre_rural_reduced = pre.reduceRegions({
  collection: global_rurals,
  reducer: ee.Reducer.mean(),
  scale: 1000
});

Map.setCenter(8, 20, 3.4);
Map.addLayer(airT, airT_vis, 'Air Temperature');
Map.addLayer(global_urbans, {'color': 'red', opacity: 0.1}, 'Urban');
Map.addLayer(global_rurals, {'color': 'blue', opacity: 0.1}, 'Rural');

// Export reduced data as tables to the google driver
var driver_folder = "data_factors";

var data_name = 'AirT';
Export.table.toDrive({
  collection: airT_urban_reduced,
  description: 'ToDrive__data_reduced_urban_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'urban_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: airT_rural_reduced,
  description: 'ToDrive__data_reduced_rural_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'rural_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});

var data_name = 'Pre';
Export.table.toDrive({
  collection: pre_urban_reduced,
  description: 'ToDrive__data_reduced_urban_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'urban_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});

Export.table.toDrive({
  collection: pre_rural_reduced,
  description: 'ToDrive__data_reduced_rural_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'rural_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});
