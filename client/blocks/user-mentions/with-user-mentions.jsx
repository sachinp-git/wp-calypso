/** @format */
/**
 * External dependencies
 */
import React from 'react';

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
		};

		handleKeyPress = e => {
			if ( e.target.value[ e.target.value.length - 1 ] === '@' ) {
				console.log( 'found @something' ); // eslint-disable-line no-console
				this.setState( { showPopover: true } );
			}
		};

		setPopoverContext = popoverContext => {
			this.setState( { popoverContext } );
		};

		render() {
			const suggestions = [
				{
					ID: 1,
					user_login: 'testuser',
				},
			];
			return (
				<div>
					<EnhancedComponent
						{ ...this.props }
						onKeyPress={ this.handleKeyPress }
						ref={ this.setPopoverContext }
					/>
					{ this.state.showPopover && (
						<UserMentionSuggestionList
							suggestions={ suggestions }
							popoverContext={ this.state.popoverContext }
						/>
					) }
				</div>
			);
		}
	};
