import numpy as np
import pandas as pd
from sklearn import preprocessing, metrics, linear_model, ensemble, feature_selection, model_selection, inspection


def load_data():
    df_agg_all = pd.read_csv('../data/df_agg_all_with_factors.csv')
    df_agg_all = df_agg_all[df_agg_all['r2_ndvi'] > 0.6].reset_index(drop=True)
    return df_agg_all


def RF_for_Wi(df_agg_all):
    """Fit the random forest model for predicting Wi by selected six covariates.
    """
    x_names = ['airT_urban', 'pre', 'lst_diff', 'urban_greeness', 'ui_mean', 'pop_density_log']
    cz_name_list = ['Global', 'Tropical', 'Temperate', 'Cold', 'Arid']
    y_name = 'wi_mean'
    rand_seed = 314
    for cz_name in cz_name_list:
        if cz_name == 'Global':
            df_agg_all_cz = df_agg_all.reset_index(drop=True).copy()
        else:
            df_agg_all_cz = df_agg_all[df_agg_all['cz_name_0'] == cz_name].reset_index(drop=True)
        x = np.array(df_agg_all_cz[x_names])
        y = np.array(df_agg_all_cz[y_name])
        np.random.seed(rand_seed)
        rf = ensemble.RandomForestRegressor(n_estimators=200, random_state=rand_seed)
        test_y = []
        test_y_pred = []
        shuffle_split = model_selection.ShuffleSplit(n_splits=5, test_size=0.25, random_state=314)
        r2_list = []
        for train_idx, test_idx in shuffle_split.split(x):
            X_train, X_test = x[train_idx], x[test_idx]
            Y_train, Y_test = y[train_idx], y[test_idx]
            rf.fit(X_train, Y_train)
            y_test_pred = rf.predict(X_test)
            r2 = metrics.r2_score(Y_test, y_test_pred)
            r2_list.append(r2)
            test_y.extend(list(Y_test))
            test_y_pred.extend(list(y_test_pred))
        print('R2_score = {:.3f}'.format(np.mean(r2_list)))


def RF_for_WiTrend(df_agg_all):
    """Fit the random forest model for predicting Wi trend by selected six covariates.
    """
    x_names = ['temp_trend_slope', 'pre_trend_slope', 'uhi_trend_slope', 'vi_mean_trend_slope_ndvi', 'ui_trend_slope', 'pop_trend_slope']
    cz_name_list = ['Global', 'Tropical', 'Temperate', 'Cold', 'Arid']
    y_name = 'wi_trend_slope'
    rand_seed = 314
    for cz_name in cz_name_list:
        if cz_name == 'Global':
            df_agg_all_cz = df_agg_all.reset_index(drop=True).copy()
        else:
            df_agg_all_cz = df_agg_all[df_agg_all['cz_name_0'] == cz_name].reset_index(drop=True)
        x = np.array(df_agg_all_cz[x_names])
        y = np.array(df_agg_all_cz[y_name])
        np.random.seed(rand_seed)
        rf = ensemble.RandomForestRegressor(n_estimators=200, random_state=rand_seed)
        test_y = []
        test_y_pred = []
        shuffle_split = model_selection.ShuffleSplit(n_splits=5, test_size=0.25, random_state=314)
        r2_list = []
        for train_idx, test_idx in shuffle_split.split(x):
            X_train, X_test = x[train_idx], x[test_idx]
            Y_train, Y_test = y[train_idx], y[test_idx]
            rf.fit(X_train, Y_train)
            y_test_pred = rf.predict(X_test)
            r2 = metrics.r2_score(Y_test, y_test_pred)
            r2_list.append(r2)
            test_y.extend(list(Y_test))
            test_y_pred.extend(list(y_test_pred))
        print('R2_score = {:.3f}'.format(np.mean(r2_list)))


def RF_variable_importance_for_Wi(df_agg_all):
    """Calculate the variable importance for predicting Wi by the random forest model.
    """
    x_names = ['airT_urban', 'pre', 'uhi', 'urban_greeness', 'ui_mean', 'pop_density_log']
    cz_name_list = ['Global', 'Tropical', 'Temperate', 'Cold', 'Arid']
    y_name = 'wi_mean'
    for cz_name in cz_name_list:
        if cz_name == 'Global':
            df_agg_all_cz = df_agg_all.copy()
        else:
            df_agg_all_cz = df_agg_all[df_agg_all['cz_name_0'] == cz_name].reset_index(drop=True)
        x = np.array(df_agg_all_cz[x_names])
        y = np.array(df_agg_all_cz[y_name])
        rand_seed = 314
        np.random.seed(rand_seed)
        rf = ensemble.RandomForestRegressor(n_estimators=200, random_state=rand_seed)
        importances = rf.feature_importances_
        rf.fit(x, y)
        print(x_names)
        print(importances)


def RF_variable_importance_for_WiTrend(df_agg_all):
    """Calculate the variable importance for predicting Wi trend by the random forest model.
    """
    x_names = ['temp_trend_slope', 'pre_trend_slope', 'uhi_trend_slope', 'ug_trend_slope', 'ui_trend_slope', 'pop_trend_slope']
    cz_name_list = ['Global', 'Tropical', 'Temperate', 'Cold', 'Arid']
    y_name = 'wi_mean'
    for cz_name in cz_name_list:
        if cz_name == 'Global':
            df_agg_all_cz = df_agg_all.copy()
        else:
            df_agg_all_cz = df_agg_all[df_agg_all['cz_name_0'] == cz_name].reset_index(drop=True)
        x = np.array(df_agg_all_cz[x_names])
        y = np.array(df_agg_all_cz[y_name])
        rand_seed = 314
        np.random.seed(rand_seed)
        rf = ensemble.RandomForestRegressor(n_estimators=200, random_state=rand_seed)
        importances = rf.feature_importances_
        rf.fit(x, y)
        print(x_names)
        print(importances)


def main():
    df_agg_all = load_data()
    RF_for_Wi(df_agg_all)
    RF_for_WiTrend(df_agg_all)
    RF_variable_importance_for_Wi(df_agg_all)
    RF_variable_importance_for_WiTrend(df_agg_all)


if __name__ == "__main__":
    main()
