/***
 * The Nav component for navigation
 * @patr -- patrick@quantfive.org
 */

import React from 'react';

// NPM Modules
import { StyleSheet, css } from 'aphrodite/no-important';

export default class Nav extends React.Component {
  render() {
    let nav = this.props.nav ? this.props.nav : [];
    return (
      <div className={css(styles.nav) +  ` ${this.props.navClassName ? this.props.navClassName: ''}`} onClick={this.props.closeMenu}>
        { this.props.extraComponentTop }
        { nav }
        { this.props.extraComponentBottom }
      </div>
    );
  }
}

let styles = StyleSheet.create({
  nav: {
    padding: '20px',
    textAlign: 'center',
    width: '100%',
  },
  navItem: {
    marginBottom: '25px',
    opacity: '.5',

    ':hover': {
      opacity: '1',
    }
  },
  tagLine: {
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    fontSize: '12px',
    marginTop: '40px',
  },
  company: {
    display: 'flex',
    marginTop: '10px',
    alignItems: 'center',
  },
  logo: {
    marginRight: '10px',
  },
  companyName: {
    color: '#fff',
    letterSpacing: '1px',
    fontSize: '23px',
  },
  activeLink: {
    opacity: '1',
  },
  linkStyle: {
    textDecoration: 'none',
    color: '#fff',
    fontWeight: '300',

    '@media only screen and (min-width: 768px)': {
      fontSize: '1.3em',
    },

    '@media only screen and (min-width: 1440px)': {
      fontSize: '1.5em',
    }
  },
});
