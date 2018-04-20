/** @format */
/**
 * External dependencies
 */
import React from 'react';
import getCaretCoordinates from 'textarea-caret';

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
			query: '',
		};

		constructor( props ) {
			super( props );
			// create a ref to store the textarea DOM element
			this.textInput = React.createRef();
			this.popoverStyles = {};
		}

		componentDidMount() {
			const { left, top, height } = this.getPosition();

			this.left = left;
			this.top = top;
			this.height = height;
		}

		componentWillUpdate( nextProps, nextState ) {
			// Update position of popover if going from invisible to visible state.
			if ( ! this.state.showPopover && nextState.showPopover ) {
				this.updatePosition( nextState );
				//this.props.editor.on( 'keydown', this.onKeyDown );

				return;
			}

			// Visible to invisible state.
			if ( this.state.showPopover && ! nextState.showPopover ) {
				//this.props.editor.off( 'keydown', this.onKeyDown );

				return;
			}

			// Update position of popover if cursor has moved to a new line.
			if ( nextState.showPopover ) {
				const { top, left } = this.getPosition();
				const isLineBefore = this.top > top && this.left < left;
				const isLineAfter = this.top < top && this.left > left;

				if ( isLineBefore || isLineAfter ) {
					this.updatePosition( nextState, { top, left } );
				}
			}
		}

		handleKeyPress = e => {
			if ( e.target.value[ e.target.value.length - 1 ] === '@' ) {
				console.log( 'found @something' ); // eslint-disable-line no-console
				this.setState( { showPopover: true } );
			}
			this.getPosition();
		};

		setPopoverContext = popoverContext => {
			this.setState( { popoverContext } );
		};

		getPosition() {
			const node = this.textInput.current;
			const nodeRect = node.getBoundingClientRect();
			const caretPosition = getCaretCoordinates( node, node.selectionEnd );
			const position = {
				left: nodeRect.left + caretPosition.left + 8,
				top: nodeRect.top + caretPosition.top + 10,
			};

			console.log( position ); // eslint-disable-line no-console

			return position;
		}

		updatePosition( state, { left, top, height } = this.getPosition( state ) ) {
			this.left = left;
			this.top = top;
			this.height = height;

			this.popoverPositionLeft = `${ this.left }px`;
			// 10 is the top position of .popover__inner, which hasn't rendered yet.
			this.popoverPositionTop = `${ this.top }px`;
		}

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
						ref={ this.textInput }
					/>

					{ this.textInput.current && (
						<UserMentionSuggestionList
							suggestions={ suggestions }
							popoverContext={ this.textInput.current }
							popoverPositionLeft={ this.popoverPositionLeft }
							popoverPositionTop={ this.popoverPositionTop }
						/>
					) }
				</div>
			);
		}
	};
