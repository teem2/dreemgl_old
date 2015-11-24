define.class(function (view, label) {

    this.bgcolor = 'transparent';
    this.flexdirection = 'row';
    this.padding = 10;
    this.margin = 10;

    this.attributes = {
        deviceId:  {type:String},
        deviceType: {type:String}
    };

    this.render = function() {
        return [
          view({width:this.width, height:'${this.parent.height - this.parent.txt.height}', bgimage:'$compositions/extdemo/slides/' + this.deviceType + '.png'}),
          label({name:'txt', text:this.deviceId, fontsize:14, fgcolor:'white', align:'center', multiline: false})
        ]
    }

});