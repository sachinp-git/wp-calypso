/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { last, pick } from 'lodash';

/**
 * Internal dependencies
 */
import UserMentionSuggestionList from './suggestion-list';

/**
 * withUserMentionSuggestions is a higher-order component that adds user mention support to whatever input it wraps.
 *
 * @example: withUserMentionSuggestions( Component )
 *
 * @param {object} EnhancedComponent - react component to wrap
 * @returns {object} the enhanced component
 */
export default EnhancedComponent =>
	class withUserMentions extends React.Component {
		static displayName = `withUserMentions( ${ EnhancedComponent.displayName ||
			EnhancedComponent.name } )`;
		static propTypes = {};

		state = {
			showPopover: false,
			popoverContext: null,
			query: null,
		};

		constructor( props ) {
			super( props );
			// create a ref to store the textarea DOM element
			this.textInput = React.createRef();
		}

		handleKeyPress = e => {
			if ( e.target.value[ e.target.value.length - 1 ] === '@' ) {
				console.log( 'found @something' ); // eslint-disable-line no-console
				this.setState( { showPopover: true } );
			}
		};

		setPopoverContext = popoverContext => {
			this.setState( { popoverContext } );
		};

		getPosition( { query } = this.state ) {
			const mentionRange = document.createRange();
			const node = this.textInput.current;

			// Set range to start at beginning of mention in order to get accurate positioning values.
			mentionRange.setStart( node, node.selectionStart - query.length );
			mentionRange.setEnd( node, node.selectionEnd );

			const rectList = mentionRange.getClientRects();
			const position = last( rectList ); //or default?

			return pick( position, [ 'left', 'top' ] );
		}

		render() {
			const suggestions = [
				{
					ID: 1,
					user_login: 'testuser',
				},
			];
			const position = this.getPosition();
			return (
				<div>
					<EnhancedComponent
						{ ...this.props }
						onKeyPress={ this.handleKeyPress }
						ref={ this.textInput }
					/>
					{ this.state.showPopover && (
						<UserMentionSuggestionList
							suggestions={ suggestions }
							popoverContext={ this.textInput }
						/>
					) }
				</div>
			);
		}
	};
