class Text{
  constructor(_text,_x,_y,_maxWidth = null,_color){
    this.text = _text;
    this.x = Number(_x);
    this.y = Number(_y);
    this.maxWidth = _maxWidth;
    this.font = "20px sans serif"
    this.color = _color;
    this.textAlign = "start";
    this.textBaseline = "top";
    this.width;
  }
  returnWH(){
    let _ctx = document.getElementById("canvas").getContext("2d");
    _ctx.font = this.font;
    let _measure = _ctx.measureText(this.text);
    if(this.maxWidth != null)return{width:Math.min(this.maxWidth,_measure.width),height:_measure.actualBoundingBoxAscent +_measure.actualBoundingBoxDescent};
    return {width:_measure.width ,height:_measure.actualBoundingBoxAscent +_measure.actualBoundingBoxDescent};

  }
  update(){
    let _ctx = document.getElementById("canvas").getContext("2d");
    _ctx.textAlign = this.textAlign;
    _ctx.textBaseline = this.textBaseline;
    _ctx.font = this.font;
    _ctx.fillStyle = this.color;
    if(this.maxWidth == null){
      _ctx.fillText(this.text,this.x,this.y);
    }else{
      _ctx.fillText(this.text,this.x,this.y,this.maxWidth);
    }
  }
  touchevent(){}
  clickevent(){}
  isTouch(){
    if( touch.x > this.x  && touch.x < this.x + this.returnWH().width && touch.y > this.y && touch.y < this.y + this.returnWH().height){
      return true;
    }
    return false;
  }
};

class Rect{
  constructor(_x,_y,_w,_h,_color,_opacity = 1){
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    this.color = _color;
    this.opacity = _opacity;
  }
  update(){
    let _ctx = document.getElementById("canvas").getContext("2d");
    _ctx.fillStyle = this.color;
    _ctx.globalAlpha = this.opacity;
    _ctx.fillRect(this.x,this.y,this.w,this.h);
    _ctx.globalAlpha = 1;
  }
  touchevent(){}
  clickevent(){}
  isTouch(){
    if ( touch.x > this.x && touch.x < this.x + this.w && touch.y > this.y && touch.y < this.y + this.h) {
  return true;
}
return false;
  }
}

class Sprite{
  constructor(_img,_x,_y,_w = 0,_h =0){
    this.img = _img;
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    if(_w == 0)this.w = _img.width;
    if(_h == 0)this.h = _img.height;
  }
  update(){
    let _ctx = document.getElementById("canvas").getContext("2d");
    if(this.w == 0 || this.h == 0){
      _ctx.drawImage(this.img,this.x,this.y);
    }else{
      _ctx.drawImage(this.img,this.x,this.y,this.w,this.h);
    }
  }
  touchevent(){}
  clickevent(){}
  isTouch(){
    if( touch.x > this.x && touch.x < this.x + this.w && touch.y > this.y && touch.y < this.y + this.h){
      return true;
    }
    return false;
  }
}
/*
複数画像でアニメーションさせる場合
class Anime {
  constructor(_imgs = [], _x, _y, _w = 0, _h = 0,_frameInterval = 10) {
    this.imgs = [].concat(_imgs);
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    if (_w == 0) this.w = _imgs[0].width;
    if (_h == 0) this.h = _imgs[0].height;
    this.frameInterval = _frameInterval;
  }
  update(frame) {
    let _ctx = document.getElementById("canvas").getContext("2d");
    let _image = this.imgs[Math.floor( frame / this.frameInterval ) % this.imgs.length];
    if (this.w == 0 || this.h == 0) {
      _ctx.drawImage(_image, this.x, this.y);
    } else {
      _ctx.drawImage(_image, this.x, this.y, this.w, this.h);
    }
  }
  touchevent() {}
  clickevent() {}
  isTouch() {
    if (touch.x > this.x && touch.x < this.x + this.w && touch.y > this.y && touch.y < this.y + this.h) {
      return true;
    }
    return false;
  }
}
*/

