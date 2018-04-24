/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { isEqual, get } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';
import PieChart from 'components/pie-chart';
import PieChartLegend from 'components/pie-chart/legend';
import SectionHeader from 'components/section-header';
import { requestGoogleMyBusinessStats } from 'state/google-my-business/actions';
import { getGoogleMyBusinessStats } from 'state/selectors';
import { changeGoogleMyBusinessStatsInterval } from 'state/ui/google-my-business/actions';
import { getStatsInterval } from 'state/ui/google-my-business/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

function transformData( data, dataSeriesInfo ) {
	if ( ! data ) {
		return data;
	}

	return data.metricValues.map( value => ( {
		value: value.totalValue.value,
		description: get( dataSeriesInfo, `${ value.metric }.description`, '' ),
		name: get( dataSeriesInfo, `${ value.metric }.name`, value.metric ),
	} ) );
}

class GoogleMyBusinessStatsChart extends Component {
	static propTypes = {
		changeGoogleMyBusinessStatsInterval: PropTypes.func.isRequired,
		chartTitle: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
		data: PropTypes.array.isRequired,
		dataSeriesInfo: PropTypes.object,
		description: PropTypes.string,
		interval: PropTypes.oneOf( [ 'week', 'month', 'quarter' ] ),
		requestGoogleMyBusinessStats: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		statType: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
	};

	static defaultProps = {
		dataSeriesInfo: {},
	};

	state = {};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( nextProps.data === prevState.data ) {
			return null;
		}

		return {
			data: nextProps.data,
			transformedData: transformData( nextProps.data, nextProps.dataSeriesInfo ),
		};
	}

	componentDidMount() {
		this.props.requestGoogleMyBusinessStats(
			this.props.siteId,
			this.props.statType,
			this.props.interval
		);
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return (
			this.props.interval !== nextProps.interval ||
			this.props.siteId !== nextProps.siteId ||
			this.props.statType !== nextProps.statType ||
			! isEqual( this.state.data, nextState.data )
		);
	}

	componentDidUpdate() {
		this.props.requestGoogleMyBusinessStats(
			this.props.siteId,
			this.props.statType,
			this.props.interval
		);
	}

	changeInterval = event =>
		this.props.changeGoogleMyBusinessStatsInterval(
			this.props.siteId,
			this.props.statType,
			event.target.value
		);

	render() {
		const { chartTitle, description, interval, title } = this.props;
		const { transformedData } = this.state;

		return (
			<div>
				<SectionHeader label={ title } />

				<Card>
					{ description && (
						<div>
							<CardHeading tagName={ 'h2' } size={ 16 }>
								{ description }
							</CardHeading>

							<hr className="gmb-stats__metric-hr" />
						</div>
					) }
					<select value={ interval } onChange={ this.changeInterval }>
						<option value="week">{ 'Week' }</option>
						<option value="month">{ 'Month' }</option>
						<option value="quarter">{ 'Quarter' }</option>
					</select>

					<div className="gmb-stats__metric-chart">
						<PieChart data={ transformedData } title={ chartTitle } />
						<PieChartLegend data={ transformedData } />
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const interval = getStatsInterval( state, siteId, ownProps.statType );
		return {
			siteId,
			interval,
			data: getGoogleMyBusinessStats( state, siteId, ownProps.statType, interval, 'total' ),
		};
	},
	{
		changeGoogleMyBusinessStatsInterval,
		requestGoogleMyBusinessStats,
	}
)( GoogleMyBusinessStatsChart );
