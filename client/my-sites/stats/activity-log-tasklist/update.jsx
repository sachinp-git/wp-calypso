/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Card from 'components/card';
import PopoverMenuItem from 'components/popover/menu-item';
import SplitButton from 'components/split-button';
import { getSite } from 'state/sites/selectors';
import { updatePlugin } from 'state/plugins/installed/actions';
import { getStatusForPlugin } from 'state/plugins/installed/selectors';
import PluginNotices from 'lib/plugins/notices';
import { errorNotice, infoNotice, successNotice, removeNotice } from 'state/notices/actions';

/*
{
  "id": "caldera-forms/caldera-core",
  "slug": "caldera-forms",
  "active": false,
  "update": {
    "id": "w.org/plugins/caldera-forms",
    "slug": "caldera-forms",
    "plugin": "caldera-forms/caldera-core.php",
    "new_version": "1.6.1",
    "url": "https://wordpress.org/plugins/caldera-forms/",
    "package": "https://downloads.wordpress.org/plugin/caldera-forms.1.6.1.zip",
    "tested": "4.9.5"
  },
  "name": "Caldera Forms",
  "plugin_url": "https://CalderaForms.com",
  "version": "1.6.0",
  "description": "Easy to use, grid based responsive form builder for creating simple to complex forms.",
  "author": "Caldera Labs",
  "author_url": "http://CalderaLabs.org",
  "network": false,
  "autoupdate": false,
  "sites": {
    "140301538": {
      "active": false,
      "autoupdate": false,
      "update": {
        "id": "w.org/plugins/caldera-forms",
        "slug": "caldera-forms",
        "plugin": "caldera-forms/caldera-core.php",
        "new_version": "1.6.1",
        "url": "https://wordpress.org/plugins/caldera-forms/",
        "package": "https://downloads.wordpress.org/plugin/caldera-forms.1.6.1.zip",
        "tested": "4.9.5"
      }
    }
  }
}
*/

class ActivityLogTaskUpdate extends Component {
	static propTypes = {
		plugin: PropTypes.shape( {
			id: PropTypes.string,
			slug: PropTypes.string,
			update: PropTypes.shape( {
				new_version: PropTypes.string,
			} ),
			name: PropTypes.string,
		} ).isRequired,

		// Connected props
		siteName: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		isUpdating: PropTypes.bool.isRequired,
		isUpdateComplete: PropTypes.bool.isRequired,
		isUpdateError: PropTypes.bool.isRequired,
		updateSinglePlugin: PropTypes.func.isRequired,
		showErrorNotice: PropTypes.func.isRequired,
		showInfoNotice: PropTypes.func.isRequired,
		showSuccessNotice: PropTypes.func.isRequired,
		removeThisNotice: PropTypes.func.isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
	};

	state = {
		pluginUpdateNotice: null,
	};

	updateSinglePlugin = () => {
		const { removeThisNotice, showInfoNotice, siteName, plugin, updateSinglePlugin } = this.props;

		const updateNoticeId = get( this.state.pluginUpdateNotice, 'notice.noticeId', null );

		if ( updateNoticeId ) {
			removeThisNotice( updateNoticeId );
		}

		const pluginUpdateNotice = showInfoNotice(
			PluginNotices.inProgressMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', {
				plugin: plugin.name,
				site: siteName,
			} ),
			{
				showDismiss: false,
			}
		);

		console.log( 'updating', pluginUpdateNotice );

		this.setState( { pluginUpdateNotice }, updateSinglePlugin );
	};

	dismissUpdate = () => {
		console.log( 'dismiss' );
	};

	componentWillReceiveProps( nextProps ) {
		const { isUpdateNotStarted, isUpdating } = nextProps;

		if ( isUpdateNotStarted || isUpdating ) {
			return;
		}

		const updateNoticeId = get( this.state.pluginUpdateNotice, 'notice.noticeId', null );

		// If there is no notice displayed
		if ( ! updateNoticeId ) {
			return;
		}

		const {
			plugin,
			removeThisNotice,
			showErrorNotice,
			showSuccessNotice,
			siteName,
			translate,
			isUpdateComplete,
			isUpdateError,
			pluginUpdateStatus,
			updateSinglePlugin,
		} = nextProps;

		const pluginData = {
			plugin: plugin.name,
			site: siteName,
		};

		let pluginUpdateNotice = null;

		// Remove the notice currently displayed
		removeThisNotice( updateNoticeId );

		if ( isUpdateComplete ) {
			pluginUpdateNotice = showSuccessNotice(
				PluginNotices.successMessage( 'UPDATE_PLUGIN', '1 site 1 plugin', pluginData )
			);
		} else if ( isUpdateError ) {
			pluginUpdateNotice = showErrorNotice(
				PluginNotices.singleErrorMessage( 'UPDATE_PLUGIN', pluginData, {
					error: pluginUpdateStatus,
				} ),
				{
					button: translate( 'Try again' ),
					onClick: updateSinglePlugin,
				}
			);
		}

		console.log( 'try again', pluginUpdateNotice );

		this.setState( { pluginUpdateNotice } );
	}

	render() {
		if ( this.props.isUpdateComplete ) {
			return null;
		}

		const { translate, plugin, isUpdating } = this.props;

		return (
			<Card className="activity-log-tasklist__task" compact>
				<ActivityIcon activityIcon="plugins" activityStatus="warning" />
				<span className="activity-log-tasklist__update-item">
					<span className="activity-log-tasklist__update-text">
						{ translate( 'Update available for %(pluginName)s', {
							args: { pluginName: plugin.name },
						} ) }
					</span>
					<span className="activity-log-tasklist__update-bullet">&bull;</span>
					<span className="activity-log-tasklist__update-version">
						{ plugin.update.new_version }
					</span>
				</span>
				<span className="activity-log-tasklist__update-action">
					<SplitButton
						compact
						primary
						label={ translate( 'Update' ) }
						onClick={ this.updateSinglePlugin }
						disabled={ isUpdating }
					>
						<PopoverMenuItem icon="trash" onClick={ this.dismissUpdate }>
							{ translate( 'Dismiss' ) }
						</PopoverMenuItem>
					</SplitButton>
				</span>
			</Card>
		);
	}
}

const mapStateToProps = ( state, { siteId, plugin } ) => {
	const site = getSite( state, siteId );
	const pluginUpdateStatus = getStatusForPlugin( state, siteId, plugin.id );
	return {
		siteId,
		pluginUpdateStatus,
		siteName: site.name,
		isUpdateNotStarted: false === pluginUpdateStatus.status,
		isUpdating: 'inProgress' === pluginUpdateStatus.status,
		isUpdateComplete: 'completed' === pluginUpdateStatus.status,
		isUpdateError: 'error' === pluginUpdateStatus.status,
	};
};

const mapDispatchToProps = ( dispatch, { siteId, plugin } ) => ( {
	updateSinglePlugin: () => dispatch( updatePlugin( siteId, plugin ) ),
	showErrorNotice: ( error, options ) => dispatch( errorNotice( error, options ) ),
	showInfoNotice: ( info, options ) => dispatch( infoNotice( info, options ) ),
	showSuccessNotice: ( success, options ) => dispatch( successNotice( success, options ) ),
	removeThisNotice: noticeId => dispatch( removeNotice( noticeId ) ),
} );

export default connect( mapStateToProps, mapDispatchToProps )( localize( ActivityLogTaskUpdate ) );
