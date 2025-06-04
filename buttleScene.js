function objCopy(obj){
  return JSON.parse(JSON.stringify(obj));
}

function randomNum(_min = 0, _max = 10) {
  return Math.floor(Math.random() * (_max + 1 - _min) + _min);
}

class ButtleScene extends Scene{
  constructor(_nanido = "初級",_cardIndexes = [null,null,null,null,null],_status){
    super();
    //this.animeFrame = 0;
    
    this.nanido = _nanido
    this.stageData = stageDatas[_nanido];//例[ {name:"enemyName",hp:100,atk:10} ] data.js参照
    this.hierarchy = 1;//階層。
    this.maxHierarchy = this.stageData.length;
    this.turn = 1;//経過ターン数。hierarchyが増えると1にリセット。enemyの攻撃ダメージの引数に使用。
    this.enemy;
    this.enemyHp;
    this.enemyMaxHp;
    this.setEnemy = ()=>{//例this.enemy = {name:"enemyName",hp:100,atk:10}
      let _hierarchy = this.hierarchy;
      this.enemy = this.stageData[_hierarchy -1];
      this.enemyHp = this.enemy.hp;
      this.enemyMaxHp = this.enemy.hp;
    };
    this.setEnemy(1);
    
    this.cardIndexes = [].concat(_cardIndexes);
    this.status= objCopy(_status);
    //カードのスキルをthis.statusに反映
    this.cardSkills = [];//cardData[n].skillをいれる
    for (var i = 0; i < this.cardIndexes.length; i++) {
      if(this.cardIndexes[i]!= null){
        this.cardSkills.push([].concat(cardData[this.cardIndexes[i]].skill));
      }
    }
    for (var i = 0; i < this.cardSkills.length; i++) {
      if(this.cardSkills[i][0] == "atk"){
        this.status.red *= this.cardSkills[i][1];
        this.status.blue *= this.cardSkills[i][1];
        this.status.green *= this.cardSkills[i][1];
        this.status.yellow *= this.cardSkills[i][1];
        this.status.purple *= this.cardSkills[i][1];
      }else if(this.cardSkills[i][0] == "blue"){
        this.status.blue *= this.cardSkills[i][1];
      }
    }
    //this.statusを四捨五入する
    for(let propaty in this.status){
      this.status[propaty] = Math.round(this.status[propaty]);
    }
    
    this.bricks = ["red", "blue", "green", "yellow", "purple", "pink"];
    this.charactorNames = [];
    this.charactorSuu = 0;
    for (var i = 0; i < this.cardIndexes.length; i++) {
      if(this.cardIndexes[i] == null)this.charactorNames.push(null);
      if(this.cardIndexes[i] != null){
        this.charactorNames.push(cardData[this.cardIndexes[i]].charactor);
        this.charactorSuu++;
      }
    }
    if(isTest){
      this.charactorNames = ["ゆり","ゆり","ゆり","ゆり","ゆり"];
      this.cardIndexes = [0,1,0,1,0];
      this.charactorSuu = 5;
    }
    this.animationObjs = [];//CharactorAnimationオブジェクトを入れる。フレームごとの更新はされない。changeAnimationTypeメソッドでアニメーションを変更。
    //CharactorAnimationオブジェクトを設定。
    //最初にプレイヤーキャラクター
    for (var i = 0; i < this.charactorNames.length; i++) {
      if (this.charactorNames[i] == null) {
        //this.animationObjs.push({update:()=>{}});
        continue;
      }
      let _x = 300;
      if (i % 2 == 0) _x -= 50;
      this.animationObjs.push(new CharactorAnimation(charactorAnimeDatas[this.charactorNames[i]] ,_x,10 + 40*i) );
    }
    //次に敵アニメーション
    this.setEnemyAnime = ()=>{
      this.animationObjs[this.charactorSuu] = new CharactorAnimation(charactorAnimeDatas[this.stageData[this.hierarchy -1].name] ,45,80) ;
    };
    this.setEnemyAnime();
    
    
    
    this.animationObjsTypeChange = (type,index =0)=>{
      for (var i = 0; i < this.animationObjs.length; i++) {
        if(i == index)this.animationObjs[i].changeAnimationType(type);
      }
    };
    
    this.effectAnimationObjs = [];
    
    this.selectedBricks = []; //ブロック座標の配列をいれる。[縦,横]
    this.selectedColor = "";
    this.fallSpead = 12; //ブロックの落下速度
    this.dissaperBricks = [];//ブロックが消えたらthis.selectedBricksをここに移行する。
    
    this.maxTime = 50;
    this.timer = this.maxTime;
    this.faze = "階層開始";
    
    this.frame = 0;
    this.frameFunctions = [];//[frameNum,function]を入れる。そのframeになったらfunctionを行う。
    
    /*
    this.bricksSettei = {
      red: true,
      blue: true,
      green: true,
      yellow: true,
      purple: true,
      pink: true,
    };
    */
    
    this.diameter = 40; //ブロックの直径
    
    this.banmen = [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ];
    this.banmen2 = []; //描画用
    this.fall = []; //落下の処理用
    for (let i = 0; i < this.banmen.length; i++) {
      this.banmen2.push([].concat(this.banmen[0]));
      this.fall.push([].concat(this.banmen[0]));
    }
    this.maxfall = 0;
    this.nowfall = 0;
    this.fallFlag = false; //this.banmen2をthis.banmenと同期させる時に使用
    this.kijunten = [
      (canvas.width - this.diameter * this.banmen[0].length) / 2 + this.diameter / 2, //パズルが中央にくるように左上のブロックの中心座標を設定
      (canvas.height - this.diameter * this.banmen.length) / 2 + this.diameter / 2 //同上
    ]; //ブロック座標を計算する時の基準座標
    
    this.banmenSet(this.bricks);
    this.hanteiPoints = [[], [], [], [], [], [], [], [], [], [], [], []]; //draw時に一度だけ設定。ブロックの中心の座標を入れる。
    this.hanteiPointsFlag = false;
    
    //戦闘用
    this.scores = {red:0,blue:0,green:0,yellow:0,purple:0,pink:0};//消したブロックに応じて加算。ターンごとにリセット。
    this.combo = 0;//ブロックを消すごとに加算。ターンごとにリセット。
    this.playerMaxHp = this.status.hp;
    this.playerHp = this.playerMaxHp;
    if(isTest){
      //this.enemyHp = 10;
    }
    this.totalDamage = null; //攻撃後、代入。数値なら画面に表記する。
    
    //リザルト用
    this.maxDamage = 0;
    this.maxCombo = 0;
    this.totalTurn = 1;
  }
  
