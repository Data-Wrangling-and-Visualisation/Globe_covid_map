from flask import Flask, render_template, send_from_directory
from scheduler import init_scheduler
import os
import json

app = Flask(__name__)
init_scheduler()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def get_data():
    # Находим самый свежий JSON файл
    data_files = sorted([f for f in os.listdir('data') if f.startswith('processed_data_')], reverse=True)
    if not data_files:
        return json.dumps({"error": "No data available"}), 404
    return send_from_directory('data', data_files[0])

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

@app.route('/force-update')
def force_update():
    try:
        from scheduler import download_data
        from prepare_data import prepare_data
        
        # Запускаем весь пайплайн
        print('Downloading data is starting...')
        download_data()
        print('Data downloaded. Preparing...')
        prepare_data()
        print('Update completed')
        
        return json.dumps({"status": "success", "message": "Data updated successfully"}), 200
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)}), 500
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)