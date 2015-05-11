import globalEmitter from './Emitter';

class Application {

    constructor(initialData, view) {
        this.view = view;
        this.state = initialData;
        this.setListeners()
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
          this.showDetail(id)
        }
      }

      app.setOptions(/**@type {mapito.app.Options}*/(localConfig),cb);

      app.setEventListener(listener.bind(this));
    }

    render() {
        this.view.setState(this.state);
      }

      setListeners(){
        globalEmitter.on('closeWellInfo',function(){
          this.state.showWellInfo = false
          this.render()
        }.bind(this))
      }

      showDetail(wellId){

        this.getWellInfo(wellId).then(this.showWellInfo.bind(this))
      }

      showWellInfo(data){
        this.state.wellInfo = data
        this.state.showWellInfo = true
        this.render()
      }


}
export default Application;
