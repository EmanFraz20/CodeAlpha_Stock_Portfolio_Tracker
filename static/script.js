//store tickers in local storage in the browser on client side(user's PC)
var tickers = JSON.parse(localStorage.getItem('tickers')) || [];
var lastPrices = {};
var counter = 7;

function startUpdateCycle(){
    updatePrices();
    setInterval(function(){
        counter--;
        $('#counter').text(counter);
        if(counter <= 0){
            updatePrices();
            counter = 7;
        }
    }, 1000)
}

$(document).ready(function(){ //when the page is loaded

    tickers.forEach(function(ticker) {
        addTickerToGrid(ticker);
    });

    updatePrices();

    //make sure that next time we load the page we get the current ticker
    $('#add-ticker-form').submit(function(e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();
        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers))
            addTickerToGrid(newTicker);
        }
        $('new-ticker').val('');
        updatePrices();
    });
    //removes the ticker 
    $('#tickers-grid').on('click', '.remove-btn', function() {
        var tickerToRemove = $(this).data('ticker');
        //get all the tickers except one that has to be removed
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers))
        $(`#${tickerToRemove}`).remove();
    });

    startUpdateCycle();
});

//add HTML elements to the grid
function addTickerToGrid(ticker){
    //append a new div box for every single ticker symbol
    $('#tickers-grid').append(`<div id="${ticker}" class="stock-box"><h2>${ticker}</h2><p id="${ticker}-price"></p><p id="${ticker}-pct"></p><button class="remove-btn" data-ticker="${ticker}">Remove</button></div>`)
}

//do all the logic and animation
function updatePrices() {
    //iterate over the ticker
    tickers.forEach(function(ticker) {
        //make a request to the backend/sends a POST request to the backend(flask application)
        $.ajax({
            url: '/get_stock_data',
            type: 'POST',
            data: JSON.stringify({'ticker': ticker}),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(data) { //response/result of the get_stock_data function/JSON object with currentPrice and openPrice
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100; //calculaate the percentage difference between the cuurentPrice and the openPrice
                var colorClass //determined by the percentage change, if large increase in the price➡strong green color, if rise in price is little bit➡weaker green, if neutral➡gray, if losses➡strong red
                if(changePercent <= -2) {
                    colorClass = 'dark-red'
                } else if(changePercent < 0) {
                    colorClass = 'red'
                }else if(changePercent == 0) {
                    colorClass = 'gray'
                }else if(changePercent <= 2) {
                    colorClass = 'green'
                }else {
                    colorClass = 'dark-green'
                }

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);
                $(`#${ticker}-price`).removeClass('dark-red red gray green dark-green').addClass(colorClass);
                $(`#${ticker}-pct`).removeClass('dark-red red gray green dark-green').addClass(colorClass);

                //every 15 sec when we update we want to see if the price has changed compared to the last refresh price 
                var flashClass; //animation class
                if(lastPrices[ticker] > data.currentPrice) {
                    flashClass = 'red-flash';
                }else if(lastPrices[ticker] < data.currentPrice){
                    flashClass = 'green-flash';
                }else{
                    flashClass = 'gray-flash';
                }
                lastPrices[ticker] = data.currentPrice;

                //animation
                $(`#${ticker}`).addClass(flashClass);
                setTimeout(function(){
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);
            }
            
        });

    });
}
