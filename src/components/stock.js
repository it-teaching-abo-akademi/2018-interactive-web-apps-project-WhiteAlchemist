import  React from "react"


class Stock extends React.Component {
    render() {
        const style = {

        };
        const title = `${this.props.flat.price}€ - ${this.props.flat.name}`
        return (
            <div className="stock" onClick={this.handleClick}>
                <div className="flat-picture" style={style}></div>
                <div className="flat-title">{title}</div>
            </div>);
    }

    handleClick = () => {
        this.props.selectFlat(this.props.stock);
    }
}

export default Stock;
