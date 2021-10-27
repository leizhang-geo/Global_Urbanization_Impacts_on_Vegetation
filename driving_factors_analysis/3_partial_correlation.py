import numpy as np
import pandas as pd
import pingouin as pg


def load_data():
    df_agg_all = pd.read_csv('../data/df_agg_all_with_factors.csv')
    df_agg_all = df_agg_all[df_agg_all['r2_ndvi'] > 0.6].reset_index(drop=True)
    return df_agg_all


def bootstrap_partial_corr(df, x_names, x_name, y_name, try_times=1000, rand_seed=314):
    """Calculate partial correlation between the target variable and a certain covariate repeatedly by using bootstrap sampling.
    """
    np.random.seed(rand_seed)
    r_list = []
    p_list = []
    covar = [name for name in x_names if name != x_name]
    for i in range(try_times):
        rand_idx_list = np.random.choice(len(df), len(df), replace=True)
        df_rand = df.iloc[rand_idx_list].reset_index(drop=True)
        res = pg.partial_corr(data=df_rand, x=x_name, y=y_name, covar=covar, method='pearson').round(6)
        r_value = res['r'][0]
        p_value = res['p-val'][0]
        r_list.append(r_value)
        p_list.append(p_value)
    return r_list, p_list


def partial_corr(df_agg_all):
    """bootstrap partial correlation analysis
    """
    y_name = 'wi_mean_ndvi'
    try_times = 500
    rand_seed = 314
    cz_name_list = ['Global', 'Tropical', 'Temperate', 'Cold', 'Arid']
    x_names = ['airT_urban', 'pre', 'lst_diff', 'ndvi_mean', 'ui_mean', 'pop_density_log']
    res_cz_name_list = []
    res_x_list = []
    res_y_list = []
    res_r_list = []
    res_p_list = []
    df_pcorr_res = pd.DataFrame()
    for cz_name in cz_name_list:
        for x_name in ['airT_urban', 'pre', 'lst_diff', 'ndvi_mean', 'ui_mean', 'pop_density_log']:
            covar = [name for name in x_names if name != x_name]
            if cz_name == 'Global':
                df_agg_all_sub = df_agg_all.copy()
            else:
                df_agg_all_sub = df_agg_all[df_agg_all['cz_name_0'] == cz_name].reset_index(drop=True)
            r_list, p_list = bootstrap_partial_corr(df=df_agg_all_sub, x_names=x_names, x_name=x_name, y_name=y_name, try_times=try_times, rand_seed=rand_seed)
            print('Region: {}  Variable: {}  R = {:.3f}   p = {:.5f}'.format(cz_name, x_name, np.mean(r_list), np.mean(p_list)))
            res_y_list.extend([y_name] * try_times)
            res_x_list.extend([x_name] * try_times)
            res_cz_name_list.extend([cz_name] * try_times)
            res_r_list.extend(r_list)
            res_p_list.extend(p_list)
    df_pcorr_res['y'] = res_y_list
    df_pcorr_res['x'] = res_x_list
    df_pcorr_res['cz'] = res_cz_name_list
    df_pcorr_res['r'] = res_r_list
    df_pcorr_res['p'] = res_p_list


def main():
    df_agg_all = load_data()
    partial_corr(df_agg_all)


if __name__ == "__main__":
    main()