  banmenSet(_bricks = [].concat(this.bricks)) {
    for (let n = 0; n < this.banmen.length; n++) {
      for (let m = 0; m < this.banmen[n].length; m++) {
        let _brick = _bricks[randomNum(0, _bricks.length - 1)];
        this.banmen[n][m] = _brick;
        this.banmen2[n][m] = _brick;
      }
    }
  }
  
  returnTouchingBrick() {
    //まずタッチしているブロックを四角形の判定で求める。タッチしているか調べる対象を絞るため。
    let _x = this.kijunten[0] - this.diameter/2;
    let _y = this.kijunten[1] - this.diameter/2;
    let _zahyouX = (touch.x - _x)/ this.diameter;
    _zahyouX = Math.floor(_zahyouX);//一番左のブロックを0とする
    let _zahyouY = (touch.y - _y) / this.diameter;
    _zahyouY = Math.floor(_zahyouY);//画面外の一番上のブロックを0とする
    //範囲外ならreturn[-1,-1]
    if(_zahyouX < 0 || _zahyouX >= this.banmen[0].length)return [-1,-1];
    if(_zahyouY < this.banmen.length/2 || _zahyouY >= this.banmen.length)return [-1,-1];
    //対象のブロックの中心からの距離をもとに判定
    let _kyori_nijou = (
      (touch.x - this.hanteiPoints[_zahyouY][_zahyouX][0]) ** 2 +
      (touch.y - this.hanteiPoints[_zahyouY][_zahyouX][1]) ** 2
    );
    if (_kyori_nijou < (this.diameter / 2) ** 2) return [_zahyouY, _zahyouX];
    return [-1,-1];
    
    /* すべてのブロックの中心点からの距離を求める方法。計算量が多いため変更。
    for (let n = 6; n < this.hanteiPoints.length; n++) {
      //下半分のみ
      for (let m = 0; m < this.hanteiPoints[n].length; m++) {
        //ブロックの中心とtouch座標との距離がブロック半径以下ならブロック座標を返す。ブロックをタッチしていないなら[-1,-1]を返す。
        let _kyori_nijou = (
          (touch.x - this.hanteiPoints[n][m][0]) ** 2 +
          (touch.y - this.hanteiPoints[n][m][1]) ** 2
        );
        if (_kyori_nijou < (this.diameter / 2)**2 ) return [n, m];
      }
    }
    return [-1, -1];
    */
  }
  
