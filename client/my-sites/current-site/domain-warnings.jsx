/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import DomainWarnings from 'my-sites/domains/components/domain-warnings';
import { getDecoratedSiteDomains } from 'state/sites/domains/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';
import QuerySiteDomains from 'components/data/query-site-domains';

const ruleWhiteList = [
	'unverifiedDomainsCanManage',
	'unverifiedDomainsCannotManage',
	'expiredDomainsCanManage',
	'expiringDomainsCanManage',
	'expiredDomainsCannotManage',
	'expiringDomainsCannotManage',
	'wrongNSMappedDomains',
	'pendingGappsTosAcceptanceDomains',
	'transferStatus',
	'newTransfersWrongNS',
];

const CurrentSiteDomainWarnings = ( { domains, isAtomic, isJetpack, selectedSite } ) => {
	if ( ! selectedSite || ( isJetpack && ! isAtomic ) ) {
		// Simple and Atomic sites. Not Jetpack sites.
		return null;
	}

	return (
		<div>
			<QuerySiteDomains siteId={ selectedSite.ID } />

			<DomainWarnings
				isCompact
				selectedSite={ selectedSite }
				domains={ domains }
				ruleWhiteList={ ruleWhiteList }
			/>
		</div>
	);
};

CurrentSiteDomainWarnings.propTypes = {
	domains: PropTypes.array,
	isJetpack: PropTypes.bool,
	selectedSite: PropTypes.object,
};

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		domains: getDecoratedSiteDomains( state, selectedSiteId ),
		isJetpack: isJetpackSite( state, selectedSiteId ),
		isAtomic: isSiteAutomatedTransfer( state, selectedSiteId ),
		selectedSite: getSelectedSite( state ),
	};
} )( CurrentSiteDomainWarnings );
