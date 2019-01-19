
cc.Class({
    extends: cc.Component,

    properties: {
        mapView : {
            default : null,
            type : cc.Node
        },
        resultWnd : {
            default : null,
            type : cc.Node
        },
        backGround : {
            default : null,
            type : cc.Node
        }

    },

    onLoad () {},

    addAudio () {
        cc.loader.loadRes("prefab/audio",cc.Prefab,function(err,audio){
            if(!err) {
                this.audio = cc.instantiate(audio);
                this.node.addChild(this.audio);
                
            }
        }.bind(this));
    },

    initData () {
        this.selectMat = [];
        this.gamePlay = false;
        this.selectCount = 0;
        this.monCount = 0;
        this.preNode = null;

        this.matCount = 0;
        for(let i=0; i< vv.matTypeOfNum.length; i++) {
            if(vv.matTypeOfNum[i] >= 1) {
                this.matCount++;
            }
            if(vv.matTypeOfNum[i] >= 10) {
                this.selectMat[this.monCount] = [];
                this.selectMat[this.monCount].push(vv.material[i]);
                this.monCount++;
            }
        }

        
    },

    getPreColor () {
        let length = this.selectMat.length;
        if(length === 0 ) return;
        let preN = this.selectMat[length-1];
        let name = preN.name; 

        if(name === "monster") {
            let monsterJs = preN.getComponent(vv.monsterJs);
            return monsterJs.getFloorCol();
        }else {
            let cookieJs = preN.getComponent(vv.cookieJs);
            return cookieJs.getFloorCol();
        }
    },

    getNodeJs (node) {
        let nodeJs;
        let name = node.name;
        if(name === "monster") {
            nodeJs = node.getComponent(vv.monsterJs);
        }else if(name === "oneCookie"){
            nodeJs = node.getComponent(vv.cookieJs);
        } else {
            nodeJs = null;
        }
        return nodeJs;
    },

    getClickIdx(event) {
        let mapContentSize = this.mapView.getContentSize();
        let mapWidth = mapContentSize.width;
        let mapHeight = mapContentSize.height;
        let winSize = cc.director.getWinSize();

        let touchPos = event.touch.getLocation();
       // let p = touch.getLocation();
        // mapView 左下脚的相对于window而言的位置
        let pos = cc.v2(- mapWidth / 2, - mapHeight / 2)   
        let posAr = this.mapView.convertToWorldSpaceAR(pos); 

         //如果点击位置不在map范围内直接返回。
        if(touchPos.x < posAr.x || touchPos.x > posAr.x + mapWidth) return -1;
        if(touchPos.y < posAr.y || touchPos.y > posAr.y + mapHeight) return -1;

        let distanceH = touchPos.y - posAr.y;
        let rowNum = vv.row - Math.ceil(distanceH / vv.cellHeight) + 1;
        let distanceW = touchPos.x - posAr.x;
        let columnNum = Math.ceil(distanceW / vv.cellWidth);
        let num = (rowNum - 1) * vv.column + columnNum - 1;
        if(num < 0 || num >= vv.matTypeOfNum.length) {
            num = -1;
        }
        return num;
    },
    
    //恢复sIdx 之后的所有cookie状态
    resumeAfterCookie(sIdx) {
        if(sIdx === -1) return;
        let nodeJs;
        for(let i = sIdx + 1; i < this.selectMat.length;) {
            nodeJs = this.getNodeJs(this.selectMat[i]);
            nodeJs.unUpdateFloor();
            nodeJs.isClick = false;
            this.selectMat.splice(i,1);
            this.selectCount--;
        }
    },

    touchStarCall(event) {
        let idx = this.getClickIdx(event);
        if(idx === -1) return;
        //如果被点中的是monster,播放声音
        let matType = vv.matTypeOfNum[idx];
        let nodeJs = this.getNodeJs(vv.material[idx]);
        if(matType == 0) return;
        if(matType >= 10) {
           this.audio.getComponent(vv.audioHelpJs).playMonster();
            if( !nodeJs.isClick) {
                this.selectMat.push(vv.material[idx])
                this.selectCount++;
                nodeJs.isClick = true;
                this.gamePlay = true;
                return;
            }
            //点击到cookie未点中状态时
        } else if(!nodeJs.isClick) return;

        //点击的是已经被击中的情况：
        let sIdx = this.selectMat.indexOf(vv.material[idx]);
        this.resumeAfterCookie(sIdx);

        this.gamePlay = true;
    },

    touchMoveCall(event) {
        if(!this.gamePlay) return;
        let curIdx = this.getClickIdx(event);
        if(curIdx === -1) return;
       // curIdx = 1;
        let curNode = vv.material[curIdx];
        let curNodeJs = this.getNodeJs(curNode);
        if(curNodeJs === null) return;   //不可移动瓷砖时 return
        //cookie 已经为点击状态时,后面的选中饼干恢复。
        if(curNodeJs.isClick) {
            let sIdx = this.selectMat.indexOf(curNode);
            this.resumeAfterCookie(sIdx);

        }
        let selectLength = this.selectMat.length;
        let preNode = this.selectMat[selectLength-1];
        let preNodeJs = this.getNodeJs(preNode);
        let preNodePosX = preNodeJs.posX;
        let preNodePosY = preNodeJs.posY;
        let preNodeType = preNodeJs.value;

        let curNodePosX = curNodeJs.posX;
        let curNodePosY = curNodeJs.posY;
        let curNodeType = curNodeJs.value;

        //下一个Node是否为 上右下左 方向
        if(preNodePosY + 1 === curNodePosY && preNodePosX === curNodePosX) {}
        else if(preNodePosY === curNodePosY && preNodePosX + 1 === curNodePosX) {}
        else if(preNodePosY -1 === curNodePosY && preNodePosX === curNodePosX) {}
        else if(preNodePosY === curNodePosY && preNodePosX - 1 === curNodePosX) {}
        else return;

        if(preNodeType >= 10 || preNodeType <= curNodeType) {
            let preCol = this.getPreColor();
            curNodeJs.updateFloor(preCol)
            this.selectMat.push(curNode);
            this.selectCount++;
            curNodeJs.isClick = true;
        }
        if(this.selectCount == this.matCount) {
            this.scheduleOnce(function(){
                this.resultWnd.active = true;
                this.backGround.active = true;
            },0.6);

        }
    },

    touchEndCall(event) {
        this.gamePlay = false;
    },

    nextButtonCallback() {
        vv.selectLevel++;
        cc.director.loadScene("game");
    },

    initEventHandlers () {
        this.node.on("drawmap_over",this.initData,this);
        this.mapView.on("touchstart",this.touchStarCall ,this)
        this.mapView.on("touchmove",this.touchMoveCall ,this)
        this.mapView.on("touchend",this.touchEndCall ,this)
    },

    start () {
        this.addAudio();
        this.resultWnd.active = false;
        this.backGround.active = false;
        this.initEventHandlers();
    },

     update (dt) {

     },
});
