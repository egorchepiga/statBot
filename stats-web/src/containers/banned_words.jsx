import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as types from '../store/containers/banned_words/actionType'
import {updateBannedWords} from "../store/containers/banned_words/action";

//Ломаеется при вводе двух * или \ подряд!!!!!!

class BanForm extends Component {

    createItem = (id, word) => (
        <li className="list-group-item list-group-item-primary list-group-item-action modal-wrapper-list__item"
            role="alert"
            key={id}>
            <div className="modal-list__item">
                <text>{word}</text>
            </div>
            <div className="btn-group">
                <button className="btn btn-success" onClick={this.edit} data-index={id}>edit</button>
                <button className="btn btn-danger"  onClick={this.deleteWord} data-index={id}>delete</button>
            </div>
        </li>
    );
    save = () => {
        let list = this.props.store.banForm.list,
            visibleList = this.props.store.banForm.visibleList,
            edit_index = this.props.store.banForm.edit,
            input = this.props.store.banForm.input;
        if (input.length==0) return;    
        if (edit_index>-1) {
            list[edit_index]=input
            visibleList[edit_index]=input
        } else {
            list[Object.keys(list).length++] = input;
            this._search(this.props.store.banForm.search);
        }
        this.props.saveList(list);
    }

    deleteWord = (event) => {
        let index = event.target.dataset.index;
        let list = this.props.store.banForm.list;
        let visibleList = this.props.store.banForm.visibleList;
        delete list[index];
        delete visibleList[index];
        this.props.saveList(list);
        this.props.setVisibleList(visibleList);
    }

    createWordsList = () =>{
        let arr = [],
        list = this.props.store.banForm.visibleList;
        for (let index in list)
            arr.push(this.createItem(index,list[index]));
        return arr;
    }

    input = (event) => {
        let text = event.target.value;
        this.props.setInput(text);
    }

    edit = (event) => {
        let index = event.target.dataset.index;
        this.props.setEdit(index);
    }
    search = (event) => {this._search(event.target.value)}
    _search = (text) =>{
        text = text.replace(/[\]\[.,\/\\|#!$%\^&\*;:{}=\-_\+``~()]/g,"");
        let list = this.props.store.banForm.list,
            arr={},
            reg = new RegExp(text);
        for (let index in list)
            list[index].match(reg) ? arr[index] = (list[index]): null;
        this.props.setSearch(text); 
        this.props.setVisibleList(arr);
    }

    open = () =>{
        //if (this.props.banForm.isOpen) updateBannedWords({token, chat_id, banned_words: this.props.store.banForm.list});
        this.props.open();
    }

    createUl = () =>(
        <ul className="list-group">
            {this.createWordsList()}
        </ul>
    )


    render() {
        return (
            <div>
                {this.props.store.banForm.isOpen ? <div class="modal-backdrop2 fade show" onClick={this.open}></div> : null}
                <div className="modal fade"
                     id="banModal"
                     tabindex="-9999"
                     role="dialog"
                     aria-labelledby="exampleModalLabel"
                     aria-hidden="true" onClick={this.open}>
                    <div className="modal-dialog modal-dialog-centered"
                         role="document"
                         onClick={this.open}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4>Список бан слов!</h4>
                                <input onChange={this.search}
                                value={this.props.store.banForm.search}/>
                            </div>
                            <div className="modal-body">
                                <div className="modal-wrapper-list">
                                    {Object.keys(this.props.store.banForm.visibleList).length>0 && this.createUl()}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="input-group">
                                    <input className="form-control"
                                           placeholder="Введите новое слово"
                                           onChange={this.input}
                                           value={this.props.store.banForm.input}/>
                                    <div className="btn-group">
                                        <button className="btn btn-primary"
                                                onClick={this.save}>{this.props.store.banForm.edit==-1 ? "Add word" : "Save word"}</button>
                                        <button className="btn btn-secondary" 
                                        data-dismiss="modal"
                                        onClick={this.close}>Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary"
                        type="button"
                        onClick={this.props.open}
                        data-toggle="modal"
                        data-target="#banModal"> BanForm </button>
            </div>
        )
    }
}


export default connect(state => ({
        store: state
    }), dispatch => ({
        open: () => {dispatch({type: types.OPEN})},
        saveList: (list) => {dispatch({type: types.SAVE_INPUT,payload: list})},
        setEdit: (index) => {dispatch({type: types.SET_EDIT, payload: index})},
        setInput: (text)=> {dispatch({type: types.SET_INPUT, payload: text})},
        setSearch: (text)=> {dispatch({type: types.SET_SEARCH, payload: text})},
        setVisibleList: (text)=> {dispatch({type: types.SET_VISIBLE_LIST, payload: text})},
    })
)(BanForm)