//一枚の画像(スプライトシート)でアニメーションさせる場合
class Anime {
  constructor(_img, _x, _y, _w = null, _h = null,_widthAtOneFrame = 64, _frameInterval = 10,_isLoop = true,_heightAtOneFrame = null,_imagePatternNum = 0) {
    //_imagePatternNumは_heightAtOneFrameを設定時にのみ必須。
    this.img = _img;
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.h = _h;
    if (_w == null) this.w = _img.width;
    if (_h == null) this.h = _img.height;
    this.widthAtOneFrame = _widthAtOneFrame;
    this.heightAtOneFrame = _heightAtOneFrame;
    this.imagePatternNum = 0;
    if(_heightAtOneFrame == null)this.imagePatternNum = Math.floor(this.img.width / this.widthAtOneFrame);
    if(_heightAtOneFrame != null)this.imagePatternNum = _imagePatternNum;
    //_heightAtOneFrame設定時用に、パターンが配列されている縦*横の数を算出
    if(_heightAtOneFrame != null){
      this.yoko = Math.floor(this.img.width / _widthAtOneFrame);
      //this.tate = Math.floor(this.img.height / _heightAtOneFrame);
    }
    
    this.frameInterval = _frameInterval;
    this.isLoop = _isLoop;
  }
  update(frame,_opacity = 1) {
    if(_opacity == 0)return;
    
    let _ctx = document.getElementById("canvas").getContext("2d");
    let _x1;//画像ファイルから抜き出す座標
    let _y1;
    if(this.heightAtOneFrame == null){
      if(this.isLoop == false && frame >= this.imagePatternNum * this.frameInterval){//フレームが超過していたら繰り返さず、最後の絵を表示し続ける。
        _x1 = ( (this.img.width / this.widthAtOneFrame) -1 ) * this.widthAtOneFrame ;
      }else{
        _x1 = Math.floor(frame / this.frameInterval) % Math.floor(this.img.width / this.widthAtOneFrame) * this.widthAtOneFrame;
      }
      _ctx.globalAlpha = _opacity;
      _ctx.drawImage(this.img,_x1,0,this.widthAtOneFrame,this.img.height,this.x, this.y, this.w, this.h);
      _ctx.globalAlpha = 1;
    }else if(this.heightAtOneFrame != null){
      let nowImagePatternNum = Math.floor(frame / this.frameInterval);//frameから、現在どのパターンの画像か計算
      if(this.isLoop == true){
        nowImagePatternNum = nowImagePatternNum % this.imagePatternNum;
      }else if(this.isLoop == false && nowImagePatternNum > this.imagePatternNum){
        nowImagePatternNum = this.imagePatternNum;
      }
      //_x1,_y1の算出
      _x1 = ( nowImagePatternNum % this.yoko )* this.widthAtOneFrame;
      _y1 = Math.floor( nowImagePatternNum / this.yoko ) * this.heightAtOneFrame;
      _ctx.globalAlpha = _opacity;
      _ctx.drawImage(this.img,_x1,_y1,this.widthAtOneFrame,this.heightAtOneFrame,this.x, this.y, this.w, this.h);
      _ctx.globalAlpha = 1;
    }
  }
  touchevent() {}
  clickevent() {}
  isTouch() {
    if (touch.x > this.x && touch.x < this.x + this.w && touch.y > this.y && touch.y < this.y + this.h) {
      return true;
    }
    return false;
  }
}

class Cercle{
  constructor(_x, _y, _hankei,_color = "black",_isStroke = false,_lineWidth =3) {
    this.x = _x;
    this.y = _y;
    this.radius = _hankei;
    this.color = _color;
    this.isStroke = _isStroke
    this.lineWidth = _lineWidth;
  }
  update() {
    let _ctx = document.getElementById("canvas").getContext("2d");
    _ctx.beginPath();
    _ctx.fillStyle = this.color;
    _ctx.lineWidth = this.lineWidth;
    _ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    if(this.isStroke == false)_ctx.fill();
    if(this.isStroke == true)_ctx.stroke();
    _ctx.closePath();
  }
  touchevent() {}
  clickevent(){}
  isTouch() {
    if ( Math.sqrt( (touch.x - this.x)**2 + (touch.y - this.y)**2 ) < this.radius ) {
      return true;
    }
    return false;
  }
}

class Line{
  constructor(_x1,_y1,_x2,_y2,_color,_lineWidth, _globalCompositeOperation = "source-over",_opacity = 1){
    this.point1 = {x:_x1,y:_y1};
    this.point2 = {x:_x2,y:_y2};
    this.color = _color;
    this.lineWidth = _lineWidth;
    this.globalCompositeOperation = _globalCompositeOperation;
    this.opacity = _opacity;
  }
  update(){
    let _ctx = document.getElementById("canvas").getContext("2d");
    _ctx.beginPath();
    _ctx.strokeStyle = this.color;
    _ctx.lineWidth = this.lineWidth;
    _ctx.globalCompositeOperation = this.globalCompositeOperation;
    _ctx.globalAlpha = this.opacity;
    _ctx.lineJoin = "round";
    _ctx.moveTo(this.point1.x,this.point1.y);
    _ctx.lineTo(this.point2.x, this.point2.y);
    _ctx.lineTo(this.point1.x, this.point1.y);
    _ctx.lineTo(this.point2.x, this.point2.y);
    _ctx.stroke();
    _ctx.closePath();
    _ctx.globalCompositeOperation = "source-over";
    _ctx.globalAlpha = 1;
  }
  touchevent(){}
  clickevent(){}
  isTouch(){return false;}
}
