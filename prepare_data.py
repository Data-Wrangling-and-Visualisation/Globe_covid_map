import pandas as pd
from datetime import timedelta

def prepare_data():
    # Загрузка данных о координатах стран
    geo_df = pd.read_csv(
        'raw_data/world_country_and_usa_states_latitude_and_longitude_values.csv.xls',
        usecols=['country_code', 'country', 'latitude', 'longitude']
    ).dropna(subset=['country_code'])

    # Загрузка данных COVID с датами
    covid_df = pd.read_csv('raw_data/WHO-COVID-19-global-daily-data.csv', parse_dates=['Date_reported'])

    # Определяем диапазон дат
    latest_date = covid_df['Date_reported'].max()
    start_date = covid_df['Date_reported'].min()
    
    # Фильтруем данные по странам и датам
    covid_df = covid_df[['Date_reported', 'Country_code', 'New_cases', 'Cumulative_cases']]
    covid_df = covid_df.rename(columns={'Country_code': 'country_code'})
    
    # Объединяем с координатами стран
    merged_df = covid_df.merge(geo_df, on='country_code', how='inner')
    
    # Группируем данные по странам и датам
    grouped = merged_df.groupby(['country_code', 'country', 'latitude', 'longitude', 'Date_reported'], as_index=False).sum()
    
    # Преобразуем в нужный формат
    country_dict = {}
    for _, row in grouped.iterrows():
        country = row['country_code']
        if country not in country_dict:
            country_dict[country] = {
                'country_code': row['country_code'],
                'country': row['country'],
                'latitude': row['latitude'],
                'longitude': row['longitude'],
                'data': []
            }
        country_dict[country]['data'].append({
            'date': row['Date_reported'].strftime('%Y-%m-%d'),
            'new_cases': int(row['New_cases']),
            'cumulative_cases': int(row['Cumulative_cases'])
        })
    
    # Сохранение в JSON
    final_data = list(country_dict.values())
    pd.DataFrame(final_data).to_json('data/processed_data_date.json', orient='records', indent=2)

if __name__ == '__main__':
    prepare_data()
