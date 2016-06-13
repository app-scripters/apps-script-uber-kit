//very simple templating
Lib.util.compile = function(s, args_dict){
    return s.replace(/{{\s*\w+\s*}}/ig, function(capture){
        return args_dict[capture.match(/\w+/i)]
    })
};

