$(function(){
  var pair = 'XRP/JPY.r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN';
  var websocket = new WebSocket('wss://s1.ripple.com/');
  var req = rippleRate(websocket, pair, function(res){
    document.getElementById('tkybid').innerHTML = res.bid;
    document.getElementById('tkyask').innerHTML = res.ask;
    websocket.close();
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
