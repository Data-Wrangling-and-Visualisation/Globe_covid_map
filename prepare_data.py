import pandas as pd
from datetime import datetime, timedelta

def prepare_data():
    # 1. Загрузка данных о координатах
    geo_df = pd.read_csv(
        'raw_data/world_country_and_usa_states_latitude_and_longitude_values.csv.xls',
        usecols=['country_code', 'country', 'latitude', 'longitude']
    ).dropna(subset=['country_code'])  # Фильтруем штаты США

    # 2. Загрузка данных COVID
    covid_df = pd.read_csv('raw_data/WHO-COVID-19-global-daily-data.csv', parse_dates=['Date_reported'])

    # 3. Фильтрация данных за последние 30 дней
    latest_date = covid_df['Date_reported'].max()
    start_date = latest_date - timedelta(days=30)
    recent_covid = covid_df[covid_df['Date_reported'] >= start_date]

    # 4. Агрегация данных по странам
    covid_aggregated = recent_covid.groupby('Country_code').agg({
        'New_cases': 'sum',
        'Cumulative_cases': 'last'
    }).reset_index()

    # 5. Объединение данных
    merged = pd.merge(
        geo_df,
        covid_aggregated,
        left_on='country_code',
        right_on='Country_code',
        how='inner'
    )

    # 6. Форматирование результата
    result = merged[['country_code', 'country', 'latitude', 'longitude', 'New_cases', 'Cumulative_cases']]
    result = result.rename(columns={
        'New_cases': 'new_cases',
        'Cumulative_cases': 'cumulative_cases'
    })

    # 7. Сохранение в JSON
    result.to_json('data/processed_data.json', orient='records', indent=2)

if __name__ == '__main__':
    prepare_data()