
let isTest = false;
let isButtleTest = false;
let isClearTest = false;

let version = "1.0.00";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

const canvas2 = document.getElementById("cardCanvas");
const ctx2 = canvas2.getContext("2d");
canvas2.width = 33;
canvas2.height = 3;
ctx2.fillStyle = "white";
ctx2.fillRect(0,0,30,3);

let touch = {x:0,y:0,"type":null};
let lastTouchstart = {x:0,y:0};
let isClick = false;//touchend時にtrueになる場合の処理。touchstart時とgame.update()の最後にfalseになる。

let canReadCard = false;

let canScroll = true;

//スクロールの制御
/*
window.addEventListener(
    "touchstart",
    function (event) {
      if(canScroll == false)event.preventDefault();
    },
    { passive: false }
);
*/
window.addEventListener(
    "touchmove",
    function (event) {
      if(canScroll == false)event.preventDefault();
    },
    { passive: false }
);
document.getElementById("scrollButton").addEventListener("click",()=>{
  canScroll = !canScroll;
  if (canScroll) {
    document.getElementById("scrollButton").textContent = "スクロール禁止をONにする";
  } else {
    document.getElementById("scrollButton").textContent = "スクロール禁止をOFFにする";
  }
});

function setEventListenner(){
  canvas.addEventListener('touchmove',(event)=>{
    var eventType = event.type;
    var x = 0, y = 0;
    const offset = canvas.getBoundingClientRect();
  	x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    x = x - offset.left - window.pageXOffset;
    y = y - offset.top - window.pageYOffset;
    touch.type = eventType;
    touch.x = Math.floor(x);
    touch.y = Math.floor(y);
  });
    
  canvas.addEventListener('touchstart',(event)=>{
    var eventType = event.type;
    var x = 0, y = 0;
    const offset = canvas.getBoundingClientRect();
  	x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    x = x - offset.left - window.pageXOffset;
    y = y - offset.top - window.pageYOffset;
    touch.type = eventType;
    touch.x = Math.floor(x);
    touch.y = Math.floor(y);
    lastTouchstart ={x:touch.x,y:touch.y};
    isClick = false;
  });
    
  canvas.addEventListener('touchend',(event)=>{
    var eventType = event.type;
    var x = 0, y = 0;
    const offset = canvas.getBoundingClientRect();
  	x = event.changedTouches[0].pageX;
    y = event.changedTouches[0].pageY;
    x = x - offset.left - window.pageXOffset;
    y = y - offset.top - window.pageYOffset;
    touch.type = eventType;
    touch.x = Math.floor(x);
    touch.y = Math.floor(y);
    //isClickの判定
    if(Math.abs(touch.x - lastTouchstart.x) < 5 && Math.abs(touch.y - lastTouchstart.y) < 5)isClick = true;
  });
}
setEventListenner();

//カードリーダーの処理。game宣言後に設定する。
function setCardReaderEventListenner(){
  document.getElementById("fileInput").addEventListener("change",(event)=>{
    const file = event.target.files[0];
    document.getElementById("fileInput").value = "";
    if(canReadCard == false)return;
    
    let _img = new Image();
    _img.src = URL.createObjectURL(file);
    _img.onload = ()=>{
      ctx2.drawImage(_img, 0, 0);
      const myImageData = ctx2.getImageData(0,0,canvas2.width, canvas2.height);
      const pixels = myImageData.data; 
      let _arr = [];
      for (var i = 0; i < 11; i++) {
        let r = pixels[4*canvas2.width + 4 + 12*i];
        let g = pixels[4*canvas2.width + 5 + 12*i];
        let b = pixels[4*canvas2.width + 6 + 12*i];
        if(r<=10 && g<=10 && b<=10){
          _arr.push(1);
        }else if(r>=200 && g>=200 && b>=200){
          _arr.push(0);
        }else{
          return;
        }
      }
      
      let _index = 0;
      for (var i = 0; i < _arr.length; i++) {
        _index += _arr[i] * (2**i);
      }
      game.scene.readCard(_index);
    };
  
  });
}

