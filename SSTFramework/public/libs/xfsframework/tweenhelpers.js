
/*


*/

var TweenHelpers = {

    tweenSide: function (obj, side, exit, move, index, destroy) {
        
        if (!index)
            index = 0;

        var sside = "left";
        if (side == "right" || side == "top" || side == "bottom")
            sside = side;

        if (!exit)
            obj.css({ opacity: 0 });

        var tweendata = {
            opacity: {
                start: exit ? 100 : 0,
                time: 0.15 * index,
                stop: exit ? 0 : 100,
                duration: 0.6
            }       
        }

        var startpos = parseInt(obj.css(sside)) - move;
        var endpos = parseInt(obj.css(sside));

        var tweenside = {
            start: function () { return (exit ? endpos : startpos); },
            stop: function () { return (exit ? startpos : endpos); },
            time: 0.15 * index,
            duration: 0.6,
            units: 'px',
            effect: exit ? 'easeIn' : 'easeOut'
        }

        tweendata[sside] = tweenside;

        return tweendata;
    },


    tweenOpacity: function (obj, exit, index, duration) {

        if (!index)
            index = 0;

        if (!duration)
            duration = 0.7;

        if (!exit)
            obj.css({ opacity: 0 });

        var tweendata = {
            opacity: {
                start: exit ? 100 : 0,
                time: 0.2 * index,
                stop: exit ? 0 : 100,
                duration: duration
            }
        }

        return tweendata;
    },


    tweenSize: function (obj, exit, index, destroy) {

        if (!index)
            index = 0;

        obj.css("overflow", "hidden");
        var startwidth = parseInt(obj.css("width"));
        var startheight = parseInt(obj.css("height"));
        var startleft = parseInt(obj.css("left"));
        var midx = $(window).width() / 2;
        var tweensize = {

            left: {
                start: midx,
                stop: startleft,
                time: 0.2 * index,
                duration: 0.7,
                units: 'px',
                effect: exit ? 'linear' : 'linear'
            },

            width: {
                start: function () { return (exit ? startwidth : 0); },
                stop: function () { return (exit ? 0 : startwidth); },
                time: 0.2 * index,
                duration: 0.7,
                units: 'px',
                effect: exit ? 'linear' : 'linear'
            },

            height: {
                start: function () { return (exit ? startheight : 0); },
                stop: function () { return (exit ? 0 : startheight); },
                time: 0.2 * index,
                duration: 0.7,
                units: 'px',
                effect: exit ? 'linear' : 'linear'
            },
        }

        return tweensize;
    }

}

