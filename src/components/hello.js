import React from "react";
import "./portfolio.css"
import axios from 'axios'


class Stock extends  React.Component{

    constructor(props)
    {
        super(props);
        this.state = {
            name: this.props.name,
            unit_value: parseFloat(this.props.unit_value).toFixed(2),
            quantity: this.props.quantity,
            total_value: parseFloat(this.props.quantity)*parseFloat(this.props.unit_value),
            selected: false
        }
    }

    isSelected = () =>
    {
        var isSelected = this.state.selected;
        isSelected = !isSelected;
        this.setState({selected: isSelected});
        this.props.selected(this.props.index);
        console.log("you selected me!" + this.props.index)
    };

    remove = () =>
    {
        console.log("I am removing stock with index: "+this.props.index);
        this.props.deleteStock(this.props.index)

    };

    render()
    {
        return (
         <tr>
           <td>{this.state.name}</td>
           <td>{this.state.unit_value}</td>
           <td>{this.state.quantity}</td>
           <td>{this.state.total_value.toFixed(2)}</td>
           <td><input type={'radio'} onChange={this.isSelected}/></td>
         </tr>
        )
    }
    }


class Portfolio extends React.Component{

    constructor(props)
    {
        super(props);

        let sum = () =>{
            let stocksSum = 0.0;
            let stocks = this.props.stocks;
            console.log(stocks);
            for(let s in stocks)
            {
                stocksSum = stocksSum + stocks[s]['unit_value']*stocks[s]['quantity']
            }

            return parseFloat(stocksSum).toFixed(2);
        };

        this.state = {
            editing: false,
            selected: [],
            stocks: this.props.stocks,
            total: sum()
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
            return
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
                }).catch(error => {alert("Currency Exchange error!")})
        }
    }

    changeToUSD = () =>
    {
        if (this.refs.currency_symbol.innerHTML == '$')
        {
            this.refs.lbleuro.style.background = 'lightgrey'
            this.refs.lblusd.style.background = 'yellow'
            return
        }
        else
        {
            axios.get('https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=YWH47VG0N6XC0JBI').then(
                res => {
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
    }

    sum = () =>{
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
    };

    selected = (i) => {
        let arr = this.state.selected
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
                        this.state.stocks.map(this.eachStock,this)
                    }
                  </tbody>
              </table>
                <p/>
                <p>Total value of {this.props.children} is {this.state.total} <span ref='currency_symbol'>$</span></p>
                <button onClick={this.popup}>Add Stock</button>
                <div className={'divider'}></div>
                <button>Perf graph</button>
                <div className={'divider'}></div>
                <button onClick={this.deleteStocks}>Remove selected</button>

                <div ref="popup" className="modal">

                    <div className="modal-content">
                        <span ref={'close'} className="close" onClick={this.close}>&times;</span>
                        <h1>Add Stock</h1>
                        <table style={{border: '1px solid black'}}>
                            <tbody>
                            <tr style={{border: '1px solid black'}}>
                                <td>Stock's symbol</td>
                                <td> <input type="text" placeholder="Sock's symbol" ref='stock_symbol' required/></td>
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
      if(this.state.editing)
      {
        return this.renderForm()
      }
      else
        return this.renderNormal()
  }
}


class Board extends  React.Component{

    constructor(props) {

        super(props);

        let init = []
        if (localStorage.getItem('portfolios') == null)
            JSON.parse(localStorage.setItem('portfolios', JSON.stringify([])))
        else
            init = JSON.parse(localStorage.getItem('portfolios'))

        this.state = {

            portfolios: init
        }
    }

    add = () =>
    {
        let name = this.refs.portfolio_name.value
        let portfolios = this.state.portfolios
        if(name == '')
        {
            alert("Name of Portfolio should not be empty!")
            return
        }

        var arr = this.state.portfolios;

        if(arr.length == 10)
        {
            alert("The maximum number of portofolios that can be created is 10!")
            return
        }
        for (let i in arr)
        {
            if (arr[i]['name'] == name)
            {
                alert("There is already a portfolio with this name!")
                return
            }
        }


        var portfolio = {name: name, stocks: []};
        arr.push(portfolio);
        this.setState({portfolios: arr})
        localStorage.setItem('portfolios', JSON.stringify(arr))
    };

    removePortfolio = (i) =>
    {
        console.log("Removing portfolio "+i)
        var arr = this.state.portfolios;
        arr.splice(i,1)
        this.setState({portfolios: arr})
        localStorage.setItem('portfolios', JSON.stringify(arr))
    }


    eachPortfolio(text,i)
    {
        //console.log(text['stocks'])
        return (<Portfolio key={text['name']} index={i}
                         deletePortfolio={this.removePortfolio}
                         stocks={text['stocks']}
                         >{text['name']}</Portfolio>)
    }

    render ()
    {
        if (localStorage.getItem('portfolios') != null)
            return (
                <div style={{padding: '2%'}}>
                    <div className={'head'}>
                        <table className={'table'}>
                            <tbody>
                            <tr>
                                <td>Portfolio Name:</td><td><input type={'text'} ref='portfolio_name'/></td>
                                <td><button onClick={this.add.bind(null)}>Add new portfolio</button></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    {
                        this.state.portfolios.map(this.eachPortfolio,this)
                    }
                </div>
            )
        else
            return(
                <div style={{padding: '2%'}}>
                    <div className={'head'}>
                        <table className={'table'}>
                            <tbody>
                            <tr>
                                <td>Portfolio Name:</td><td><input type={'text'} ref='portfolio_name'/></td>
                                <td><button onClick={this.add.bind(null)}>Add new portfolio</button></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 style={{padding: '2%'}}>No portfolio is currently stored!</h2>
                </div>
                )
    }
}



class Hello extends React.Component {
  render() {
    return (
        <div>

            <Board/>

        </div>
              );
  }
}

export default Hello;
