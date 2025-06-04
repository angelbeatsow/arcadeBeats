//pipo-btleffect138.png は、ぴぽや様のサイト(http://piposozai.blog76.fc2.com)より

function nishinsuuHenkan(num){
  
  let _re = [0,0,0,0,0,0,0,0,0,0,0];
  let _num = Number(num);
  for (var i = 11; i > 0; i--) {
    let _n = 0;
    _n = Math.floor(_num / 2**(i-1));
    _re[i-1] = _n;
    _num = _num % 2**(i -1);
  }
  return _re;  
}

const colors = {
  red:"#f06e6e",
  blue:"#7878ff",
  green:"#8cc832",
  yellow:"#fafa28",
  purple:"#c864f0",
  pink:"#fabebe"
};

const audioNames = [
  "schoolDays"
];
const audioDatas = {
  "schoolDays":{
    src: "audio/bgm_schoolDays.wav",
    time: 0
  }
};
let audios = {};
for (let i = 0;i < audioNames.length;i++) {
  let n = Number(i + "");
  let data = audioDatas[audioNames[n]];
  let _audio = new Audio(data.src);
  audios[audioNames[n]] = _audio;
  _audio.addEventListener('loadedmetadata', function(e) {
    audioDatas[audioNames[n]].time = _audio.duration; // 総時間の取得
  });
}



const cardData = [
  {
    num:1,
    charactor:"ゆり",
    imgSrc:"/cardimage/001.png",
    hp:100,
    atk:100,
    rcv:100,
    attribute:"red",
    skill:["atk",1.2],
    skillName:"atk1.2倍",
    illustrator:"abnow"
  },
  {
    num: 2,
    charactor: "ゆり",
    imgSrc: "/cardimage/002.png",
    hp: 120,
    atk: 60,
    rcv: 120,
    attribute: "blue",
    skill: ["blue", 1.3],
    skillName: "青属性atk1.3倍",
    illustrator: "abnow"
  }
  
];

let cardImages = [];
for (var i = 0; i < cardData.length; i++) {
  let _n = Number(i +"");
  let _img = new Image();
  _img.src = cardData[_n].imgSrc;
  _img.onload = ()=>{
    cardImages[_n] = _img;
  };
  
}

let charactorAnimeDatas = {};
let charactorNames = ["ゆり"];
for (var i = 0; i < charactorNames.length; i++) {
  let _img = new Image();
  _img.src = "animeimage/" + charactorNames[i] + "_待機.png";
  let _img2 = new Image();
  _img2.src = "animeimage/" + charactorNames[i] + "_攻撃.png";
  charactorAnimeDatas[charactorNames[i] ] = {
    "待機":{img:_img,x:0,y:0,w:40,h:80,widthAtOneFrame: 64,imagePatternNum:4, frameInterval : 10,isLoop : true},//xとyは"待機"を基準にしたときに相対的にずらす場合の値。wとhは画像サイズではなく表示サイズ
    "攻撃":{img:_img2,x:-40,y:0,w:80,h:80,widthAtOneFrame: 128,imagePatternNum:6, frameInterval : 10,isLoop : false}
  };
}
let enemyNames = ["敵_魚"];
for (var i = 0; i < enemyNames.length; i++) {
  let _img = new Image();
  _img.src = "animeimage/" + enemyNames[i] + "_待機.png";
  /*
  let _img2 = new Image();
  _img2.src = "animeimage/" + charactorNames[i] + "_攻撃.png";
  */
  charactorAnimeDatas[enemyNames[i]] = {
    "待機": { img: _img, x: 0, y: 0, w: 80, h: 160, widthAtOneFrame: 64, frameInterval: 12,imagePatternNum:4, isLoop: true } //xとyは相対的にずらす場合の値。wとhは画像サイズではなく表示サイズ
    //"攻撃": { img: _img2, x: -40, y: 0, w: 80, h: 80, widthAtOneFrame: 128, frameInterval: 10, isLoop: false }
  };
}

class CharactorAnimation {
  constructor(_charactorAnimeData,x=0,y=0){
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.animationData = _charactorAnimeData;
    this.animationType;
    this.animation;
    this.changeAnimationType("待機");
    
    //フェードイン、フェードアウト用
    this.opacity = 1;//透明度
    this.fadein = false;
    this.fadeout = false;
    this.opacityChangeAtOneFrame = 0.05;//フェードイン、フェードアウト時の1フレーム当たりの透明度変化量
  }
  
