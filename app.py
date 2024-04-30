import yfinance as yf
from flask import request, render_template, jsonify, Flask

#Flask Back-end: Backend will be used for the communication with the yfinance API  

app = Flask(__name__, template_folder='templates')

#1st end point
@app.route('/')
def index():
    return render_template('index.html')

#2nd end point
@app.route('/get_stock_data', methods = ['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']
    data = yf.Ticker(ticker).history(period = '1y')
    return jsonify({'currentPrice': data.iloc[-1].Close,
                    'openPrice': data.iloc[-1].Open})

if __name__ == '__main__':
    app.run(debug=True)
