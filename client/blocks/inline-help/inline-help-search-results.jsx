/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal Dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import pathToSection from 'lib/path-to-section';
import QueryInlineHelpSearch from 'components/data/query-inline-help-search';
import PlaceholderLines from './placeholder-lines';
import { decodeEntities, preventWidows } from 'lib/formatting';
import {
	getInlineHelpSearchResultsForQuery,
	getSelectedResult,
	isRequestingInlineHelpSearchResultsForQuery,
} from 'state/inline-help/selectors';
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import { setSearchResults } from 'state/inline-help/actions';
import { getContextResults } from './contextual-help';

class InlineHelpSearchResults extends Component {
	static propTypes = {
		openResult: PropTypes.func.isRequired,
		translate: PropTypes.func,
		searchQuery: PropTypes.string,
	};

	static defaultProps = {
		translate: identity,
		searchQuery: '',
	};

	renderSearchResults() {
		if ( isEmpty( this.props.searchQuery ) ) {
			// not searching
			return this.renderContextHelp();
		}

		if ( this.props.isSearching ) {
			// search, but no results so far
			return <PlaceholderLines />;
		}

		if ( isEmpty( this.props.searchResults ) ) {
			// search done, but nothing found
			return (
				<div>
					<p className="inline-help__empty-results">No results.</p>
					{ this.renderContextHelp() }
				</div>
			);
		}

		// found something
		const links = this.props.searchResults;
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
		);
	}

	renderContextHelp() {
		const section = pathToSection( this.props.lastRoute.path );
		const links = getContextResults( section );
		return (
			<ul className="inline-help__results-list">{ links && links.map( this.renderHelpLink ) }</ul>
		);
	}

	componentDidMount() {
		const section = pathToSection( this.props.lastRoute.path );
		this.props.setSearchResults( '', getContextResults( section ) );
	}

	onHelpLinkClick = event => {
		this.props.openResult( event, event.target.href );
	};

	renderHelpLink = ( link, index ) => {
		const classes = { 'is-selected': this.props.selectedResult === index };
		return (
			<li key={ link.link } className={ classNames( 'inline-help__results-item', classes ) }>
				<a
					href={ link.link }
					onClick={ this.onHelpLinkClick }
					title={ decodeEntities( link.description ) }
				>
					{ preventWidows( decodeEntities( link.title ) ) }
				</a>
			</li>
		);
	};

	render() {
		return (
			<div>
				<QueryInlineHelpSearch
					query={ this.props.searchQuery }
					requesting={ this.props.isSearching }
				/>
				{ this.renderSearchResults() }
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => ( {
	lastRoute: getLastRouteAction( state ),
	searchResults: getInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	isSearching: isRequestingInlineHelpSearchResultsForQuery( state, ownProps.searchQuery ),
	selectedResult: getSelectedResult( state ),
} );
const mapDispatchToProps = {
	recordTracksEvent,
	setSearchResults,
};

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( InlineHelpSearchResults )
);
