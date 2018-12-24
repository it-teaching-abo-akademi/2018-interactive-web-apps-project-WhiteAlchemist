import  React from "react"
import "./portfolio.css"

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
        console.log("you selected me!" + this.props.index + " " + isSelected)
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
                <td><input type={'checkbox'} onChange={this.isSelected}/></td>
            </tr>
        )
    }
}

export default Stock;