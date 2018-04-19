/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ExampleInput from './example-input';
import withUserMentions from '../with-user-mentions';

// Must be a component to accept a ref
// class UserMentionsExampleInput extends Component {
// 	render() {
// 		return <textarea onKeyPress={ this.props.onKeyPress } />;
// 	}
// }

// @todo Move ref forwarding to the HOC
const UserMentionsExampleInput = React.forwardRef( ( props, ref ) => (
	<textarea ref={ ref } onKeyPress={ props.onKeyPress } />
) );

export default withUserMentions( UserMentionsExampleInput );