class Game {
  constructor(_scene){
    this.scene = _scene ;
    this.objects = [];
    this.fade = {flag : 0,frame : 0,nextScene :null};
    this.fadeFrame = 60;
    this.dontTouch = 0;//タッチイベントを発生させないframe数
    this.todayCardIndex;
    this.setTodayCard();
    
    this.audioName = "";
    this.audio = null;
    this.audioSetTimeout ;
    /*
    this.bgmLoop = () => {
      this.audio.currentTime = 0;
      this.audio.play();
    }
    */
    this.bgmVolume = 10;
  }
  
  canTouchevent(){
    if(this.dontTouch > 0)return false;
    if(this.fade.flag != 0)return false;
    return true;
  }
  
  setBgm(audioName = null){//audioNameがnullならbgmの変更を行わない。""ならbgmを消す。
    if(audioName == ""){//bgmを消す
      if(this.audio == null)return;
      this.audio.pause();
      this.audio.currentTime = 0;
      //this.audio.removeEventListener("ended",this.bgmLoop);
      this.audio = null;
      this.audioName = "";
      clearTimeout(this.audioSetTimeout);
    }else if(this.audioName == audioName || audioName == null){
      //bgmを変えない。音量の変更のみ行う。
      if(this.audio != null)this.audio.volume = this.bgmVolume /10;
      return;
    }else{
      if(audioNames.includes(audioName) == false)return;//該当する曲名がないならreturn
      this.audioName = audioName;
      this.audio = audios[audioName];
      //this.audio.loop = true;
      this.audio.currentTime = 0;
      this.audio.volume = this.bgmVolume /10;
      //this.audio.addEventListener("ended", this.bgmLoop, false);
      this.audio.play();
      if(this.audioSetTimeout)clearTimeout(this.audioSetTimeout);
      this.audioSetTimeout = setTimeout(()=>{
        this.audioName = null;
        this.setBgm(audioName);
      },(audioDatas[audioName].time) * 1000);
      
    }
    
  }
  
  setTodayCard() {
  
    let date1 = new Date('2025-04-26 00:00:00');
    let date2 = new Date();

    // 2つの日時のタイムスタンプで時間差を計算
    let diff = Math.abs( date2.getTime() - date1.getTime() );
    diff = diff / (24 * 60 * 60 * 1000); //日単位
    diff = Math.floor(diff);
    diff = diff % cardData.length;
    this.todayCardIndex = diff;
    /*
    function randomNum(_min = 0, _max = 10) {
      return Math.floor(Math.random() * (_max + 1 - _min) + _min);
    }
    this.todayCardIndex = randomNum(0, cardData.length - 1);
    */
  }
  
  setCardImage(index){
    
  }
  
  update(){
    if(this.dontTouch > 0)this.dontTouch--;
    if(this.dontTouch < 0)this.dontTouch = 0;
    
    
    this.objects = [];
    
    if(isTest){
      document.getElementById("testSpan01").innerText = "x:" + touch.x;
      document.getElementById("testSpan02").innerText = "y:" + touch.y;
      document.getElementById("testSpan03").innerText = "type:" + touch.type;
    }
    
    for (var i = 0; i < this.objects.length; i++) {
      this.objects[i].update();
    }
    this.scene.update();
    
    if(this.fade.flag != 0){
      //フェードアウト、フェードインの処理
      if(this.fade.flag == 1){
        this.fade.frame++;
        let _opa = this.fade.frame / (this.fadeFrame /2);//画面を覆う黒の透明度
        if(_opa > 1){
          //折り返し
          _opa = 1;
          this.fade.flag = 2;
          if(this.fade.nextScene != null){
            this.scene = this.fade.nextScene;
            this.fade.nextScene = null;
          }  
        }
        let _b = new Rect(0,0,canvas.width,canvas.height,"black",_opa);
        _b.update();
      }else if(this.fade.flag == 2){
        this.fade.frame--;
        let _opa = (this.fade.frame) / (this.fadeFrame /2);//画面を覆う黒の透明度
        if(_opa < 0){
          _opa = 0;
          this.fade.flag = 0;
          this.fade.frame = 0;
        }
        let _b = new Rect(0, 0, canvas.width, canvas.height, "black", _opa);
        _b.update();
      }
    }
    if(isClick)isClick = false;
  }
  
