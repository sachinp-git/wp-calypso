/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogTaskUpdate from './update';
import Card from 'components/card';
import EllipsisMenu from 'components/ellipsis-menu';
import Gridicon from 'gridicons';
import PopoverMenuItem from 'components/popover/menu-item';
import { getPluginsWithUpdates } from 'state/plugins/installed/selectors';

class ActivityLogTasklist extends Component {
	static propTypes = {
		siteId: PropTypes.number,

		// Connected props
		hasTasks: PropTypes.bool.isRequired,
		pluginsWithUpdates: PropTypes.array.isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
	};

	dismissAll = () => {
		// ToDo: this should update some record in the tasklist API
		console.log( 'dismiss all' );
	};

	render() {
		const { pluginsWithUpdates, translate, siteId } = this.props;

		return (
			! isEmpty( pluginsWithUpdates ) && (
				<Card className="activity-log-tasklist__main" highlight="warning">
					<div className="activity-log-tasklist__heading">
						{ // Not using count method since we want a "one" string.
						1 < pluginsWithUpdates.length
							? translate( 'You have %(updates)s updates available', {
									args: { updates: pluginsWithUpdates.length },
								} )
							: translate( 'You have one update available' ) }
						<EllipsisMenu>
							<PopoverMenuItem onClick={ this.dismissAll }>
								<Gridicon icon="trash" size={ 24 } />
								<span className="activity-log-tasklist__dismiss-all">
									{ translate( 'Dismiss all' ) }
								</span>
							</PopoverMenuItem>
						</EllipsisMenu>
					</div>
					<Fragment>
						{ pluginsWithUpdates.map( plugin => {
							console.log( plugin );
							return <ActivityLogTaskUpdate siteId={ siteId } plugin={ plugin } />;
						} ) }
					</Fragment>
				</Card>
			)
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => {
	return {
		hasTasks: true, // ToDo: this will count pending tasks returned by the tasklist API
		pluginsWithUpdates: getPluginsWithUpdates( state, [ siteId ] ),
	};
};

const mapDispatchToProps = null;

export default connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTasklist ) );
