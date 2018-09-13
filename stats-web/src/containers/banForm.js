import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as types from '../store/chat/actionType'

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
        )
    save = () => {
        let list = this.props.store.chat.bannedWords.list;
        let edit_index = this.props.store.chat.bannedWords.edit;
        edit_index>-1 ? list[edit_index]=this.props.store.chat.bannedWords.input : list.push(this.props.store.chat.bannedWords.input) 

        this.props.save(list);}
    deleteWord = (event) => {
        let index = event.target.dataset.index;
        let list = this.props.store.chat.bannedWords.list;
        list.splice(index,1)
        this.props.save(list);}
    createWordsList = () =>{
        let arr = [];
        this.props.store.chat.bannedWords.list.forEach((index,item)=>{
            arr.push(this.createItem(item, index));
        });
        return arr;}
    input = (event) => {
        let text = event.target.value;
        this.props.input(text);}
    edit = (event) => {
        let index = event.target.dataset.index;
        this.props.edit(index);
    }    
    createUl = () =>(
        <ul className="list-group">
            {this.props.store.chat.bannedWords.list.length>0 && this.createWordsList()}
        </ul>
        )

    render() {
       return (
           <div>
                <div className="modal fade"
                    id="banModal"
                    tabindex="-9999" 
                    role="dialog" 
                    aria-labelledby="exampleModalLabel"
                    aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered"
                        role="document">
                        <div className="modal-content">
                          <div className="modal-header">
                            <h4>Список бан слов!</h4>
                          </div>
                          <div className="modal-body">
                            <div className="modal-wrapper-list">
                              {this.props.store.chat.bannedWords.list.length>0 && this.createUl()}
                            </div>
                          </div>
                          <div className="modal-footer">
                            <div className="input-group">
                              <input className="form-control"
                               placeholder="Введите новое слово"
                               onChange={this.input}
                               value={this.props.store.chat.bannedWords.input}/>
                              <div className="btn-group">
                                <button className="btn btn-primary"
                                    onClick={this.save}>{this.props.store.chat.bannedWords.edit==-1 ? "Add word" : "Save word"}</button>
                                <button className="btn btn-secondary" data-dismiss="modal">Close</button>
                              </div>
                            </div>
                          </div>
                        </div>  
                    </div>    
                </div>    
                <button className="btn btn-primary"
                    type="button"
                    data-toggle="modal"
                    data-target="#banModal"> BanForm </button> 
           </div>        
       )
    }
}


export default connect(state => ({
        store: state
    }), dispatch => ({
        save: (list) => {dispatch({type: types.SAVE_INPUT,payload: list})},
        edit: (index) => {dispatch({type: types.SET_EDIT, payload: index})},
        input: (text)=> {dispatch({type: types.SET_INPUT, payload: text})},
    })
)(BanForm)