  fadeFunction(_nextScene = null){
    this.fade = {flag :1,frame:0,nextScene:_nextScene};
  }
  
  
};

class Scene{
  constructor(){
    this.basicObjects = [];
    this.objects = [];
    
    
  }
  
  setScrollButton(){
    this.addRect(canvas.width - 10 * 11, 0, 10 * 11, 20, "white",null,{touchevent:()=>{canScroll = !canScroll;touch.type = "touchend";},clickevent:()=>{}});
    this.addText("スクロール禁止ON/OFF", canvas.width - 10 * 11, 5,10*11,10,null,"black");
  }
  
  touchevent(){
    for (var i = 0; i < this.basicObjects.length; i++) {
      if(this.basicObjects[i].isTouch() && touch.type=="touchstart")this.basicObjects[i].touchevent();
      if (this.basicObjects[i].isTouch() && isClick) this.basicObjects[i].clickevent();
    }
      

    for (var i = 0; i < this.objects.length; i++) {
      if(this.objects[i].isTouch() && touch.type == "touchstart")this.objects[i].touchevent();
      if(this.objects[i].isTouch() && isClick)this.objects[i].clickevent();
    }
  }
  
  update(frame = 0){//frameはAnimeオブジェクトを使用する場合に必要
    this.objects = [];
    
    this.setObjects();
    
    //this.setScrollButton(); //スクロール禁止onoffボタンはbutton要素で実装することにした
    
    if(game.canTouchevent()){
      this.touchevent();
    }
    
    for (var i = 0; i < this.basicObjects.length; i++) {
      this.basicObjects[i].update(frame);
    }
    for (var i = 0; i < this.objects.length; i++) {
      this.objects[i].update(frame);
    }
  }
  
  setObjects(){}
  
  addRect(_x,_y,_w,_h,_color = "white",_position = null,_event = null,_isBasicObjects = false,_opacity = 1){
    let targetArr;
    if (_isBasicObjects == true) targetArr = this.basicObjects;
    if (_isBasicObjects == false) targetArr = this.objects;
    let _r = new Rect(_x,_y,_w,_h,_color,_opacity);
    if (_event != null){
      if("touchevent" in _event)_r.touchevent = _event.touchevent;
      if("clickevent" in _event)_r.clickevent = _event.clickevent;
    }
    if(_position == "centerX" || _x == "center"){
      _r.x = (canvas.width - _w )/2;
    }
    targetArr.push(_r);
  }
  
  addText(_text, _x = 0, _y = 0, _maxWidth = null,_textSize = 20, _position = null,_color = "white",_event = null,_isBasicObjects = false) {
    let targetArr;
    if(_isBasicObjects == true)targetArr = this.basicObjects;
    if(_isBasicObjects == false)targetArr = this.objects;
    let _t = new Text(_text, _x, _y, _maxWidth,_color);
    if(_textSize != null)_t.font = _textSize + "px sans serif"
    if (_event != null) {
      if("touchevent" in _event)_t.touchevent = _event.touchevent;
      if("clickevent" in _event)_t.clickevent = _event.clickevent;
    }
    if (_position == "centerX" || _x == "center") {
      _t.textAlign = "center";
      _t.x = canvas.width / 2;
    }else if(_position == "textAlignCenter"){
      _t.textAlign = "center";
    }else if(_position == "baseCenter"){
      _t.textAlign = "center";
      _t.textBaseline = "middle";
    } else {
      //do nothing
    }
    targetArr.push(_t);
  }
  
