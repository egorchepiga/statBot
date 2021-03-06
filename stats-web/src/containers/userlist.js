import React, {Component} from 'react';
import {connect} from 'react-redux';
import {setChosen} from '../store/getStats/chosen/action'
import {createTopWordsForChat} from "../store/graphics/top/action";
import {createTopStickers} from "../store/graphics/stickers_top/action";
import {createTimeMessage} from "../store/graphics/time/action";
import {loadUserWords} from "../store/graphics/top/action";
import {findUser, showAll} from "../store/containers/userlist/action";
import Button from '../components/button';

const TELEGRAM_ICON = 'https://egorchepiga.ru/stats/tg.gif';
class UserList extends Component {

    constructor(props) {
        super(props);
    }

    showALlUsers = () => {
      this.props.showALlUsers();
    };

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
            this.props.store.token.token,
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
            this.props.store.chat.time,
            this.props.store.chat.theme
        );

    };

/*
<div key={index} onClick={this.chooseUser} id={user.user} className="user-block col-4 col-sm-3 col-md-2 col-lg-2 col-xl-2 ">
    <div id={user.user} className={"user__img" + chosen +  this.props.store.chat.theme+"Img" }>
        <img  id={user.user} src={user.img !== null  && user.img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + user.img : TELEGRAM_ICON}/>
    </div>
    <div id={user.user} className="user__name">
        <label id={user.user}>{user.user}</label>
        <label id={user.user}>{user.summary}</label>
    </div>
</div>
*/


    createUserProfile = (user, index) => {
        let chosen = user.user === this.props.store.chosen ? ' chosenUser ' : "";
        return(
            <div className={"user col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4" } key={index} id={user.user} onClick={this.chooseUser} >
                <div className={chosen +  this.props.store.chat.theme+"User inside"} id={user.user} >
                    <img id={user.user} className="avatar" src={user.img !== null  && user.img.indexOf('file') !== -1 ? 'https://egorchepiga.ru/tg-stats/' + user.img : TELEGRAM_ICON}/>
                        <label id={user.user} className="user-name">{user.user}</label>
                        <div id={user.user} className="msg-counter">
                            <img id={user.user} className="msg-logo"
                                 src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8iiSSRzWSVWNagMy3-29Jx8NsPwsXbUH4_C_KNVDXR5LUUouGXg"/>
                                <label id={user.user}>{user.summary}</label>
                        </div>
                </div>
            </div>
        )
    };

    userList = (usersStore) => {

        let userCount = 0;
        if(window.innerWidth < 576) userCount = 3;
        else if(window.innerWidth >= 768) userCount = 9;
        else  userCount = 6;

        let users = usersStore.slice();
        let tmp = [];
        while (users.length > 0 && (this.props.store.userList.showAll  || tmp.length < userCount)) {
            let user = users[0],
                index = 0;
            for (let i = 1; i < users.length; i++) {
                if (user.summary < users[i].summary) {
                    user = users[i];
                    index = i;
                }
            }
            if(users[index].user.toLowerCase().indexOf(this.props.store.userList.find.toLowerCase()) !== -1)
                tmp.push(users[index]);
            users.splice(index, 1);
        }
        return tmp.map(this.createUserProfile)
    };

    findUser = (event) => {
        this.props.find(event.target.value);
    };

    createButton = (id, label, action, className, active) => (
        <Button className={className}
                key={id}
                id={id}
                label={label}
                onClick={action}
                active={active}
        />
    );

    render() {
        return (
            <div className="users">
                <div className="users-search input-group">
                    <input onChange={this.findUser} className="form-control" type="text" aria-describedby="button-addon" placeholder={this.props.store.locale.users_list.search} />
                    <div className="input-group-append">
                        {this.createButton("button-addon",
                            this.props.store.locale.users_list.show_all,
                            this.showALlUsers,"search-btn btn-fr " + this.props.store.chat.theme,
                            this.props.store.userList.showAll )}
                    </div>
                </div>
                <div className="users-list-wrap">
                    <div className={"users-list row col-sm-12 col-12 col-md-12 col-lg-12 col-xl-12 " + (this.props.store.userList.showAll ? "all" : '')}>
                        {this.userList(this.props.store.chat.users)}
                    </div>
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
        createTimeMessageForUser: (time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAWTime, theme) => {
            dispatch(createTimeMessage(time, dayScale, imposition, fromTime, toTime, customScale, average, periods, messagesActivity, chosen, RAWTime, theme))
        },
        find: (string) => {
            dispatch(findUser(string));
        },
        showALlUsers: () => {
            dispatch(showAll());
        }
    })
)(UserList)