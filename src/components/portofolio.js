import  React from "react"

class Portofolio extends React.Component {
    render() {
        const style = {
            backgroundImage: `url('${this.props.flat.imageUrl}')`
        };
        const title = `${this.props.flat.price}€ - ${this.props.flat.name}`
        return (
            <div className="portofolio">
                <div className="flat-picture" style={style}></div>
                <div className="flat-title">{title}</div>
            </div>);
    }


    handleClick = () => {
        this.props.selectFlat(this.props.flat);
    }
}

export default Portofolio;