  addSprite(_img,_x,_y,_w=0,_h=0,_position = null,_event = null,_isBasicObjects = false){
    let targetArr;
    if (_isBasicObjects == true) targetArr = this.basicObjects;
    if (_isBasicObjects == false) targetArr = this.objects;
    let _sp = new Sprite(_img,_x,_y,_w,_h);
    if (_event != null) {
      if("touchevent" in _event)_sp.touchevent = _event.touchevent;
      if("clickevent" in _event)_sp.clickevent = _event.clickevent;
    }
    if(_position == "centerX" || _x == "center"){
      if(_w == 0){
        _sp.x = (canvas.width - _img.width)/2;
      }else{
        _sp.x = (canvas.width - _w)/2;
      }
    }
    targetArr.push(_sp);
  }
  
  addAnime(_imgs = [], _x, _y, _w = 0, _h = 0,_widthAtOneFrame = 64,_frameInterval = 10, _position = null, _event = null, _isBasicObjects = false) {
  let targetArr;
  if (_isBasicObjects == true) targetArr = this.basicObjects;
  if (_isBasicObjects == false) targetArr = this.objects;
  let _anime = new Anime(_imgs, _x, _y, _w, _h,_widthAtOneFrame,_frameInterval);
  if (_event != null) {
    if("touchevent" in _event)_anime.touchevent = _event.touchevent;
    if("clickevent" in _event)_anime.clickevent = _event.clickevent;
  }
  if (_position == "centerX" || _x == "center") {
    if (_w == 0) {
      _anime.x = (canvas.width - _imgs[0].width) / 2;
    } else {
      _anime.x = (canvas.width - _w) / 2;
    }
  }
  targetArr.push(_anime);
}
  
  addCercle(_x,_y,_hankei,_color = "black",_isStroke = false,_event = null,_isBasicObjects = false){
    let targetArr;
    if (_isBasicObjects == true) targetArr = this.basicObjects;
    if (_isBasicObjects == false) targetArr = this.objects;
    let _sp = new Cercle(_x, _y, _hankei,_color,_isStroke);
    if (_event != null) {
      if("touchevent" in _event)_sp.touchevent = _event.touchevent;
      if("clickevent" in _event)_sp.clickevent = _event.clickevent;
    }
    if ( _x == "center") {
      _sp.x = canvas.width /2;
    }
    targetArr.push(_sp);
  }
  
  addLine(_x1,_y1,_x2,_y2,_color = "white",_lineWidth = 5,_globalCompositeOperation = "source-over",_opacity = 1,_isBasicObjects = false){
    let targetArr;
    if (_isBasicObjects == true) targetArr = this.basicObjects;
    if (_isBasicObjects == false) targetArr = this.objects;
    let _line = new Line(_x1,_y1,_x2,_y2,_color,_lineWidth,_globalCompositeOperation,_opacity);
    targetArr.push(_line);
  }
};

class MenuScene1 extends Scene{
  constructor(){
    super();
    this.addRect(0,0,canvas.width,canvas.height,"#669",null,null,true);//背景
    
    this.getCardIndexToday = game.todayCardIndex;
    this.getCardIndexNishinsuuToday = nishinsuuHenkan(this.getCardIndexToday);
    this.getCardNumberTextToday = this.getNumberText(this.getCardIndexToday +1);
    
    this.getCardIndex;
    this.getCardIndexNishinsuu;
    this.getCardNumberText;
    
    this.flag = 0;
    this.lastFlag = 0;
    
    this.buttleMenu = ["初級","中級","上級"];
    this.buttleMenu = ["初級"];
    this.buttleChoice = "初級";
    
    this.readCardIndexes = [null,null,null,null,null];
    this.sameCharactorKeikoku = 0;//警告文の表示フレーム
    this.status = {red:0,blue:0,green:0,yellow:0,purple:0,hp:0,rcv:0};
    
    this.cardChangeNum = 0;//ゲームクリア後の獲得カード入れ替え回数
    this.teijiCard = [0,1];
    this.cardGetSelected = null;
  }
  
