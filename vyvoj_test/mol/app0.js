import React from 'react';
import WellInfo from './wellInfo';

class App {

    getItems(){
        return [];

    }

    getWellInfo(wellId){
      return new Promise(function(resolve, reject) {
        var req = new XMLHttpRequest();
        var url = 'data/' + wellId + '/well.json'
        req.open('GET', url);

        req.onload = function() {
          // This is called even on 404 etc
          // so check the status
          if (req.status == 200) {
            // Resolve the promise with the response text
            var data = JSON.parse(req.responseText);
            resolve(data);
          }
          else {
            // Otherwise reject with the status text
            // which will hopefully be a meaningful error
            window["console"]["log"]("error load well info number " + wellId);
            reject(Error(req.statusText));
          }
        };

        // Handle network errors
        req.onerror = function() {
          reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    })
    }

    saveItem(item){

    }

    showWellInfo(data){
      //render data
      //var wellInfoComp = new WellInfo()
      window["console"]["log"](data);
      WellInfo.setState('data',data)
      WellInfo.setState('visible',true)

    }

    showDetail(wellId){

      this.getWellInfo(wellId).then(this.showWellInfo.bind(this))
    }

    render(){
      var data = document.body.querySelector('#data')

      // var cx = React.addons.classSet;
      // var importantModifier = 'message-important';
      // var readModifier = 'message-read';
      // var classes = cx('message', importantModifier, readModifier);

      React.render(
        <div>
        <div className={'logo'}>
        </div>
        <WellInfo isVisible={false}/>
        </div>
        ,  data);
    }

    init(){

      var localConfig = {
        target: 'map',
        path: './data/moldavia'
      };
      var app = new mapito.App()

      var cb = function(){
        app.init()
      }

      var listener = function(evt){
        var features = evt.features
        if(features.length && features.length > 0){
          var firstFeature = features[0]
          var geometry = firstFeature.getGeometry()
          var id = firstFeature.get('id')
          window["console"]["log"](geometry,id);
          waterApp.showDetail(id)

        }
      }

      app.setOptions(/**@type {mapito.app.Options}*/(localConfig),cb);

      app.setEventListener(listener);

      this.render()

    }
}

export default App;
