import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicDoughnut from '../components/doughnut';
import Button from '../components/button';
import {createSummaryGraphic} from '../store/graphics/summary/action'

const buttonLabels = [
    ' all time ',
    ' today ',
    ' week ',
    ' month '
];


class SummaryGraphic extends Component {

    setScale = (event) => {
        this.props.setDataFirstGraphic(
            this.props.store.chat,
            event.target.id,
            this.props.store.summaryGraphic.topSwitch
        )
    };

    changeTopSwitch = (event) => {
        this.props.setDataFirstGraphic(
            this.props.store.chat,
            this.props.store.summaryGraphic.dayScale,
            !this.props.store.summaryGraphic.topSwitch
        )
    };

    createButton = (label, index) => (
        <Button className="btn btn-outline-primary btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key={index}
                id={index}
                label={label}
                onClick={this.setScale}
                active={this.props.store.summaryGraphic ? this.props.store.summaryGraphic.dayScale === index.toString() : false}
        />
    );

    createButtons = (buttonLabels) => (
        buttonLabels.map(this.createButton)
    );

    createHeader = (label) => (
        <div className="header__most-active">
            <b>{label}</b>
        </div>
    );

    summarySwitcher = () => (
        <Button className="btn btn-outline-primary btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key="200"
                id={this.props.store.summaryGraphic.dayScale}
                label="top"
                onClick={this.changeTopSwitch}
                active={this.props.store.summaryGraphic.topSwitch}
        />
    );

    render() {
        let buttonsVisibility = this.props.store.chat && this.props.store.chat.chat;
        return (
            <div className="graphich__first graphich__wrapper col-sm-12 col-md-10 col-lg-9 col-xl-7">
                <div>
                    {buttonsVisibility && this.createHeader("Most Active")}
                    {buttonsVisibility && this.summarySwitcher()}
                    <GraphicDoughnut data={this.props.store.summaryGraphic.graphic.data}
                                     options={this.props.store.summaryGraphic.graphic.options}/>
                </div>
                <div className="wrapper flex-container btn btn__wrapper">
                    <div className="row btn__wrapper">
                        {buttonsVisibility && this.createButtons(buttonLabels)}
                    </div>
                </div>
            </div>
        )
    }
}

export default connect(state => ({
        store: state
    }), dispatch => ({
    setDataFirstGraphic: (data, dayScale, topSwitch) => {
        dispatch(createSummaryGraphic(data, dayScale, topSwitch))
    }
    })
)(SummaryGraphic)