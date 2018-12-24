import React from "react";
import "./portfolio.css"
import Portfolio from "./portfolio"
import axios from "axios";

class Board extends  React.Component{

    constructor(props) {

        super(props);

        let init = []
        if (localStorage.getItem('portfolios') == null)
            localStorage.setItem('portfolios', JSON.stringify([]))
        else
            init = JSON.parse(localStorage.getItem('portfolios'))

        this.state = {

            portfolios: init
        }
    }

    add = () =>
    {
        let name = this.refs.portfolio_name.value
        this.refs.portfolio_name.value = ""
        let portfolios = this.state.portfolios

        if(name == '')
        {
            alert("Name of Portfolio should not be empty!")
            return
        }

        var arr = this.state.portfolios;

        if(arr.length == 10)
        {
            alert("The maximum number of portfolios that can be created is 10!")
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
        return (<Portfolio key={text['name']} index={i}
                           deletePortfolio={this.removePortfolio}
                           stocks={text['stocks']}
        >{text['name']}</Portfolio>)
    }


    updateStorage = (name,stocks) =>
    {
        let storage = JSON.parse(localStorage.getItem('portfolios'))

        for (let a in storage)
        {
            if (storage[a]['name'] == name)
            {
                storage[a]['stocks'] = stocks
                break
            }
        }

        localStorage.setItem('portfolios', JSON.stringify(storage))
    }

    update = async () =>
    {
        let arr = JSON.parse(localStorage.getItem('portfolios'))

        for (let b in arr)
        {
            for (let c in b['stocks'])
            {
                let symbol = b['stocks'][c]['name']

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

                        b['stocks'][c]['unit_value'] = price

                    }).catch(error=>{//alert("Too many refreshes!")
                })

            }
            this.updateStorage(arr[b]['name'],b['stocks'])
        }

       // this.setState({selected: []})
    }


    render ()
    {
        if (localStorage.getItem('portfolios') != "[]")
            return (
                <div style={{padding: '2%'}}>
                    <div className={'head'}>
                        <div style={{overflowX: "auto"}}>
                        <table className={'table'}>
                            <tbody>
                            <tr>
                                <td>Portfolio Name:</td><td><input type={'text'} ref='portfolio_name'/></td>
                                <td><button onClick={this.add.bind(null)}>Add new portfolio</button></td>
                            </tr>
                            </tbody>
                        </table>
                        </div>
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
                                <td>Portfolio Name:</td><td><input type={'text'} ref='portfolio_name' className={'input-res'}/></td>
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

export default Board;