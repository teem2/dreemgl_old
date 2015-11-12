define.class(function (view, text, codeviewer) {

    this.slidetitle = "External Components in DreemGL";

    this.flexdirection = 'column';
    this.attribute('syntaxCode', {type: String});

    this.render = function render() {
        return [
            text({
                text:'+ Components are just directories - No special work required!',
                fgcolor:'#333',
                fontsize:25,
                margintop:30
            }),
            text({
                text:'(note: define.$plugins defaults to $compositions directory for convenience, but can be changed for security)',
                fgcolor:'#666',
                fontsize:14,
                margintop:5,
                marginleft:25
            }),
            text({
                text:'+ Compositions can auto load classes in other directories',
                fgcolor:'#333',
                fontsize:25,
                margintop:30
            }),
            text({
                text:'Use the `compositionname$classname` syntax:',
                fgcolor:'#444',
                fontsize:20,
                margintop:5,
                marginleft:95
            }),
            codeviewer({
                flex: 1,
                alignself: 'center',
                margin: vec4(10),
                code: this.syntaxCode,
                padding: vec4(4),
                fontsize: 14,
                bgcolor: "#000030",
                multiline: true}
            ),
            text({
                text:'+ Examples are compositions, no special mounting!',
                fgcolor:'#333',
                fontsize:25,
                margintop:0
            }),
            text({
                text:'(note: see https://github.com/teem2/dreemgl/tree/dev/compositions/guide for more detail)',
                fgcolor:'#666',
                fontsize:14,
                margintop:5,
                marginleft:25
            })

        ];
    }

    //components are just directories, no special work required, defaults to composition directory

    //

    //

    //define.$plugin can be changed


});