  getNumberText(num){
    let _n;
    if (num < 10) {
      _n = "00" + num;
    } else if (num < 100) {
      _n = "0" + num;
    }
    return _n;
  }
  
  readCard(_index){
    console.log(_index);
    //すでにいっぱい選択されているならreturn
    //さらにキャラが重複しないようにする
    let _thisCharactor = cardData[_index].charactor;
    let _isAlreadyEnough = true;
    let _isAlreadyThisCharactor = false;
    for (var i = 0; i < this.readCardIndexes.length; i++) {
      if(this.readCardIndexes[i] == null)_isAlreadyEnough = false;
      if(this.readCardIndexes[i] == null)continue;
      if(cardData[ this.readCardIndexes[i] ].charactor == _thisCharactor)_isAlreadyThisCharactor = true;
    }
    if(_isAlreadyEnough)return;
    if(_isAlreadyThisCharactor){
      this.sameCharactorKeikoku = 200;
      return;
    }
    this.readCardIndexes[ this.readCardIndexes.indexOf(null)] = _index;
    this.setStatus();
  }
  
  setStatus(){
    this.status = this.status = {red:0,blue:0,green:0,yellow:0,purple:0,hp:0,rcv:0};
    for (var i = 0; i < this.readCardIndexes.length; i++) {
      if(this.readCardIndexes[i] == null)continue;
      let _c = cardData[this.readCardIndexes[i]];
      this.status[_c.attribute] += _c.atk;
      this.status["hp"] += _c.hp;
      this.status["rcv"] += _c.rcv;
    }
  }
  
  setGetCardInfo(cardIndex){
    this.getCardIndex = cardIndex;
    this.getCardIndexNishinsuu = nishinsuuHenkan(cardIndex);
    this.getCardNumberText = this.getNumberText(cardIndex +1);
  }
  
  canvasDl(){
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png", 1);
    let number = this.getCardNumberText;
    a.download = "ArcadeBeatsCard" + number + ".png";
    a.click();
  }
  
  gameClear(nanido){
    this.flag = "ゲームクリア";
    this.cardChangeNum = this.buttleMenu.indexOf(nanido);
    this.teijiCard = this.returnTwoRandomCardIndex();
    setTimeout(()=>{buttleScene = null;},1000);
  }
  
  returnTwoRandomCardIndex(){
    let maxNum = cardData.length -1;
    let tf = true;
    let re = [];
    while (tf) {
      let index1 = randomNum(0,maxNum);
      let index2 = randomNum(0,maxNum);
      if(index1 != index2)tf = false;
      if(maxNum <= 0)tf = false;
      if(tf == false)re = [index1,index2];
    }
    return re;
  }
  
  update(){
    super.update();
    if(this.flag == "cardGet2"){
      this.canvasDl();
      ctx.fillStyle = "black";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      if(this.cardGetSelected == null)this.flag = 0;
      if(this.cardGetSelected != null){
        //ゲームクリア後のカードゲット場合
        this.cardGetSelected = null;
        this.flag = "cardGet";
        game.fadeFunction(titleScene);
        game.setBgm("");
        game.dontTouch = 20;
      }
    }
    //警告文の表示フレームを減らす
    if(this.sameCharactorKeikoku > 0)this.sameCharactorKeikoku--;
    if(this.sameCharactorKeikoku < 0)this.sameCharactorKeikoku = 0;
    
  }
  
  changeFlag(nextFlag){
    this.lastFlag = this.flag;
    this.flag = nextFlag;
  }
  
