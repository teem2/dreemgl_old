define.class(function (view) {

    this.attribute('celltype', {type: Object});
    this.attribute('data', {type: Array});

    this.attribute('cellwidth', {type: int, value:130});
    this.attribute('cellheight', {type: int, value:160});


    this.render = function render() {

        var views = [];
        if (this.data) {
            for (var i = 0; i < this.data.length; i++) {
                var data = this.data[i];
                data.width = this.cellwidth;
                data.height = this.cellheight;
                views.push(this.celltype(data));
            }
        }
        return views;
    }


});