//import {Component} from 'react';
//import React from 'react';
import globalEmitter from './Emitter';

class WellInfo extends React.Component{
    constructor(props) {
      super(props);
      this.props = {
        isVisible: false,
        data:null
        };

        this._onCloseBtnClick = this._onCloseBtnClick.bind(this)

    }

    _getRows(data){
      var rows = []
      var row
      for(var i in data){
        row = <tr><th>{i}</th><td>{data[i]}</td></tr>
        rows.push(row)
      }
      return rows

    }

    _onCloseBtnClick(){
      window["console"]["log"]("click");
      globalEmitter.emit('closeWellInfo')
    }

  render() {
    window["console"]["log"](this.props.isVisible)
            var rows = []
                if(!this.props.isVisible){
                  return (<div></div>)
                }else{
                return (
                  <div className={'wellInfo'} style={{display: this.props.isVisible ? 'block' : 'none'}} >
                    <button className={'closeBtn'} onClick={this._onCloseBtnClick} >
                      {'close'}
                      <i className={'fa fa-times fa-2'} style={{'padding-left':'4px'}} ></i>
                    </button>
                    <div className={'wellContent'}>
                      <table>
                          <tbody>
                            {this._getRows(this.props.data)}
                            </tbody>
                      </table>
                    </div>
                  </div>
                )
                };
          }
}

export default WellInfo;



// class WellInfo {
//   constructor(wellInfo){
//     this.data = wellInfo
//   }
//
//   getComponent(){
//     return React.createClass({
//         render: function() {
//           window["console"]["log"]("props",this.props.data);
//
//           var rows = []
//           //rows.push(  <tr>this.props.BodRegion</tr> )
//             return (
//                 <table>
//                     <tbody><td>'BodRegionCislo'</td><td>{this.props.data.BodRegionCislo}</td></tbody>
//                 </table>
//             );
//         }
//     });
//   }
//
//   render(){
//     var data = document.body.querySelector('#data')
//     var wellInfoComponent = this.getComponent()
//
//     //React.createElement(wellInfoComponent),  data);
//     React.render(
//       React.createElement(wellInfoComponent, {data:this.data}),  data);
//   }
// }
//
// module.exports = WellInfo;