  setXY(x,y){
    this.x = x;
    this.y = y;
    this.animation.x = x;
    this.animation.y = y;
  }
  
  changeAnimationType(type) {
    if(this.animationType == type)return;
    if(type == "非表示"){
      this.animationType = "非表示";
      return;
    }
    this.animation = null;
    this.animationType = type;
    this.frame = 0;
    let ani = this.animationData[type];
    this.animation = new Anime(ani.img, this.x + ani.x, this.y + ani.y, ani.w, ani.h, ani.widthAtOneFrame, ani.frameInterval, ani.isLoop);
    return ani.imagePatternNum * ani.frameInterval;//1サイクルにっかるフレーム数を返す。
  }
  
  frameNumAtOneCycle(type = this.animationType){
    let ani = this.animationData[type];
    return ani.imagePatternNum * ani.frameInterval;//1サイクルにっかるフレーム数を返す。
  }
  
  fadeinStart(){
    if(this.fadein || this.fadeout)return;
    this.opacity = 0;
    this.fadein = true;
  }
  
  fadeoutStart(){
    if(this.fadein || this.fadeout)return;
    this.fadeout = true;
  }
  
  update(){
    if(this.animation == null || this.animationType == "非表示")return;
    this.frame++;
    
    //フェードイン、フェードアウトの処理
    if(this.fadein){
      this.opacity += this.opacityChangeAtOneFrame;
      if(this.opacity>1){
        this.opacity = 1;
        this.fadein = false;
      }
    }
    if (this.fadeout) {
      this.opacity -= this.opacityChangeAtOneFrame;
      if (this.opacity < 0) {
        this.opacity = 0;
        this.fadeout = false;
      }
    }
    
    this.animation.update(this.frame,this.opacity);
  }
}

let effectAnimeDatas = {};
let effectAnimeNames = ["攻撃"];
let effectAnimeImageSrcs = ["animeimage/pipo-btleffect138.png"];
for (var i = 0; i < effectAnimeNames.length; i++) {
  let _img = new Image();
  _img.src = effectAnimeImageSrcs[i];
  effectAnimeDatas[effectAnimeNames[i]] = {
    //xとyは相対的にずらす場合の値。wとhは画像サイズではなく表示サイズ
    "play": { img: _img, x: 0, y: 0, w: 100, h: 100, widthAtOneFrame: 120,heightAtOneFrame:120,imagePatternNum:15, frameInterval: 3, isLoop: false }
  };
}

class EffectAnimation {
  constructor(_effectAnimeData, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.animationData = _effectAnimeData;
    this.animationType;
    this.animation;
    this.changeAnimationType("play");
    this.maxFrame = _effectAnimeData.play.frameInterval * _effectAnimeData.play.imagePatternNum;
  }

  setXY(x, y) {
    this.x = x;
    this.y = y;
    this.animation.x = x;
    this.animation.y = y;
  }

  changeAnimationType(type) {
    if (this.animationType == type) return;
    if (type == "非表示") {
      this.animationType = "非表示";
      return;
    }
    this.animation = null;
    this.animationType = type;
    this.frame = 0;
    let ani = this.animationData[type];
    this.animation = new Anime(ani.img, this.x + ani.x, this.y + ani.y, ani.w, ani.h, ani.widthAtOneFrame, ani.frameInterval, ani.isLoop,ani.heightAtOneFrame,ani.imagePatternNum);
    return ani.imagePatternNum * ani.frameInterval;//1サイクルにっかるフレーム数を返す。
  }
  
  frameNumAtOneCycle(type = this.animationType) {
    let ani = this.animationData[type];
    return ani.imagePatternNum * ani.frameInterval; //1サイクルにっかるフレーム数を返す。
  }

  update() {
    if(this.frame >= this.maxFrame){
      //エフェクトが終わったら自身を空っぽにする
      this.update = ()=>{};
      this.animation.img = null;
      return;
    }
    if (this.animation == null || this.animationType == "非表示") return;
    this.frame++;
    this.animation.update(this.frame);
  }
}


const stageDatas = {
  "初級":[
    {name:"敵_魚",hp:2000 /1000 ,atk:(_turn)=>{return 5 * randomNum(2,10)} },
    {name:"敵_魚",hp:5000 /1000 ,atk:(_turn)=>{if(_turn%3 ==0){return randomNum(70,80)}else{return 30}} }
  ]
};
