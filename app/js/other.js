console.log('Version -----' + gQ.version());

gQ.start = function () {
    console.log(gQ('.heading'));

    // gQ('span', '#li1').text('ram');

    // console.log(gQ('span', '#li1').dom());

    var ticker = gQ.ticker();
    ticker.add(100, 4, function () {
        // console.log('I am called.');
    });


    // ticker.addEvent('tick', function (e) {
    //     console.log('a tick just happend' + e.target, e.type);
    // });

};