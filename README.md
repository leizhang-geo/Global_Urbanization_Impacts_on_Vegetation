# Global Urbanization-induced Impacts on Vegetation Growth
This repository contains the code used for the analysis in the paper "Vegetation growth enhancement in global urban environments is jointly controlled by climatic and anthropogenic factors"

## Requirement
- Python3
- numpy
- pandas
- scipy
- scikit-learn
- pymannkendall
- seaborn
- matplotlib

## Description of files
- [**data_collection**](https://github.com/zlxy9892/Global_Urbanization_Impacts_on_Vegetation/tree/main/data_collection): The folder contains codes for collecting data sets from Google Earth Engine.
- [**generate_vi_ui_relationship**](https://github.com/zlxy9892/Global_Urbanization_Impacts_on_Vegetation/tree/main/generate_vi_ui_relationship): The folder contains codes for generating the relationship between vegetation index (VI) and urbanization intensity (![](http://latex.codecogs.com/gif.latex?\\beta)), and calculating the indirect impact ![](http://latex.codecogs.com/gif.latex?\\omega_i).
- [**driving_factors_analysis**](https://github.com/zlxy9892/Global_Urbanization_Impacts_on_Vegetation/tree/main/driving_factors_analysis): The folder contains codes for understanding the climatic and anthropogenic effects on the response of vegetation growth to urban environments.
- [**plot_maps**](https://github.com/zlxy9892/Global_Urbanization_Impacts_on_Vegetation/tree/main/plot_maps): The folder contains codes for plot the maps of spatial distributions of ![](http://latex.codecogs.com/gif.latex?\\omega_i) and other related factors in worldwide cities across climate zones.