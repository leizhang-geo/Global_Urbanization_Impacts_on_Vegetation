// Define the time period
var year = 2017;
var time_span = 1;
var time_1 = year-time_span + '-01-01';
var time_2 = year+time_span+1 + '-01-01';
print(time_1 + '   ' + time_2);

var global_urbans_buf = ee.FeatureCollection("users/frank/GUB_Global_2018_final_buf");
var global_urbans = ee.FeatureCollection("users/frank/GUB_Global_2018_final");
var global_rurals = ee.FeatureCollection("users/frank/GUB_Global_2018_final_rural");

// Land surface temperature (LST; for calculating the urban heat island intensity)
var dataset = ee.ImageCollection('MODIS/006/MOD11A2')
                .filter(ee.Filter.date(time_1, time_2));
var lst = dataset.select('LST_Day_1km').mean().clip(global_urbans_buf);
var lst_urban_reduced = lst.reduceRegions({
  collection: global_urbans,
  reducer: ee.Reducer.mean(),
  scale: 1000
});
var lst_rural_reduced = lst.reduceRegions({
  collection: global_rurals,
  reducer: ee.Reducer.mean(),
  scale: 1000
});
var lst_vis = {
  min: 13000.0,
  max: 16500.0,
  palette: [
    '040274', '040281', '0502a3', '0502b8', '0502ce', '0502e6',
    '0602ff', '235cb1', '307ef3', '269db1', '30c8e2', '32d3ef',
    '3be285', '3ff38f', '86e26f', '3ae237', 'b5e22e', 'd6e21f',
    'fff705', 'ffd611', 'ffb613', 'ff8b13', 'ff6e08', 'ff500d',
    'ff0000', 'de0101', 'c21301', 'a71001', '911003'
  ],
};

// Population density (POP)
var year_pop = 2015;    // POP data years: 2000, 2005, 2010, 2015, 2020
var dataset = ee.ImageCollection("CIESIN/GPWv411/GPW_Population_Density")
                .filter(ee.Filter.date(year_pop-1 + '-01-01', year_pop+1 + '-01-01'));
var pop = dataset.first().select('population_density').clip(global_urbans_buf);
var pop_vis = {
  "max": 1000.0,
  "palette": ["ffffe7", "FFc869", "ffac1d", "e17735", "f2552c", "9f0c21"],
  "min": 200.0
};
var pop_urban_reduced = pop.reduceRegions({
  collection: global_urbans,
  reducer: ee.Reducer.mean(), 
  scale: 1000
});
var pop_rural_reduced = pop.reduceRegions({
  collection: global_rurals,
  reducer: ee.Reducer.mean(),
  scale: 1000
});

Map.setCenter(8, 20, 3.4);
Map.addLayer(lst, lst_vis, 'LST');
Map.addLayer(pop, pop_vis, 'POP');
Map.addLayer(global_urbans, {'color': 'red', opacity: 0.1}, 'Urban');
Map.addLayer(global_rurals, {'color': 'blue', opacity: 0.1}, 'Rural');

// Export reduced data as tables to the google driver
var driver_folder = "data_factors";

var data_name = 'LST';
Export.table.toDrive({
  collection: lst_urban_reduced,
  description: 'ToDrive__data_reduced_urban_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'urban_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: lst_rural_reduced,
  description: 'ToDrive__data_reduced_rural_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'rural_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});

data_name = 'POP';
Export.table.toDrive({
  collection: pop_urban_reduced,
  description: 'ToDrive__data_reduced_urban_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'urban_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});
Export.table.toDrive({
  collection: pop_rural_reduced,
  description: 'ToDrive__data_reduced_rural_' + data_name + '_' + year,
  folder: driver_folder,
  fileNamePrefix: 'rural_data_' + data_name + '_' + year,
  fileFormat: 'CSV'
});
