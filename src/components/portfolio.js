import  React from "react"
import axios from "axios";
import Stock from "./stock"
import "./portfolio.css"
import "../../node_modules/c3/c3.css";
import * as c3 from "c3";

class Portfolio extends React.Component{

    constructor(props)
    {
        super(props);

        let sum = () =>
        {
            let stocksSum = 0.0;
            let stocks = this.props.stocks;
            console.log(stocks);
            for(let s in stocks)
            {
                stocksSum = stocksSum + stocks[s]['unit_value']*stocks[s]['quantity']
            }

            return parseFloat(stocksSum).toFixed(2);
        }

        this.state =
            {
                editing: false,
                selected: [],
                stocks: this.props.stocks,
                total: sum(),
                history: []
            }
    }

    addStock = () =>
    {

        let symbol = this.refs.stock_symbol.value
        let stocks_number = this.refs.shares.value

        if(!Number.isInteger(parseFloat(stocks_number)))
        {
            alert("Number of shares should be an integer!")
            return
        }

        if(symbol == "")
        {
            alert("Stock symbol cannot be left empty!")
            return
        }

        axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+symbol+'&apikey=YWH47VG0N6XC0JBI').then(
            res => {

                if (res.data['Error Message'] != undefined )
                {
                    alert("Unknown stock symbol!")
                    return
                }

                if (res.data['Note'] != undefined )
                {
                    alert("There was a problem with API!")
                    return
                }

                let prices = res.data['Time Series (Daily)']

                let price = 0

                // Here we take the latest price of the stock
                for (let a in prices)
                {
                    price = prices[a]['4. close']
                    console.log(price)
                    break
                }

                var arr = this.state.stocks;

                let symbol_exists = false;

                for (let a in arr)
                {
                    if(arr[a]['name'] == symbol)
                    {
                        symbol_exists = true
                        arr[a]['quantity'] = parseInt(arr[a]['quantity']) + parseInt(stocks_number)
                    }
                }

                if (!symbol_exists && arr.length <= 50)
                {

                    let stock = {name: symbol, unit_value: price, quantity: stocks_number}
                    arr.push(stock)
                }
                else if(arr.length > 50)
                {
                    alert("You cannot add more than 50 symbols in one portfolio!")
                    return
                }

                this.setState({stocks: arr})

                this.refs.popup.style.display = "none";

                this.sum()

                this.updateStorage()

            }).catch(error=>{alert("Unknown stock symbol!")})
    }
    changeToEuro = () =>
    {
        if (this.refs.currency_symbol.innerHTML == '€')
        {
            this.refs.lbleuro.style.background = 'yellow'
            this.refs.lblusd.style.background = 'lightgrey'
        }
        else
        {
            axios.get('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=YWH47VG0N6XC0JBI').then(
                res => {
                    let rate = res.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
                    console.log(res.data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
                    var arr = this.state.stocks;
                    for(let a in arr)
                    {
                        arr[a]['unit_value'] = parseFloat(arr[a]['unit_value']*rate).toFixed(2)
                    }
                    this.refs.currency_symbol.innerHTML = '€'
                    this.setState({stocks: arr})
                    console.log(this.state.stocks)
                    this.sum()
                    this.refs.lbleuro.style.background = 'yellow'
                    this.refs.lblusd.style.background = 'lightgrey'

                    this.setState({selected: []})
                }).catch(error => {alert("Currency Exchange error!")})
        }

    }

    changeToUSD = () =>
    {
        if (this.refs.currency_symbol.innerHTML == '$')
        {
            this.refs.lbleuro.style.background = 'lightgrey'
            this.refs.lblusd.style.background = 'yellow'
        }
        else
        {
            axios.get('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=YWH47VG0N6XC0JBI').then(
                res =>
                {
                    let rate = res.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
                    console.log(res.data['Realtime Currency Exchange Rate']['5. Exchange Rate'])
                    var arr = this.state.stocks;
                    for(let a in arr)
                    {
                        arr[a]['unit_value'] = parseFloat(arr[a]['unit_value']*rate).toFixed(2)

                    }
                    this.refs.currency_symbol.innerHTML = '$'
                    this.setState({stocks: arr})
                    console.log(this.state.stocks)
                    this.sum()

                    this.refs.lbleuro.style.background = 'lightgrey'
                    this.refs.lblusd.style.background = 'yellow'

                    this.setState({selected: []})
                }).catch(error=>{alert("Currency Exchange error!")})
        }
    }

    deleteStock = (i) => {

        console.log("Removing stock: "+i);
        var arr = this.state.stocks;
        arr.splice(i,1);
        this.setState({stocks: arr})

    };

    updateStorage = () =>
    {
        let storage = JSON.parse(localStorage.getItem('portfolios'))

        for (let a in storage)
        {
            if (storage[a]['name'] == this.props.children)
            {
                storage[a]['stocks'] = this.state.stocks
                break
            }
        }

        localStorage.setItem('portfolios', JSON.stringify(storage))
    }

    update = async () =>
    {
        let arr = this.props.stocks

        var stocks = this.props.stocks

        this.setState({stocks: []})


        for (let b in arr)
        {
            let symbol = arr[b]['name']

            axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+symbol+'&apikey=YWH47VG0N6XC0JBI').then(
                res => {


                    if(res.data['Time Series (Daily)'] == undefined)
                        throw true

                    let prices = res.data['Time Series (Daily)']

                    let price = 0
                    // Here we take the latest price of the stock
                    for (let a in prices)
                    {
                        price = prices[a]['4. close']
                        console.log(price)
                        break
                    }

                    arr[b]['unit_value'] = price

                    this.sum()

                    this.setState({stocks: arr})

                    //await this.sleep(2000)

                    this.updateStorage()

                }).catch(error=>{//alert("Too many refreshes!")
                this.setState({stocks: stocks})

            })
        }


        this.refs.currency_symbol.innerHTML = '$'
        this.refs.lblusd.style.background = 'lightgrey'
        this.refs.lbleuro.style.background = 'lightgrey'
        this.setState({selected: []})



    }
    sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    deleteStocks = () =>
    {
        let selectedItems = this.state.selected.sort();
        console.log("this items to remove");
        console.log(selectedItems);
        let stocks = this.state.stocks;

        for (let a in selectedItems)
        {
            //stocks.splice(selectedItems[a]-a,1)
            this.deleteStock(selectedItems[a]-a);
            console.log("removed: "+selectedItems[a])
        }

        this.updateStorage()
        this.setState({selected: []})

        this.sum()

    }

    close = () =>
    {
        this.refs.popup.style.display = "none";
        this.refs.graph.style.display = "none";
        this.refs.chart.innerHTML = ""
    }


    sum = () =>
    {
        let stocksSum = 0.0
        let stocks = this.state.stocks
        for(let s in stocks)
        {
            stocksSum = stocksSum + stocks[s]['unit_value']*stocks[s]['quantity']
        }
        this.setState({total: parseFloat(stocksSum).toFixed(2)});
        console.log('total is: ' +this.state.total)
    }

    remove = () =>
    {
        this.props.deletePortfolio(this.props.index)
    }

    selected = (i) =>
    {
        let arr = this.state.selected

        if (arr.indexOf(i) != -1)
            arr.splice(arr.indexOf(i))
        else
        arr.push(i)

        this.setState({selected: arr})
        console.log('Items selected'+arr)
    }

    eachStock(text,i)
    {
        return (
            <Stock key={text['name']+text['unit_value']+text['quantity']} index={i}
                   name={text['name']} unit_value={text['unit_value']} quantity={text['quantity']}
                   selected={this.selected} remove={this.deleteStock}>
            </Stock>
        )
    }

    popup = () =>
    {
        this.refs.popup.style.display = "block";
    }

    openGraph = () =>
    {
        this.refs.graph.style.display = "block";

    }

    drawGraph = async () =>
    {
        let selected = this.state.selected
        let stocks = this.state.stocks

        let startDate = this.refs.start.value
        let endDate = this.refs.end.value


        if(startDate == "" || endDate == "")
        {
            alert("Select start and end dates!")
            return
        }

        let names = []
        for (let i in selected)
            names[i] = stocks[selected[i]]['name']


        let dates = []
        let values = []
        let data = {}

        if(names.length == 0)
            alert("No stocks were selected!")


        for( let i in names)
        {
            axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol='+names[i]+'&apikey=YWH47VG0N6XC0JBI').then(
                res => {

                    if (res.data['Time Series (Daily)'] == undefined)
                        throw true
                    let prices = res.data['Time Series (Daily)']

                    let price = 0

                    data[names[i].toString()] = i.toString()

                    let arrDates = []
                    let arrValues = []

                    arrDates.push(i.toString())
                    arrValues.push(names[i].toString())

                    for (let a in prices)
                    {
                        if(new Date(a) >= new Date(startDate) && new Date(a) <= new Date(endDate))
                        {
                            arrDates.push(a)
                            arrValues.push(prices[a]["4. close"])
                        }
                    }

                    dates.push(arrDates)
                    values.push(arrValues)

                    this.renderChart(dates,values,data,startDate,endDate)
                }).catch(error=>{alert("Too many requests!")})
        }
    }

    renderChart(dates,values,data,less,greater){
        let cols = []

        console.log("check dates ",dates)

        for (let a in dates)
        {
            cols.push(dates[a])
        }

        for (let a in values)
        {
            cols.push(values[a])
        }

        console.log("This is json: "+JSON.stringify(data))
        console.log("This is cols: "+JSON.stringify(cols))

        var chart = c3.generate({
            bindto: this.refs.chart,
            data: {
                xs: data,
                columns: cols
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                }
            }
        });
    }

    renderNormal = () =>
    {
        const style = {
            border_bottom: '1px solid #ddd'
        };

        return (
            <div className={'portfolio'}>

                <a  onClick={this.remove} className="close-thik"></a>
                <p/><p/><br/>

                <div> {this.props.children}
                    <div className={'divider'}></div>
                    <label onClick={this.changeToEuro} ref="lbleuro">Show in €</label>
                    <div className={'divider'}></div>
                    <label onClick={this.changeToUSD} ref='lblusd'>Show in $</label>
                </div>
                <p/>
                <br/>
                <div style={{overflowX: 'auto'}}>
                <table style={{border: '1px solid black'}}>
                    <tbody>
                    <tr style={{border: '1px solid black'}}>
                        <th>Name</th>
                        <th>Unit value</th>
                        <th>Quantity</th>
                        <th>Total value</th>
                        <th>Select</th>
                    </tr>
                    {
                        this.state.stocks.map(this.eachStock, this)
                    }
                    </tbody>
                </table>
                </div>
                <p/>
                <p>Total value of {this.props.children} is {this.state.total} <span ref='currency_symbol'>$</span></p>
                <button onClick={this.popup}>Add Stock</button>
                <div className={'divider'}></div>
                <button onClick={this.openGraph}>Perf graph</button>
                <div className={'divider'}></div>
                <button onClick={this.deleteStocks}>Remove selected</button>
                <div className={'divider'}></div>
                <button onClick={this.update}>Update Portfolio</button>

                <div ref='graph' className={'modal'}>
                    <div className="modal-content">
                        <span ref={'close'} className="close" onClick={this.close}>&times;</span>
                        <h1>Stocks' value history</h1>
                        <div id='chart' ref={'chart'}></div>
                        <h6>Select dates</h6>
                        <a>Start date:</a>
                        <input type="date" ref="start"/>
                        <div className={'divider'}/>
                        <a>End date:</a>
                        <input type="date" ref="end"/>
                        <div className={'divider'}/>
                        <button onClick={this.drawGraph}>Draw graph</button>
                    </div>
                </div>

                <div ref="popup" className="modal">
                    <div className="modal-content">
                        <span ref={'close'} className="close" onClick={this.close}>&times;</span>
                        <h1>Add Stock</h1>
                        <table style={{border: '1px solid black'}}>
                            <tbody>
                            <tr style={{border: '1px solid black'}}>
                                <td>Stock's symbol</td>
                                <td> <input type="text" placeholder="Stock's symbol" ref='stock_symbol' required/></td>
                            </tr>
                            <tr style={{border: '1px solid black'}}>
                                <td>Number of shares</td>
                                <td><input type="number" ref='shares' required/></td>
                            </tr>
                            <tr style={{border: '1px solid black'}}>
                                <td><button type="button" className="btn" onClick={this.addStock}>Add Stock</button></td>
                                <td></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    };

    render()
    {
            return this.renderNormal()
    }
}

export default Portfolio;