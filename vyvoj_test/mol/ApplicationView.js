//import {Component} from 'react';
import WellInfo from './wellInfo';

class ApplicationView extends React.Component {
    constructor(){
      super();
      this.state = {};
    }

    render() {
      window["console"]["log"]("kkkk",this.state);
        return (
          <div>
            <div id={'map'}>
            </div>

            <div id={'data'}>
              <div>
                <div className={'logo-watersources'}>
                <div className={'logo-cra'}>
                </div>
                <WellInfo isVisible={this.state.showWellInfo} data={this.state.wellInfo}/>
              </div>
            </div>
          </div>
        );
    }
}

export default ApplicationView;
