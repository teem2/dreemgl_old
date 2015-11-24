define.class(function (view) {

    this.attributes = {
        celltype: {type: Object},
        data: {type: Array},
        cellwidth: {type: int, value:130},
        cellheight: {type: int, value:160}
    };

    this.render = function render() {

        var views = [];
        if (this.data) {
            for (var i = 0; i < this.data.length && i < 10; i++) {
                var data = this.data[i];
                data.width = this.cellwidth;
                data.height = this.cellheight;
                views.push(this.celltype(data));
            }
        }
        return views;
    }


});