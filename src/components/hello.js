import React from "react";
import "./portofolio.css"

class Stock extends  React.Component{

    constructor(props)
    {
        super(props);
        this.state = {
            name: this.props.name,
            unit_value: this.props.unit_value,
            quantity: this.props.quantity,
            total_value: this.props.total_value,
            selected: false
        }
    }

    isSelected = () =>
    {
        var isSelected = this.state.selected;
        isSelected = !isSelected
        this.setState({selected: isSelected})
        this.props.selected(this.props.index)
    }

    remove = () =>
    {
        this.props.deleteStock(this.props.index)
    }

    render(){
        return (
         <tr>
           <td>{this.state.name}</td>
           <td>{this.state.unit_value}</td>
           <td>{this.state.quantity}</td>
           <td>{this.state.total_value}</td>
           <td><input type={'radio'} onChange={this.isSelected}/></td>
         </tr>
        )
    }

}

class Comment extends React.Component{

    constructor(props)
    {
        super(props);

        let sum = () =>{
            let stocksSum = 0.0
            let stocks = this.props.stocks
            console.log(stocks)
            for(let s in stocks)
            {
                stocksSum = stocksSum + stocks[s]['total_value']
            }

            return parseFloat(stocksSum).toFixed(2);
        }

        this.state = {
            editing: false,
            selected: [],
            stocks: this.props.stocks,

            total: sum()
        }

    }

    deleteStock = (i) => {

        console.log("Removing stock: "+i)
        var arr = this.state.stocks;
        arr.splice(i,1)
        this.setState({stocks: arr})

    }
    deleteStocks = () =>
    {
        let selectedItems = this.state.selected
        console.log("this items to remove")
        console.log(selectedItems)
        let stocks = this.state.stocks
        for (let a in selectedItems)
        {
            //stocks.splice(selectedItems[a]-a,1)
            this.deleteStock(selectedItems[a]-a)
            console.log("removed: "+selectedItems[a])
        }

        //this.setState({stocks: stocks})

        console.log("stocks after removal:")
        console.log(stocks)

        let sum = () =>{
            let stocksSum = 0.0
            let stocks = this.state.stocks
            for(let s in stocks)
            {
                stocksSum = stocksSum + stocks[s]['total_value']
            }

            return parseFloat(stocksSum).toFixed(2);
        }

        this.setState({total: sum()})

    }

    remove = () =>
    {
        //this.props.deleteComment(this.props.index)

    };

    selected = (i) => {

        let arr = this.state.selected
        if (arr.indexOf(i) == -1)
        {
            arr.push(i)
        }
        else
        {
            arr = arr.filter(item => item !== i)
        }

        this.setState({selected: arr})

        console.log(arr)
    }

    eachStock(text,i)
    {
        return (<Stock key={i} index={i}
                         name={text['name']} unit_value={text['unit_value']} quantity={text['quantity']}
                       total_value={text['total_value']} selected={this.selected} remove={this.deleteStock}
        ></Stock>)
    }
    renderNormal = () =>
    {
        const style = {

            border_bottom: '1px solid #ddd'

        };
        return (
            <div className={'portofolio'}>
                <div> {this.props.children}
                    <div className={'divider'}></div>
                    <label>Show in €</label>
                    <div className={'divider'}></div>
                    <label>Show in $</label>
                </div>
                <p/>

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
                <p>Total value of {this.props.children} is {this.state.total}</p>
                <button>Add Stock</button>
                <div className={'divider'}></div>
                <button>Perf graph</button>
                <div className={'divider'}></div>
                <button onClick={this.deleteStocks}>Remove selected</button>
            </div>
        )

    }

    renderForm = () =>
    {
        return (
            <div>
              <textarea ref="newText" defaultValue={this.props.children}/>
              <button onClick={this.save}>Save</button>
            </div>
        )
    }

  render(){

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
        this.state = {
            comments: [{name: 'portofolio1', stocks: [
                    {name: 'stock11', unit_value: 1.1, quantity: 1, total_value: 1.1},
                    {name: 'stock12', unit_value: 1.2, quantity: 1, total_value: 1.2},
                    {name: 'stock13', unit_value: 1.3, quantity: 1, total_value: 1.3}
                ]
            },
                {name: 'portofolio2', stocks: [
                        {name: 'stock21', unit_value: 1.1, quantity: 1, total_value: 1.1},
                        {name: 'stock22', unit_value: 1.2, quantity: 1, total_value: 1.2},
                        {name: 'stock23', unit_value: 1.3, quantity: 1, total_value: 1.3}
                    ]
                },
                {name: 'portofolio3', stocks: [
                        {name: 'stock31', unit_value: 1.1, quantity: 1, total_value: 1.1},
                        {name: 'stock32', unit_value: 1.2, quantity: 1, total_value: 1.2},
                        {name: 'stock33', unit_value: 1.3, quantity: 1, total_value: 1.3}
                    ]
                }

            ]
        }
    }
    add = (text) =>
    {
        var arr = this.state.comments;
        arr.push(text)
        this.setState({Comments: arr})

    }
    removeComment = (i) =>
    {
        console.log("Removing comment "+i)
        var arr = this.state.comments;
        arr.splice(i,1)
        this.setState({Comments: arr})
    }

    updateComment = (newText,i) =>
    {
        var arr = this.state.comments;
        arr[i] = newText
        this.setState({comments: arr})

    }


    eachComment(text,i)
    {
        //console.log(text['stocks'])
        return (<Comment key={i} index={i}
                         deleteComment={this.removeComment}
                         stocks={text['stocks']}
                         updateCommentText={this.updateComment}>{text['name']}</Comment>)
    }

    render ()
    {
        return (
            <div>
                <button onClick={this.add.bind(null,"Default")}>add</button>
                {
                    this.state.comments.map(this.eachComment,this)
                }
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
