import React, { Component } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
const history = createBrowserHistory();

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment),
);

const currDate = new Date();
const currYear = currDate.getFullYear();
const currMonth = currDate.getMonth();

const events = [
  
];

// todo: reactive custom calendar toolbar component

class Calendar extends Component {
  render() {

    return (
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-calendar"></i>Calendar{' '}
          </CardHeader>
            {console.log('PROP', this.props.events)}
          <CardBody style={{ height: '40em' }}>
            <BigCalendar className="d-sm-down-none"
                         {...this.props}
                         events={ this.props.events || events}
                          eventPropGetter={event => ({
                            style: {
                            backgroundColor: event.color,
                            },
                          })}
                         views={['month', 'week', 'day']}
                         step={30}
                         defaultDate={new Date(currYear, currMonth, 1)}
                         defaultView='month'
                         toolbar={true}
                         onSelectEvent={(e)=>{
                           console.log('SELECTED',e)
                           this.props.history.push('/jobs/'+e.jobId)
                         }}
            />
            <BigCalendar className="d-md-none"
                         {...this.props}
                         events={ this.props.events|| events}
                         views={['day']}
                         step={30}
                         defaultDate={new Date(currYear, currMonth, 1)}
                         defaultView='day'
                         toolbar={true}
            />
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withRouter(Calendar);