  setObjects(){
    let setModoruButton = (_flag = this.lastFlag)=>{
      this.addRect(20, 20, 60, 30, "black", null, { touchevent: () => {}, clickevent: () => { this.changeFlag(_flag) ; } });
      this.addText("戻る", 30, 25);
    };
    
    let setFlagButton = (textArr = [],flagNameArr = [],_event = {} )=>{//_eventではindexを引数にできる。{touchevent:(_index)=>{},clickevent:(_index)=>{}}
      if(textArr.length != flagNameArr.length){
        console.log("setFlagButton Function error");
        return;
      }
      for (var i = 0; i < textArr.length; i++) {
        let _num = Number(i + "");
        this.addRect(0, 80 + 80 * i, 200, 50, "black", "centerX", { touchevent: () => { if("touchevent" in _event){ _event.touchevent(_num) } }, clickevent: () => { if("clickevent" in _event){ _event.clickevent(_num) } this.changeFlag( flagNameArr[_num] ) } });
        this.addText(textArr[_num], "center", 80 + 15 + 80 * i);
      }
    };
    
    if(this.flag == 0){
      let _menu = ["バトル","オプション"];
      let _flagName = ["バトルメニュー","オプション画面"];
      setFlagButton(_menu,_flagName);
      this.addText("本日のカードNo." + this.getCardNumberTextToday,50,350);
      this.addSprite(cardImages[game.todayCardIndex],50,375,40*3,60*3);
      let _eve = ()=>{
        game.setBgm("schoolDays");
        this.setGetCardInfo(this.getCardIndexToday);
        this.flag = "cardGet";
        game.dontTouch =10;
        touch.type = "touchend";
      };
      this.addCercle(290,450,50,"white",false, {touchevent:()=>{},clickevent:_eve});
      this.addCercle(290,450,50,"black",true);
      this.addText("ダウンロード",290,450,90,20,"baseCenter","black");
    }
    
    if(this.flag == "オプション画面"){
      setModoruButton(0);
      this.addText("○音量○",30,80);
      let maxText = "";
      if(game.bgmVolume == 10)maxText = "(MAX)";
      this.addText("BGM:" + game.bgmVolume + maxText,50,120);
      this.addRect(200,120,20,20,"white",null,{clickevent:()=>{
        if(game.bgmVolume > 0)game.bgmVolume--;
        if(game.bgmVolume < 0)game.bgmVolume = 0;
        game.setBgm(null)
      }});
      this.addText("-",210,130,null,20,"baseCenter","black");
      this.addRect(250,120,20,20,"white",null,{clickevent:()=>{
        if(game.bgmVolume < 10)game.bgmVolume++;
        if(game.bgmVolume > 10)game.bgmVolume = 10;
        game.setBgm(null)
      }});
      this.addText("+",260,130,null,20,"baseCenter","black");
    }
    
    if(this.flag == "バトルメニュー"){
      this.addText("バトル","center",30);
      setModoruButton(0);
      //setFlagButtonに渡す引数を設定
      let _buttleMenu = this.buttleMenu;
      let _sele = [];
      for (var i = 0; i < _buttleMenu.length; i++) {
        _sele.push("バトルキャラクターセレクト");
      }
      setFlagButton(
        this.buttleMenu,
        _sele,
        {touchevent:()=>{},clickevent:(_num)=>{this.buttleChoice = this.buttleMenu[_num];canReadCard = true;setTimeout(()=>{document.getElementById("fileInput").classList.remove("displayNone");},50);}}
      );
      /* 手動でsetFlagButton
      for (var i = 0; i < _buttleMenu.length; i++) {
        let _text = _buttleMenu[i];
        this.addRect("center",80 + 80*i,200,50,"black",null,{touchevent:()=>{},clickevent:()=>{this.buttleChoice = _text;canReadCard = true;setTimeout(()=>{document.getElementById("fileInput").classList.remove("displayNone");},50);this.flag = "バトルキャラクターセレクト"}});
        this.addText(_buttleMenu[i],0,80 +15 + 80*i,null,20,"centerX");
      }
      */
    }
    
    if(this.flag == "バトルキャラクターセレクト"){
      this.addText(this.buttleChoice,"center",30);
      this.addRect(20, 20, 60, 30, "black", null, { touchevent: () => {}, clickevent: () => { canReadCard = false;document.getElementById("fileInput").classList.add("displayNone");this.changeFlag("バトルメニュー"); } });
      this.addText("戻る", 30, 25);
      this.addText("カードを読み込んでください","center",70,null,15);
      if(this.sameCharactorKeikoku > 0)this.addText("同一キャラクターは編成できません","center",90,null,15);
      for (var i = 0; i < this.readCardIndexes.length; i++) {
        if(this.readCardIndexes[i] == null)continue;
        let _index = this.readCardIndexes[i];
        this.addSprite(cardImages[_index],(canvas.width - 340)/2 + 70*i,150,60,90);
        this.addText(cardData[_index].charactor,(canvas.width - 340)/2 + 70*i + 30,240,60,20,"textAlignCenter");
        let _num = Number(i + "");
        this.addText("[解除]",(canvas.width - 340)/2 + 70*i + 30,240 + 40,60,18,"textAlignCenter","black",{touchevent:()=>{},clickevent:()=>{;this.readCardIndexes[_num] = null;this.setStatus()}});
      }
      let _status = ["hp","red","blue","green","yellow","purple","rcv"];
      for (var i = 0; i < _status.length; i++) {
        let _st = _status[i];
        if(_st == "hp"){
          this.addText("HP",40,360);
        }else if(_st != "rcv"){
          this.addCercle(40 + 10,360 + 30*i + 10,10,colors[_st]);
        }else if(_st == "rcv"){
          this.addRect(40,360 + 30*i,20,20,colors["pink"]);
        }
        this.addText(": " + this.status[_st],70,360 + 30*i);
      }
      let _eve = ()=>{
        //キャラクターが選択されているか確認
        let _isCharaSelected = false;
        for (var i = 0; i < this.readCardIndexes.length; i++) {
          if(this.readCardIndexes[i]!=null){
            _isCharaSelected = true;
            break;
          }
        }
        if(_isCharaSelected == false){
          return;
        }
        document.getElementById("fileInput").classList.add("displayNone");
        game.setBgm("");
        buttleScene = new ButtleScene(this.buttleChoice,this.readCardIndexes,this.status);
        game.fadeFunction(buttleScene);
      };
      
      this.addCercle(290, 450, 50, "white", false, { touchevent: () => {}, clickevent: _eve });
      this.addCercle(290, 450, 50, "black", true);
      this.addText("スタート", 290, 450, 90, 20, "baseCenter", "black");
    }
    
    if(this.flag == "cardGet"){
      this.addSprite(cardImages[this.getCardIndex],0,0,canvas.width,canvas.height,null,{touchevent:()=>{},clickevent:()=>{game.setBgm("schoolDays");this.flag = "cardGet2";}});
      //cardIndexの二進数化したものを左上に描画。0は黒、1は白。
      for (var i = 0; i < this.getCardIndexNishinsuu.length; i++) {
        let _col = ["#fff","#000"];
        this.addRect(i*3,0,3,3,_col[this.getCardIndexNishinsuu[i]]);
      }
      let number = this.getCardNumberText;
      this.addRect("center",20 -17,400,50,"black",null,null,false,0.75);
      this.addText("No." + number,20,30 -17,null,15);
      this.addText(cardData[this.getCardIndex].charactor,"center",30 -17);
      this.addRect(canvas.width - 40,35 -17,20,20,colors[cardData[this.getCardIndex].attribute]);
      this.addRect(0,70 -17,100,85,"black",null,null,false,0.5);
      this.addText("HP",10,80 -17);
      this.addText("ATK",10,80 +20 -17);
      this.addText("RCV",10,80 +20*2 -17);
      this.addText(":" + cardData[this.getCardIndex].hp,10 +38,80 -17);
      this.addText(":" + cardData[this.getCardIndex].atk,10 +38,80 +20 -17);
      this.addText(":" + cardData[this.getCardIndex].rcv,10 +38,80 +20*2 -17);
      this.addRect(100,70 -17,canvas.width,34,"black",null,null,false,0.5);
      this.addText("スキル: " + cardData[this.getCardIndex].skillName,110,80 -17,canvas.width - 110 -10,15);
      this.addRect(0,canvas.height - 15,canvas.width,15,"white",null,null,false,0.5);
      this.addText("illustrator:" + cardData[this.getCardIndex].illustrator,10,canvas.height - 15,null,15,null,"black");
      
      
    }
    
    if(this.flag == "ゲームクリア"){
      this.addText("カード獲得","center",30);
      this.addText("提示されているカードから1枚を選択し、丸いボタンを押すと獲得できます","center",60,canvas.width -10,15);
      let teijiCardHenkouFunc = ()=>{
        if(this.cardChangeNum >= 1){
          game.dontTouch = 10;
          this.cardChangeNum--;
          this.teijiCard = this.returnTwoRandomCardIndex();
        }
      };
      this.addRect(canvas.width/2 - 100,90,200,40,"black",null,{clickevent:teijiCardHenkouFunc});
      this.addText("提示カードを変更(残り" + this.cardChangeNum +"回)","center",100,190,20,null,"white");
      for (var i = 0; i < this.teijiCard.length; i++) {
        let _n = i +0;
        let _w = 120;
        let _h = _w * 3/2;
        let _x = (canvas.width - _w*2)/3 * (_n +1) + _w * _n;
        let _y = canvas.height/2 - _h/2;
        let _card = cardData[this.teijiCard[_n]];
        let _cardImage = cardImages[this.teijiCard[_n]];
        let _func = ()=>{
          if(this.cardGetSelected == _n){this.cardGetSelected = null;}else{this.cardGetSelected = _n};
        };
        if(this.cardGetSelected == _n){
          //選択中なら枠を表示
          this.addRect(_x -5,_y -5,_w +10,_h +10,"#f55");
        }
        this.addSprite(_cardImage,_x,_y,_w,_h,null,{clickevent:_func});
      }
      let _eve = () => {
        if(this.cardGetSelected == null){
          game.fadeFunction(titleScene);
          game.setBgm("");
          return;
        }
        game.setBgm("schoolDays");
        this.setGetCardInfo(this.teijiCard[this.cardGetSelected]);
        this.flag = "cardGet";
        game.dontTouch = 10;
        touch.type = "touchend";
      };
      this.addCercle(canvas.width/2, 450 +50, 50, "white", false, { touchevent: () => {}, clickevent: _eve });
      this.addCercle(canvas.width/2, 450 +50, 50, "black", true);
      let _text = "ダウンロード";
      if(this.cardGetSelected == null)_text = "獲得せず終了";
      this.addText(_text, canvas.width/2, 450 +50, 90, 20, "baseCenter", "black");
      
    }
  }
  
}

class TitleScene extends Scene{
  constructor(){
    super();
  }
  
  setObjects(){
    this.addRect(0,0,canvas.width,canvas.height,"#444",null,{touchevent:()=>{},clickevent:()=>{menuScene1.flag = 0;game.setBgm("schoolDays");game.fadeFunction(menuScene1);}})
    this.addText("Arcade Beats!!",0,120,null,40,"centerX");
    this.addText("not official wars",0,180,null,20,"centerX");
    this.addText("ーTAP!ー","center",500,null,20);
    this.addText("ver" + version + " ※非公式のゲームです",5,5,null,12);
  }
};

let buttleScene;
let game = new Game();
let menuScene1 = new MenuScene1();
let titleScene = new TitleScene();
game.scene = titleScene;


setCardReaderEventListenner();

function mainLoop (){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  game.update();
  
  requestAnimationFrame(mainLoop);
};
window.onload = ()=>{
  mainLoop();
};
