import React, {Component} from 'react';
import {connect} from 'react-redux';
import GraphicDoughnut from '../components/doughnut';
import Button from '../components/button';
import {createSummaryGraphic} from '../store/graphics/summary/action'
import SwitchButton from "../components/switchbutton"
import RadioButton from '../components/radiobutton';


const buttonLabels = [
    ' all time ',
    ' today ',
    ' week ',
    ' month '
];


class SummaryGraphic extends Component {


    createDayScaleRadio = (item, index) => {
        for(let key in item)
        return (
            <div className="col-3 col-sm-3 col-md-3 col-lg-3 col-xl-3 scale-radio">
            <RadioButton className={this.props.store.summaryGraphic.theme + "TimeRadio TimeRadio"}
                         key={index+key+"sum"}
                         data_id={index+key+"sum"}
                         label={item[key]}
                         onChange={this.setScale}
                         checked={this.props.store.summaryGraphic.dayScale === index.toString()}
            />
        </div>)
    }

    createDayScaleRadios = (radioLabels) => (
        <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12 row">
            {radioLabels.map(this.createDayScaleRadio)}
        </div>
    );

    setScale = (event) => {
        let chat = {
            ...this.props.store.chat,
            theme : this.props.store.summaryGraphic.theme
        };
        this.props.setDataFirstGraphic(
            chat,
            event.target.id[0],
            this.props.store.summaryGraphic.topSwitch
        )
    };

    changeTopSwitch = (event) => {
        let chat = {
                ...this.props.store.chat,
                theme : this.props.store.summaryGraphic.theme
        };

        this.props.setDataFirstGraphic(
            chat,
            this.props.store.summaryGraphic.dayScale,
            !this.props.store.summaryGraphic.topSwitch
        )
    };

    createButton = (label, index) => (
        <Button className="btn-fr btn-sm col-sm-12 col-md-2 col-lg-2 col-xl-2"
                key={index}
                id={index}
                label={label}
                onClick={this.setScale}
                active={this.props.store.summaryGraphic ? this.props.store.summaryGraphic.dayScale === index.toString() : false}
                theme={this.props.store.summaryGraphic.theme}
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
        <SwitchButton
            className="summary-switch"
            id="top-button"
            labelLeft={this.props.store.locale.summary.top}
            labelRight={this.props.store.locale.summary.all}
            isChecked={!this.props.store.summaryGraphic.topSwitch}
            action={this.changeTopSwitch}
            theme={this.props.store.summaryGraphic.theme}
        />
    );


    render() {
        let buttonsVisibility = this.props.store.chat && this.props.store.chat.chat;
        return (
            <div className="graphich__first graphich__wrapper col-sm-12 col-md-10 col-lg-10 col-xl-9">
                <div>
                    {buttonsVisibility && this.createHeader(this.props.store.locale.summary.header)}
                    {buttonsVisibility && !this.props.store.chosen && this.summarySwitcher()}
                    <GraphicDoughnut data={this.props.store.summaryGraphic.graphic.data}
                                     options={this.props.store.summaryGraphic.graphic.options}/>
                </div>
                <div className="wrapper container summary-radios">
                    <div className="row ">
                        {buttonsVisibility && this.createDayScaleRadios(this.props.store.locale.summary.checkBoxes)}
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