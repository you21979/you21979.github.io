var rippleRate = (function(){
  var offerRequest = function(websocket, pairstr, callback){
    var pair = pairstr.split('/');
    var count = 0;
    var bestbid = 0;
    var bestask = 0;
    var request = function(){
      var reqbid = JSON.stringify({
        id : 1,
        command : "book_offers",
        taker_pays : convertToOfferCurrency(pair[0]),
        taker_gets : convertToOfferCurrency(pair[1]),
      });
      count++;
      var reqask = JSON.stringify({
        id : 2,
        command : "book_offers",
        taker_gets : convertToOfferCurrency(pair[0]),
        taker_pays : convertToOfferCurrency(pair[1]),
      });
      count++;
      websocket.send(reqbid);
      websocket.send(reqask);
    }
    var response = function(evt){
      var msg = JSON.parse(evt.data);
      switch(msg.id){
      case 1:
        bestbid = getBestBidPrice(msg);
        break;
      case 2:
        bestask = getBestAskPrice(msg);
        break;
      }
      count--;
      if(count == 0){
        callback({bid:bestbid, ask:bestask});
      }
    }
    return {
      request : request,
      response : response,
    }
  }
  var XRPtoNumber = function(str){
    return parseFloat(str) / 1000000;
  }
  var convertToOfferCurrency = function(name){
    var w = name.split('.');
    return (w.length === 1) ? {currency:w[0]} :
                              {currency:w[0], issuer:w[1]};
  }
  var convertFromOffer = function(data){
    if(data instanceof Object){
        return {
            currency : data.currency,
            issuer : data.issuer,
            value : parseFloat(data.value),
        }
    }else{
        return {
            currency : "XRP",
            issuer : "",
            value : XRPtoNumber(data),
        }
    }
  }
  var convertFromOfferQuality = function(gets, pays){
    var gets = convertFromOffer(gets);
    var pays = convertFromOffer(pays);
    var quality = pays.value / gets.value;
    return quality;
  }
  var adjustValueFloor = function(value, digit){
    var n = Math.pow(10, digit);
    return Math.floor(value * n) / n;
  }
  var adjustValueCeil = function(value, digit){
    var n = Math.pow(10, digit);
    return Math.ceil(value * n) / n;
  }
  var LOG10 = Math.log(10.0);
  var numberOfDigits = function(value){
    return Math.floor(Math.log(value) / LOG10) + 1;
  }
  var ADJUSTDIGIT = 3;
  var getBestBidPrice = function(msg){
    if(msg.result.offers.length === 0) return 0;
    var bestoffer = msg.result.offers[0];
    var price = 1 / convertFromOfferQuality(bestoffer.TakerGets, bestoffer.TakerPays);
    var w = adjustValueFloor(price, numberOfDigits(price) + ADJUSTDIGIT);
    return w;
  }
  var getBestAskPrice = function(msg){
    if(msg.result.offers.length === 0) return 0;
    var bestoffer = msg.result.offers[0];
    var price = convertFromOfferQuality(bestoffer.TakerGets, bestoffer.TakerPays);
    var w = adjustValueCeil(price, numberOfDigits(price) + ADJUSTDIGIT);
    return w;
  }
  return offerRequest;
})();
