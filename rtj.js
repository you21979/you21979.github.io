$(function(){
  var pair = 'XRP/JPY.rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6';
  var websocket = new WebSocket('wss://s1.ripple.com/');
  var req = rippleRate(websocket, pair, function(res){
    document.getElementById('rtjbid').innerHTML = res.bid;
    document.getElementById('rtjask').innerHTML = res.ask;
//    websocket.close();
    setTimeout(function(){ req.request(); }, 5 * 1000)
  });
  websocket.onopen = function(evt) {
    req.request();
  };
  websocket.onclose = function(evt) {}; 
  websocket.onmessage = function(evt) {
    req.response(evt);
  };
  websocket.onerror = function(evt) {};
});
