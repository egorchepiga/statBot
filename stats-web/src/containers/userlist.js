import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setChosen} from '../store/getStats/chosen/action'
import {createTopWordsForChat} from "../store/graphics/top/action";
import {createTopStickers} from "../store/graphics/stickers_top/action";
import {createTimeMessage} from "../store/graphics/time/action";
import {loadUserWords} from "../store/graphics/top/action";
import {findUser} from "../store/containers/userlist/action";
import {loadImages} from "../store/chat/action";

const TELEGRAM_ICON = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/1200px-Telegram_logo.svg.png';
class UserList extends Component {

    constructor(props) {
        super(props);
    }

    chooseUser = (event) => {
        this.props.chooseUser(event.target.id);
        let users = this.props.store.chat.users;
        let user, index;
        for(let i=0; i<users.length; i++) {
            if(users[i].user === event.target.id) {
                user = users[i];
                index = i;
                break;
            }
        }
        this.props.createTopWordsForUser(
            this.props.store.chat,
            index,
            this.props.store.token,
            this.props.store.chat.id,
            user.id,
            20,
            user.user
        );

        this.props.createTopStickersForUser(this.props.store.chat, event.target.id);

        this.props.createTimeMessageForUser(
            this.props.store.timeMessage.RAWTime,
            this.props.store.timeMessage.dayScale,
            this.props.store.timeMessage.imposition,
            this.props.store.timeMessage.fromTime,
            this.props.store.timeMessage.toTime,
            this.props.store.timeMessage.timeScale,
            this.props.store.timeMessage.average,
            this.props.store.timeMessage.periods,
            true,
            event.target.id,
            this.props.store.chat.time
        );

    };


    createUserProfile = (user, index) => (
        <div key={index} onClick={this.chooseUser} id={user.user} className="user-preview">
            <img  id={user.user} className="user-image"
                  src={user.img !== null  && user.img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + user.img : TELEGRAM_ICON}/>
            <label id={user.user} >{user.user + " #" + (index+1)}</label>
        </div>
    );

    userList = (usersStore) => {
        //let regExp = new RegExp('^[' + this.props.store.userList.find + ']*$');
        let users = usersStore.slice();
        let tmp = [];
        while (users.length > 0 && tmp.length < 7) {
            let user = users[0],
                index = 0;
            for (let i = 1; i < users.length; i++) {
                if (user.summary < users[i].summary) {
                    user = users[i];
                    index = i;
                }
            }
            if(users[index].user.indexOf(this.props.store.userList.find) !== -1)
                tmp.push(users[index]);
            users.splice(index, 1);
        }
        return tmp.map(this.createUserProfile)
    };

    findUser = (event) => {
        this.props.find(event.target.value);
    };


    render() {
        return (
            <div>
                <input onChange={this.findUser}></input>
                <div className="user-list">
                   {this.userList(this.props.store.chat.users)}
                </div>
            </div>
        )
    }

}



export default connect(
    state => ({
        store: state
    }), dispatch => ({
        chooseUser :  (chosen) => {
            dispatch(setChosen(chosen))
        },
        createTopWordsForUser: (data, index, token, chat_id, user_id, count, chosen) => {
            dispatch(loadUserWords({token, chat_id, user_id, count}))
                .then(res => {
                    data.users[index].top_words = res;
                    dispatch(createTopWordsForChat(data, false, chosen));
            })
        },
        createTopStickersForUser: (data, chosen) => {
            dispatch(createTopStickers(data, false, chosen));
        },
        createTimeMessageForUser: (time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAWTime) => {
            dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAWTime))
        },
        find: (string) => {
            dispatch(findUser(string));
        }
    })
)(UserList)