  update(frame = 0){
    this.frame++;
    for (var i = 0; i < this.frameFunctions.length; i++) {
      if(this.frameFunctions[i]==null)continue;//nullならcontinue
      if(this.frame == this.frameFunctions[i][0])this.frameFunctions[i][1]();//frameがぴったりならfunctionを実行
      if(this.frame > this.frameFunctions[i][0])this.frameFunctions[i] = null;//すでに経過しているならnullにする
    }
    
    super.update();
    for (var i = 0; i < this.animationObjs.length; i++) {
      this.animationObjs[i].update();
    }
    for (var i = 0; i < this.effectAnimationObjs.length; i++) {
      this.effectAnimationObjs[i].update();
    }
  }
  
  setObjects(){
    //パズルの表示
    if (this.maxfall > 0) this.nowfall += this.fallSpead; //落下を加算
    let diameter = this.diameter; //ブロックの大きさ(直径)
    const x1 = this.kijunten[0];
    const y1 = this.kijunten[1];
    //ブロック座標から、ブロックの位置の中心のピクセル座標を返す関数
    function returnBrickPosition(_n, _m) {
      return [x1 + _m * diameter, y1 + _n * diameter];
    }
  
    for (let n = 0; n < this.banmen.length; n++) {
      for (let m = 0; m < this.banmen[n].length; m++) {
        let _brick = this.banmen2[n][m];
        if (_brick == "無") continue; //無なら処理しない
        //落下中かつdissaperBricksにあるブロックならcontinueして非表示にする
        if (this.maxfall > 0) {
          let _isSelected = false;
          for (let _zahyou of this.dissaperBricks) {
            if (_zahyou[0] == n && _zahyou[1] == m) {
              _isSelected = true;
              continue;
            }
          }
          if (_isSelected) continue;
        }
        let _color = colors[_brick];
        //this.fallを適用させる
        let _fall = this.fall[n][m];
        if (_fall == null || _fall == NaN || _fall == undefined) _fall = 0;
        if (_fall > 0) {
          _fall = Math.min(_fall, this.nowfall);
        }
        
        let _position = returnBrickPosition(n, m);
        //初回に判定の基準点を設定
        if (this.hanteiPointsFlag == false) {
          this.hanteiPoints[n].push([].concat(_position));
        }
        
        //オブジェクトを設定
        if (_brick != "pink") {
          this.addCercle(_position[0],_position[1] + _fall,diameter/2,_color);
        } else {
        //桃は正方形にする
        this.addRect(_position[0] - diameter / 2 +1,
          _position[1] - diameter / 2 + _fall +1,
          diameter -2,diameter -2,_color)
        }
      }
    } //for終了
    
    //this.hanteiPointFlagを変更。初回に一度だけ行う
    if (this.hanteiPointsFlag == false) this.hanteiPointsFlag = true;
    //this.maxfallをfallSpead分減らす
    if (this.maxfall > 0) {
      this.maxfall -= this.fallSpead;
      this.maxfall = Math.max(0, this.maxfall);
    }
    
    //lineの描画
    if (touch.type == "touchmove" && this.selectedBricks.length >= 2 && this.maxfall == 0) {
      for (let n = 0; n < this.selectedBricks.length - 1; n++) {
        let _p1 = returnBrickPosition(this.selectedBricks[n][0], this.selectedBricks[n][1]);
        let _p2 = returnBrickPosition(
          this.selectedBricks[n + 1][0],
          this.selectedBricks[n + 1][1]
        );
        this.addLine(_p1[0],_p1[1],_p2[0],_p2[1],"#aaa",10,"screen",1);
      }
    }
    
    //上半分を隠す
    this.addRect(0,0,canvas.width,canvas.height/2,"#444");
    
    //タイマー
    this.addRect("center",canvas.height/2 -15,this.diameter * 7 +10,15,"#ccc");
    this.addRect("center",canvas.height/2 -10,this.diameter * 7 *(this.timer / this.maxTime),5,"red");
    
    //hp
    this.addRect("center", canvas.height / 2 - 30, this.diameter * 7 + 10, 15, "#ccc");
    this.addRect("center", canvas.height / 2 - 25, this.diameter * 7 * (this.playerHp / this.playerMaxHp), 5, "#6b7");
    this.addText("HP:" + this.playerHp + "/" + this.playerMaxHp,"center",canvas.height / 2 - 28,null,12,null,"#000");
    
    //コンボ
    if(this.combo > 0){
      let damageText = "";
      if(this.totalDamage != null)damageText = "   Total " + this.totalDamage + " damage"
      this.addText(this.combo + "combo" + damageText,60,0,null,15);
    }
    
    //トータルダメージ
    //if(this.totalDamage != null)this.addText("Total " + this.totalDamage + " damage",canvas.width/2,0,null,15,null,"yellow");
    
    //hierarchy開始時
    if(this.faze == "階層開始" || this.faze == "階層開始2"){
      //wave(this.hierarchy)表示
      this.addRect(0,canvas.height/2 - 30,canvas.width,60,"#fff");
      this.addText("WAVE " + this.hierarchy + "/" + this.maxHierarchy,canvas.width /2,canvas.height /2,null,30,"baseCenter","black");
      if(this.faze == "階層開始"){
        this.faze = "階層開始2";
        this.frameFunctions.push([
          this.frame + 100,
         ()=>{this.faze = "攻撃前";}
        ]);
      }
    }
    
    //リザルト
    if(this.faze == "リザルト"){
      let takasakijun = canvas.height/2;
      this.addRect(0,takasakijun,canvas.width,canvas.height/2,"white");
      this.addRect(2,takasakijun +2,canvas.width-4,canvas.height/2 -4,"black");
      this.addText(this.nanido + "クリア!","center",takasakijun + 10);
      this.addText("経過ターン数: " + this.totalTurn + "ターン","center",takasakijun + 35,200,15);
      this.addText("最大ダメージ: " + this.maxDamage,"center",takasakijun + 35 +20,200,15);
      this.addText("最大コンボ数: " + this.maxCombo,"center",takasakijun + 35 + 20*2,200,15);
      let cardImageUnder = 0;//カード画像の描画の下端
      for (var i = 0; i < this.cardIndexes.length; i++) {
        //カード画像の描画
        if(this.cardIndexes[i] == null)continue;
        let _x = 2 + (canvas.width - 4) / this.cardIndexes.length * i;
        let _y = takasakijun + 35 + 20*3;
        let _w = (canvas.width - 4) / this.cardIndexes.length;
        let _h = _w * 3/2;
        this.addSprite(cardImages[this.cardIndexes[i]],_x,_y,_w,_h);
        if(cardImageUnder == 0)cardImageUnder = _y + _h;
      }
      let finishButtonEvent = ()=>{
        game.setBgm("schoolDays");
        menuScene1.gameClear(this.nanido);
        game.fadeFunction(menuScene1);
        //this = null;
      };
      this.addRect(canvas.width/2 - 50,cardImageUnder + (canvas.height - 2 - cardImageUnder)/2 -20,100,40,"#ddd",null,{clickevent:finishButtonEvent});
      this.addText("OK",canvas.width/2,cardImageUnder + (canvas.height - 2 - cardImageUnder)/2,null,20,"baseCenter","black");
    }
    
  }//setObjects()終了
  
