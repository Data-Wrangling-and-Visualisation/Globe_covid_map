import os
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime

def download_data():
    url = "https://srhdpeuwpubsa.blob.core.windows.net/whdh/COVID/WHO-COVID-19-global-daily-data.csv"
    os.makedirs('raw_data', exist_ok=True)
    filename = f"raw_data/WHO-COVID-19-global-daily-data_{datetime.now().strftime('%Y%m%d')}.csv"
    
    response = requests.get(url)
    with open(filename, 'wb') as f:
        f.write(response.content)
    
    return filename

def scheduled_task():
    print("Starting scheduled data update...")
    try:
        # Скачивание новых данных
        download_data()
        # Обработка данных
        from prepare_data import prepare_data
        prepare_data()
        print("Data update completed successfully")
    except Exception as e:
        print(f"Error during data update: {str(e)}")

def init_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(scheduled_task, 'cron', day_of_week='mon', hour=3)  # Каждый понедельник в 3:00
    scheduler.start()