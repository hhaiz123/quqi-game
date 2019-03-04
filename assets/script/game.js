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
        },
        hint:{
            default: null,
            type: cc.Button
        },
        reset:{
            default:null,
            type:cc.Button
        },
        layerDistance : 5
    },

    initData() {
        this.roadCookieCount = 0;
        this.allCookieCount = 0;
        this.mark = [];
        this.roadArr = [];
        this.roadNode = [];
        this.roadLine = -1;
        this.preRoadArr = [];
        this.time = 0;
        this.idx = 0;
        this.isEat = false;
        this.overCount = 0;

        let count = vv.matTypeOfNum.length;
        for(let i=0; i<count; i++)  {
            let typeId = vv.matTypeOfNum[i];
            this.mark.push([]);
            if(typeId >= 1 && typeId <  10) {
                this.allCookieCount++;
                this.mark[i].push(-1);
            }

            if(typeId >= 10) {
                let monster = vv.material[i];
                let monJs = this.getNodeJs(monster);
                vv.monsterColor[typeId] = monJs.getFloorCol();
                this.roadArr[typeId] = [];
                this.roadNode.push(i);
                this.roadArr[typeId].push(i)
                this.mark[i].push(typeId);
            }
        }
        this.addAudio();
    },

    addAudio () {
        cc.loader.loadRes("prefab/audio",cc.Prefab,function(err,audio){
            if(!err) {
                this.audio = cc.instantiate(audio);
                this.node.addChild(this.audio);
                this.audioJs = this.audio.getComponent("AudioHelp");
                this.audioJs.playBackMusic();
            }
        }.bind(this));
    },

    getNodeJs (nodeId) {
        if(nodeId === undefined) return;
        let node;
        let nodeJs;
cc.log(typeof(nodeId));
        if(typeof(nodeId) === 'number') {
            node = vv.material[nodeId];
        } else {
            node = nodeId;
        }
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
        let mapWidth = mapContentSize.width - 2 * this.layerDistance;
        let mapHeight = mapContentSize.height - 2 * this.layerDistance;

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

    addNodeToRoad(roadId,nodeId) {
        let reNode = vv.material[nodeId];
        let reNodeJs = this.getNodeJs(reNode);
        if(!reNodeJs || reNodeJs === "monster") {
            cc.log("error  addNodeToRoad ",nodeId, "is type error！");
            return;
        }
        if(roadId === -1) {
            reNodeJs.resumeFloorOfWhite();
        } else {
            reNodeJs.updateFloorWithMon(roadId);
            this.mark[nodeId].push(roadId);
            this.roadArr[roadId].push(nodeId);
            this.roadCookieCount++;
        }
    },

    deleteNodeFromRoad(nodeId) {
        let length = this.mark[nodeId].length;
        if(length <= 1) {
            cc.log("error  deleteNodeFromRoad",nodeId, "mark[%d] length is",length,);
        }
        let roadId = this.mark[nodeId].pop();
        let idx = this.roadArr[roadId].indexOf(nodeId);
        this.roadArr[roadId].splice(idx,1);
        this.roadCookieCount--;
    },

    //保存节点下原来的路线。
    keepPreRoad(nodeId) {
        cc.log("inter keepPreRoad ",nodeId);
        if(!this.preRoadArr[nodeId]){
            this.preRoadArr[nodeId] = [];
        } else {
            this.preRoadArr[nodeId].length = 0;
        }

        let length = this.mark[nodeId].length;
        if(length === 1) {
            cc.log("keepPreRoad ",nodeId," mark is only one -1");
            return;
        }
        let preMonId = this.mark[nodeId][length - 1];
        this.preRoadArr[nodeId].push(preMonId);

        let nodePreRoadIdx = this.roadArr[preMonId].indexOf(nodeId);
        for(let i=nodePreRoadIdx; i<this.roadArr[preMonId].length;) {
            let dnodeId = this.roadArr[preMonId][i];
            this.deleteNodeFromRoad(dnodeId);
            this.addNodeToRoad(-1,dnodeId);

            this.preRoadArr[nodeId].push(dnodeId);
        }
    },

    //点击时。
    resumebegState (monType,nodeId) {
        let length = this.roadArr[monType].length
        let beginIdx = this.roadArr[monType].indexOf(nodeId);
        if(beginIdx == 0) {
            this.audioJs.playMonster();
        }
        if(beginIdx === -1) {
            cc.log("resumebegState no find node in roadArr!");
            return;
        }
        for(let i=length-1; i>beginIdx;i--) {
            let nodeId = this.roadArr[monType].pop();
            this.roadCookieCount--;
            if(nodeId === -1) return;
            let node = vv.material[nodeId];
            let nodeJs = this.getNodeJs(node);
            if(!nodeJs) return;
            nodeJs.resumeFloorOfWhite();
            this.mark[nodeId].length = 0;
            this.mark[nodeId].push(-1);
        }
    },

    //移动中同条线（删除原线中该节点之后的 所有节点。）
    deleteRoadCooState (monType,preNodeId,nodeId) {
        cc.log("inter deleteRoadCooState " ,preNodeId);
        let beginIdx = this.roadArr[monType].indexOf(nodeId);
        if(beginIdx === -1) {
            cc.log("updateRoadCooState not find")
            return;
        }

        if(!this.preRoadArr[preNodeId]){
            this.preRoadArr[preNodeId] = [];
        } else {
            this.preRoadArr[preNodeId].length = 0;
        }
        this.preRoadArr[preNodeId].push(monType);
        this.preRoadArr[preNodeId].push(nodeId);

        let length = this.roadArr[monType].length;
        for(let i = beginIdx + 1; i<length;) {
            length--;  
            let reNodeId = this.roadArr[monType][i];
            this.deleteNodeFromRoad(reNodeId);
            this.addNodeToRoad(-1,reNodeId);
            this.preRoadArr[preNodeId].push(reNodeId);
        }
    },

    //恢复node 下的原路线：
    resumePreState(nodeId) {
        cc.log("inter resumePreState ",nodeId);
        //如果这个节点没有需要一起恢复的路线时：
        if(!this.preRoadArr[nodeId] || !this.preRoadArr[nodeId].length) {
            this.deleteNodeFromRoad(nodeId);
            this.addNodeToRoad(-1,nodeId);
            return;
        }     

        //恢复该节点，有需要一同恢复的路线时：
        let leng = this.preRoadArr[nodeId].length;
        let reRoadId = this.preRoadArr[nodeId][0];
        for(let i=1; i<leng; i++) {
            let reNodeId = this.preRoadArr[nodeId][i];
            let typeId = vv.matTypeOfNum[reNodeId];
            if(typeId >= 10) continue;
            let mlength = this.mark[reNodeId].length;
            let curRoadId = this.mark[reNodeId][mlength - 1];
            if(curRoadId != -1) {
                this.deleteNodeFromRoad(reNodeId);
                this.addNodeToRoad(reRoadId,reNodeId);
                continue;
            } 
            this.addNodeToRoad(reRoadId,reNodeId);
        }
        this.preRoadArr[nodeId].length = 0;
    },

    //一格一格的处理(正向添加)
    updateCookieState(monTypeId,nodeId) {
        cc.log("inter updateCookieState")

        this.keepPreRoad(nodeId);
        this.addNodeToRoad(monTypeId,nodeId);
    },

    isNextOfNode(preNodeId,nodeId) {
        let preRow = Math.ceil((preNodeId + 1) / vv.column);
        let preColumn = ((preNodeId + 1) % vv.column) ? (preNodeId + 1) % vv.column : vv.column;
        let curRow = Math.ceil((nodeId + 1) / vv.column);
        let curColumn = ((nodeId + 1) % vv.column) ? (nodeId + 1) % vv.column : vv.column;

        if(preRow != curRow && preColumn != curColumn) return false;
        if(preRow === curRow && Math.abs(preColumn - curColumn) > 1) return false;
        if(preColumn === curColumn && Math.abs(preRow - curRow) > 1) return false ;
        
        return true;
    },

    getNodeValue(nodeId) {
        let node = vv.material[nodeId];
        let nodeJs = this.getNodeJs(node);
        return nodeJs.value;
    },

    touchStarCall(event) {
        let nodeIdx = this.getClickIdx(event);
        if(nodeIdx === -1) return;
        let typeId = vv.matTypeOfNum[nodeIdx];
        if(typeId === 0) return;  //点击nomove floor时，直接返回。
        let curNode = vv.material[nodeIdx];
        let curNodeJs = this.getNodeJs(curNode);
        if(typeId >= 10 || curNodeJs.isClick) {
            let length = this.mark[nodeIdx].length;
            let roadId = this.mark[nodeIdx][length - 1];
            this.resumebegState(roadId,nodeIdx);

            this.roadLine = roadId;
            return;
        }
    },

    touchMoveCall(event) {
        //如果路线没有启动，返回
        if(this.roadLine === -1) return;
        let curNodeId = this.getClickIdx(event);
        if(curNodeId === -1) return;
        let typeId = vv.matTypeOfNum[curNodeId];
        if(typeId === 0) return;  //点击nomove floor时，直接返回。

        let curNode = vv.material[curNodeId];
        let length = this.mark[curNodeId].length;
        let curNodeRoadId = this.mark[curNodeId][length - 1];

        let roadArrLength = this.roadArr[this.roadLine].length;
        let preNodeId = this.roadArr[this.roadLine][roadArrLength - 1];
        if(preNodeId === curNodeId) return;

        //判断是否为恢复操作。
        //反向回退：（同线）
        if(this.roadLine === curNodeRoadId) {
            let preIdx = this.roadArr[this.roadLine].indexOf(preNodeId);
            let curIdx = this.roadArr[this.roadLine].indexOf(curNodeId);
            if(preIdx === curIdx + 1) {
                this.resumePreState(preNodeId);
                return;
            }
        } 

        //正向回退：（恢复同线,同线被截取掉的部分）
        let curNodeJs = this.getNodeJs(curNode);
        let isNext = this.isNextOfNode(preNodeId,curNodeId);
        if(isNext && !curNodeJs.isClick){
            let curNodeHasPreRoad = this.preRoadArr[curNodeId] && this.preRoadArr[curNodeId].length;
            if(curNodeHasPreRoad) {
                let pLength = this.preRoadArr[curNodeId].length;
                let preLastNodeId = this.preRoadArr[curNodeId][pLength - 1];
                let preFirstNodeId = this.preRoadArr[curNodeId][1];
                if(preLastNodeId === curNodeId && preFirstNodeId == preNodeId) {
                    this.resumePreState(curNodeId);
                    return;
                }
    
            }
        }

       //同一条线上的删除操作。
        if(this.roadLine === curNodeRoadId) {
            this.deleteRoadCooState(curNodeRoadId,preNodeId,curNodeId);
            return;
        }

        if(typeId >= 10) return;

        //正向添加操作。
        if(!isNext) return;
        let preNodeValue = this.getNodeValue(preNodeId);
        let curNodeValue = this.getNodeValue(curNodeId);
        if(preNodeValue >= 10 || preNodeValue <= curNodeValue) {
            this.updateCookieState(this.roadLine,curNodeId);
        }
    },

    touchEndCall(event) {
        this.roadLine = -1;
        this.preRoadArr.length = 0;
        let length = this.mark.length;
        for(let i=0; i<length; i++) {
            let mLength = this.mark[i].length;
            if(mLength > 1) {
                let tempMon = this.mark[i][mLength-1];
                this.mark[i].length = 1;
                this.mark[i].push(tempMon);
            }
        }
    },

    initEventHandlers() {
        this.node.on("drawmap_over",this.initData,this);
        this.mapView.on("touchstart",this.touchStarCall ,this)
        this.mapView.on("touchmove",this.touchMoveCall ,this)
        this.mapView.on("touchend",this.touchEndCall ,this)
        cc.systemEvent.on("Game:MonsterArrive",this.eatCookie,this);
        cc.systemEvent.on("Game:MonsterEnd",this.disPlay,this);
    },

    offEventHandlers() {
        this.mapView.off("touchstart",this.touchStarCall ,this)
        this.mapView.off("touchmove",this.touchMoveCall ,this)
        this.mapView.off("touchend",this.touchEndCall ,this)
    },

    onEventHandlers() {
        this.mapView.on("touchstart",this.touchStarCall ,this)
        this.mapView.on("touchmove",this.touchMoveCall ,this)
        this.mapView.on("touchend",this.touchEndCall ,this)
    },

    nextButtonCallback() {
        vv.selectLevel++;
        cc.director.loadScene("game");
    },

    backSelectPageCallback() {
        cc.director.loadScene("select");
    },
   
    start () {
        this.resultWnd.active = false;
        this.backGround.active = false;
        this.initEventHandlers();
    },


    eatCookie(event) {
        let nodeId = event.detail;
        let nodeJs = this.getNodeJs(nodeId);
        nodeJs.eatCookieAnimation();
    },

    disPlay() {
        this.overCount++;
        if(this.overCount === this.roadNode.length) {
            this.audioJs.pauseEatMusic();
            this.audioJs.playSuccessMusic();
            this.resultWnd.active = true;
            this.backGround.active = true;
            this.hint.interactable = false;
            this.reset.interactable = false;
        }
    },

    gameOver () {
        this.audioJs.playEatMusic();
        for(let i=0; i<this.roadNode.length; i++) {
            let monsterId = this.roadNode[i];
            let monsterJs = this.getNodeJs(monsterId);
            let roadId = vv.matTypeOfNum[monsterId];
            monsterJs.setRoad(this.roadArr[roadId]);
        }
    },
    
    resetMaterialInitState() {
        this.audioJs.pauseEatMusic();
        for(let i=0; i<this.roadNode.length; i++) {
            let monsterIdx = this.roadNode[i];
            let roadId = vv.matTypeOfNum[monsterIdx];
            let road = this.roadArr[roadId];
            for(let j=1; j<road.length;) {
                let nodeId = road[j];
                this.deleteNodeFromRoad(nodeId);
                this.addNodeToRoad(-1,nodeId);
            }
        }
    },

    resetGame() {
        if(this.isEat) {
            for(let i=0; i<this.roadNode.length; i++) {
                let monsterId = this.roadNode[i];
                let monsterJs = this.getNodeJs(monsterId);
                monsterJs.resetMove();
                let roadId = vv.matTypeOfNum[monsterId];
                let road = this.roadArr[roadId];
                for(let i=1; i<road.length; i++) {
                    let nodeId = road[i];
                    let nodeJs = this.getNodeJs(nodeId);
                    nodeJs.resetCookie();
                }
            }
        } 
        this.resetMaterialInitState();
        this.onEventHandlers();
        this.isEat = false;
    },

     update (dt) {
        this.time += dt;
        if(this.time >= 1 && !this.isEat) {
            if(this.allCookieCount === this.roadCookieCount) {
                this.offEventHandlers();
                this.gameOver();
                this.isEat = true;
                return;
            }
            this.time = 0;
        }
     },
});