  touchevent(){
    super.touchevent();
    
    if (touch.type == "touchstart") {
      if (this.selectedBricks.length == 0 && (this.faze == "攻撃前" || this.faze == "攻撃中") ) {
        let _zahyou = this.returnTouchingBrick();
        if (_zahyou[0] >= 6) {
          //下半分のみ
          //ブロックがタッチされている
          this.selectedBricks.push([].concat(_zahyou));
          this.selectedColor = this.banmen[_zahyou[0]][_zahyou[1]];
        }
      }
    } else if (touch.type == "touchmove") {
      if (this.selectedBricks.length != 0 && (this.faze == "攻撃前" || this.faze == "攻撃中")) {
        let _zahyou = this.returnTouchingBrick();
        if (_zahyou[0] >= 6) {
          //下半分のみ
          //ブロックがタッチされている
          let _isSameColor =
            this.selectedColor == this.banmen[_zahyou[0]][_zahyou[1]];
          if (_isSameColor) {
            //同じ色
            let _isNew = true;
            for (let n = 0; n < this.selectedBricks.length; n++) {
              if (
                this.selectedBricks[n][0] == _zahyou[0] &&
                this.selectedBricks[n][1] == _zahyou[1]
              )
                _isNew = false;
            }
            if (_isNew) {
              //選択済みでない
              let _isTonari = false;
              let _lastZahyou = this.selectedBricks[this.selectedBricks.length - 1];
              if (
                Math.abs(_lastZahyou[0] - _zahyou[0]) <= 1 &&
                Math.abs(_lastZahyou[1] - _zahyou[1]) <= 1
              )
                _isTonari = true;
              if (_isTonari) {
                //隣り合う
                this.selectedBricks.push([].concat(_zahyou));
              }
            }
          }
        }
      }
    } else if (touch.type == "touchend") {
      if (this.selectedBricks.length == 1 && (this.faze == "攻撃前" || this.faze == "攻撃中"||this.faze == "攻撃後")) {
        this.selectedBricks = [];
        this.selectedColor = "";
      }
      if (this.selectedBricks.length >= 2 && (this.faze == "攻撃前" || this.faze == "攻撃中"||this.faze == "攻撃後")) {
        
        let brickDissaperFunction = ()=>{
          
          this.fallFlag = true;
          
          //timerに加算
          if(this.timer > 0){
            this.timer += this.selectedBricks.length -1;
            if(this.timer > this.maxTime)this.timer = this.maxTime;
          }
          
          //スコアの処理
          //回復なら即座に反映
          if(this.selectedColor == "pink"){
            if(this.playerHp < this.playerMaxHp)this.playerHp = Math.min( this.playerHp + Math.round(this.selectedBricks.length * this.status.rcv * (1 + 0.1 * this.combo) /50),this.playerMaxHp);
          }else{
            this.scores[this.selectedColor] += this.selectedBricks.length * (1 + 0.1 * this.combo);
          }
          //コンボ数を増やす
          this.combo++;
          
          for (let _zahyou of this.selectedBricks) {
            //消えるブロックとその上にあるブロックすべてに対して、this.fallに加算
            for (let _h = 0; _h < _zahyou[0]; _h++) {
              this.fall[_h][_zahyou[1]] += this.diameter;
            }
          }
          //this.maxfallを更新
          for (let n = 0; n < this.fall.length; n++) {
            for (let m = 0; m < this.fall[n].length; m++) {
              this.maxfall = Math.max(this.maxfall, this.fall[n][m]);
            }
          }
          //this.banmenを変更
          //消えたブロックを無にする
          for (let _zahyou of this.selectedBricks) {
            this.banmen[_zahyou[0]][_zahyou[1]] = "無";
          }
          //無を上へ移動させる
          for (let c = 0; c < this.banmen.length - 1; c++) {
            //回数
            for (let n = 0; n < this.banmen.length; n++) {
              for (let m = 0; m < this.banmen[n].length; m++) {
                let _n = this.banmen.length - 1 - n;
                if (_n == 0) continue;
                if (this.banmen[_n][m] == "無") {
                  //上と入れ換える
                  this.banmen[_n][m] = this.banmen[_n - 1][m];
                  this.banmen[_n - 1][m] = "無";
                }
              }
            }
          }
          //無に代入する
          for (let n = 0; n < this.banmen.length; n++) {
            for (let m = 0; m < this.banmen[n].length; m++) {
              if (this.banmen[n][m] == "無") {
                this.banmen[n][m] = this.bricks[
                  randomNum(0, this.bricks.length - 1)
                ];
              }
            }
          }
          this.dissaperBricks = [].concat(this.selectedBricks);
          this.selectedBricks = [];
          
          if (this.selectedBricks.length == 1) {
            this.selectedBricks = [];
            this.selectedColor = "";
          }
        }
        brickDissaperFunction();
      
        //タイマーをセット
        if (this.faze == "攻撃前") {
          this.faze = "攻撃中";
          let timerSet = setInterval(() => {
            this.timer -= 1;
            //タイマーが0になった時の処理
            if (this.timer <= 0) {
              clearInterval(timerSet);
              this.timer = 0;
              this.faze = "攻撃後";
              //攻撃モーション
              let frameToFinishPlayerAtack = 0;//攻撃モーションにかかるframe
              for (var i = 0; i < this.charactorSuu; i++) {
                this.animationObjsTypeChange("攻撃",i);
                let _n = this.animationObjs[i].frameNumAtOneCycle();
                frameToFinishPlayerAtack = Math.max(frameToFinishPlayerAtack,_n);
              }
              
              //現在選択中のブロックをtouchendするように処理する
              if (this.selectedBricks.length == 1) {
                this.selectedBricks = [];
                this.selectedColor = "";
              }
              if(this.selectedBricks.length >= 2)brickDissaperFunction();
              //ダメージ量の計算
              let brickVariation = ["red","blue","green","yellow","purple"];
              let _damage = 0;
              for (var i = 0; i < brickVariation.length; i++) {
                let _col = brickVariation[i];
                let _dame = Math.round(this.scores[_col] * this.status[_col]);
                _damage += _dame;
              }
              //リザルト用に最大ダメージと最大コンボ数を記録
              this.maxDamage = Math.max(this.maxDamage,_damage);
              this.maxCombo = Math.max(this.maxCombo,this.combo);
              //敵のhpを減らす
              this.enemyHp -= _damage;
              let isHierarchyClear = false;
              if(this.enemyHp <= 0)isHierarchyClear = true;
              //total damageを画面に表記するためにthis.totalDamageを更新
              //まず、アタックエフェクトにかかるframeをframeToFinishPlayerAtackに反映
              let _enemyAni = this.animationObjs[this.charactorSuu];//敵アニメーションの中央にエフェクトがくるよう計算
              let _atackAniData = effectAnimeDatas["攻撃"];
              let atackEffect = new EffectAnimation(_atackAniData, _enemyAni.x + _enemyAni.animation.w/2 - _atackAniData.play.w/2 , _enemyAni.y + _enemyAni.animation.h/2 - _atackAniData.play.h/2);
              let frameToFinishAtackEffect = atackEffect.frameNumAtOneCycle();
              frameToFinishPlayerAtack = Math.max(frameToFinishPlayerAtack,frameToFinishAtackEffect);
              this.frameFunctions.push([
                this.frame + Math.round(frameToFinishPlayerAtack/2),
                ()=>{
                  this.totalDamage = _damage;
                  this.effectAnimationObjs.push(atackEffect);
                }
              ]);
              
              /*下記を上記に変更。frameの値でタイミングを計るようにするため
              setTimeout(()=>{
                this.totalDamage = _damage;
                this.effectAnimationObjs.push(new EffectAnimation(effectAnimeDatas["攻撃"],45,80));
                setTimeout(() => {
                   this.totalDamage = null;
                }, 1500);
              },500);
              */
              
              let marginFrameNum = 20;//プレイヤーの攻撃と敵の攻撃との間に設定するframe数。
              //敵が生き残っている場合
              if(isHierarchyClear == false){
                //敵の攻撃
                this.frameFunctions.push([
                  this.frame + frameToFinishPlayerAtack + marginFrameNum,
                  ()=>{
                    //エフェクト
                    for (var i = 0; i <this.charactorSuu; i++) {
                      let _c = this.animationObjs[i];//キャラクターの中央にエフェクトがくるように計算
                      let _e = effectAnimeDatas["攻撃"].play;
                      this.effectAnimationObjs.push(new EffectAnimation(effectAnimeDatas["攻撃"], _c.x + _c.animation.w/2 - _e.w/2, _c.y + _c.animation.h/2 - _e.h/2));
                    }
                    //プレイヤーのhpを減らす
                    this.playerHp -= this.enemy.atk(this.turn);
                     if (this.playerHp < 0) this.playerHp = 0;
                  }
                ])
                //次のターンになる
                this.frameFunctions.push([
                  this.frame + frameToFinishPlayerAtack +frameToFinishAtackEffect +  marginFrameNum*2,
                  ()=>{
                    if (this.playerHp == 0) {
                      //プレイヤーのhpが0ならタイトルに戻す
                       menuScene1.flag = 0;
                       game.fadeFunction(new TitleScene());
                    }else{
                      this.faze = "攻撃前";
                       for (var i = 0; i < this.charactorSuu; i++) {
                          this.animationObjsTypeChange("待機", i);
                        }
                      this.timer = this.maxTime;
                      this.scores = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, pink: 0 };
                      this.combo = 0;
                      this.turn++;
                      this.totalTurn++;
                      this.totalDamage = null;//トータルダメージ表記を消す
                    }
                  }
                ]);
                /*
                setTimeout(()=>{
                  this.playerHp -= this.enemy.atk;
                  if(this.playerHp < 0)this.playerHp = 0;
                  if(this.playerHp == 0){
                    menuScene1.flag = 0;
                    game.fadeFunction(new TitleScene());
                  }
                },2000);
                setTimeout(() => {
                  this.faze = "攻撃前";
                  for (var i = 0; i < this.charactorSuu; i++) {
                    this.animationObjsTypeChange("待機", i);
                   }
                   this.timer = this.maxTime;
                   this.scores = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, pink: 0 };
                   this.combo = 0;
                 }, 1000 * 3);
                 */
              }else if(isHierarchyClear == true){
                //敵をフェードアウト
                this.frameFunctions.push([
                  this.frame + frameToFinishPlayerAtack + marginFrameNum,
                  ()=>{
                    this.animationObjs[this.charactorSuu].fadeoutStart();
                  }
                ]);
                //階層が最後じゃないなら次の階層へ
                if(this.hierarchy != this.maxHierarchy){
                  this.frameFunctions.push([
                    this.frame + frameToFinishPlayerAtack + marginFrameNum + 100,
                    ()=>{
                      this.hierarchy++;
                      this.faze = "階層開始";
                      for (var i = 0; i < this.charactorSuu; i++) {
                        this.animationObjsTypeChange("待機", i);
                      }
                      this.timer = this.maxTime;
                      this.scores = { red: 0, blue: 0, green: 0, yellow: 0, purple: 0, pink: 0 };
                      this.combo = 0;
                      this.turn = 1;
                      this.totalTurn++;
                      this.totalDamage = null; //トータルダメージ表記を消す
                      this.setEnemy();//this.enemyやthis.enemyHp、this.enemyMaxHpの変更
                      this.setEnemyAnime();
                      this.animationObjs[this.charactorSuu].fadeinStart();
                    }
                  ]);
                }else if(this.hierarchy == this.maxHierarchy){
                  //制覇
                  this.frameFunctions.push([
                    this.frame + frameToFinishPlayerAtack + marginFrameNum + 100,
                    ()=>{
                      this.faze = "リザルト";
                      game.dontTouch = 10;
                    }
                  ]);
                  
                }
              }
              
              
            }//if(this.timer<=0)終了
          }, 100);//timerSet終了
        }
      }
    } //touchendの処理終了

    //this.banmen2の同期
    if (this.maxfall <= 0 && this.fallFlag) {
      this.refresh();
      this.fallFlag = false;
      for (let n = 0; n < this.banmen.length; n++) {
        this.banmen2[n] = [].concat(this.banmen[n]);
      }
    }
  }
  
  refresh() {
    this.selectedBricks = [];
    this.dissaperBricks = [];
    this.selectedColor = "";
    this.maxfall = 0;
    this.fallFlag = false;
    this.nowfall = 0;
    this.fall = [];
    for (let n = 0; n < this.banmen.length; n++) {
      let _arr = [];
      for (let m = 0; m < this.banmen[n].length; m++) {
        _arr.push(0);
      }
      this.fall.push(_arr);
    }
  }
}


if(isButtleTest){
  buttleScene = new ButtleScene("初級",[0,null,null,null,null],this.status = {red:100,blue:0,green:0,yellow:0,purple:0,hp:100,rcv:100});
  game.scene = buttleScene;
}
if(isClearTest){
  menuScene1.gameClear("初級");
  game.scene = menuScene1;
}
