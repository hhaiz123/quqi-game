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
        layerDistance : 5
    },

    initData() {
        this.roadCookieCount = 0;
        this.allCookieCount = 0;
        this.mark = [];
        this.roadArr = [];
        this.roadLine = -1;
        this.preRoadArr = [];

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
                this.roadArr[typeId].push(i)
                this.mark[i].push(typeId);
            }
        }

        this.schedule(function(){
            if(this.allCookieCount === this.roadCookieCount) {
                this.resultWnd.active = true;
                this.backGround.active = true;
            }
        },1);
    },

    getNodeJs (node) {
        if(!node) return null;
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

    //点击时。
    resumebegState (monType,nodeId) {
        let length = this.roadArr[monType].length
        let beginIdx = this.roadArr[monType].indexOf(nodeId);
        if(beginIdx === -1) {
            cc.log("no find node in roadArr!");
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
    updateRoadCooState (monType,nodeId) {
        let beginIdx = this.roadArr[monType].indexOf(nodeId);
        if(beginIdx === -1) return;
        let length = this.roadArr[monType].length

        if(!this.preRoadArr[nodeId]){
            this.preRoadArr[nodeId] = [];
        } else {
            this.preRoadArr[nodeId].length = 0;
        }
        this.preRoadArr[nodeId].push(monType);
        this.preRoadArr[nodeId].push(nodeId);

        for(let i = beginIdx + 1; i<length;) {
            length--;
            let reNodeId = this.roadArr[monType][i];
            let reNode = vv.material[reNodeId];
            let reNodeJs = this.getNodeJs(reNode);
            this.preRoadArr[nodeId].push(reNodeId);
            let hasNotPreRoad = !this.preRoadArr[reNodeId] || !this.preRoadArr[reNodeId].length
            let preRoadId;
            if(!hasNotPreRoad) {
                preRoadId = this.preRoadArr[reNodeId][0];
            }
            if(hasNotPreRoad || preRoadId === monType) {
                this.mark[reNodeId].pop();
                reNodeJs.resumeFloorOfWhite();
                this.roadArr[monType].splice(i,1);
                this.roadCookieCount--;
                continue;
            }
            this.resumePreState(reNodeId);
        }
    },

    //恢复同一条线上的：
    resumeRoadCooState (monTypeId,nodeId) {
        if(!this.preRoadArr[nodeId] || !this.preRoadArr[nodeId].length) return;

        let roadId = this.preRoadArr[nodeId][0];
        for(let i=2; i<this.preRoadArr[nodeId].length;) {
            let reNodeId = this.preRoadArr[nodeId][i];
            let reNode = vv.material[reNodeId];
            let reNodeJs = this.getNodeJs(reNode);

            if(reNodeJs.isClick) {
                this.keepPreRoad(nodeId);

            }
            this.mark[reNodeId].push(monTypeId);
            reNodeJs.updateFloorWithMon(monTypeId);
            this.roadArr[monTypeId].push(reNodeId);
            this.roadCookieCount++;
            this.preRoadArr[nodeId].splice(i,1);
        }
            
    },

    //保存节点下原来的路线。
    keepPreRoad(nodeId) {
        if(!this.preRoadArr[nodeId]){
            this.preRoadArr[nodeId] = [];
        } else {
            this.preRoadArr[nodeId].length = 0;
        }

        let length = this.mark[nodeId].length;
        if(length === 1) return;
        let preMonId = this.mark[nodeId][length - 1];
        this.preRoadArr[nodeId].push(preMonId);

        let nodePreRoadIdx = this.roadArr[preMonId].indexOf(nodeId);
        for(let i=nodePreRoadIdx; i<this.roadArr[preMonId].length;) {
            let dnodeId = this.roadArr[preMonId][i];
            let node = vv.material[dnodeId]
            let nodeJs = this.getNodeJs(node);
            nodeJs.resumeFloorOfWhite();
            this.roadArr[preMonId].splice(i,1);
            this.roadCookieCount--;
            this.preRoadArr[nodeId].push(dnodeId);
            this.mark[dnodeId].pop();

            if(i === nodePreRoadIdx) continue; 
            this.mark[dnodeId].push(-1);

        }
    },


    //恢复已经被点击的单格：
    resumePreState(nodeId) {
        //如果这个节点没有需要一起恢复的路线时：
        if(!this.preRoadArr[nodeId] || !this.preRoadArr[nodeId].length) {
            let reNode = vv.material[nodeId];
            let reNodeJs = this.getNodeJs(reNode);
            reNodeJs.resumeFloorOfWhite();
            let roadId = this.mark[nodeId].pop();
            let idx = this.roadArr[roadId].indexOf(nodeId);
            this.roadArr[roadId].splice(idx,1);
            this.roadCookieCount--;
            return;
        }     

        //恢复该节点，有需要一同恢复的路线时：
        let leng = this.preRoadArr[nodeId].length;
        let reRoadId = this.preRoadArr[nodeId][0];
        for(let i=1; i<leng; i++) {
            let reNodeId = this.preRoadArr[nodeId][i];
            let curRoadId = this.mark[reNodeId].pop();

            if(i === 1) {
                this.roadArr[curRoadId].pop();
                this.roadCookieCount--;
            }
            let reNode = vv.material[reNodeId];
            let reNodeJs = this.getNodeJs(reNode);
            reNodeJs.updateFloorWithMon(reRoadId);
            this.mark[reNodeId].push(reRoadId);
            this.roadArr[reRoadId].push(reNodeId);
            this.roadCookieCount++;
        }
        this.preRoadArr[nodeId].length = 0;
    },

    //一格一格的处理(当该节点被点击时，没有被点击时是否为回退？)
    updateCookieState(monTypeId,nodeId) {
        if(nodeId >= 10) return;
        let curNode = vv.material[nodeId];
        let curNodeJs = this.getNodeJs(curNode);
        if(!curNodeJs) return;

        this.keepPreRoad(nodeId);
                
        //当前node的处理
        curNodeJs.updateFloorWithMon(monTypeId);
        this.mark[nodeId].push(monTypeId);
        this.roadArr[monTypeId].push(nodeId);
        this.roadCookieCount++;

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
        let preId = this.roadArr[this.roadLine][roadArrLength - 1];
        if(preId === curNodeId) return;

       //同一条线上的删除操作。
        if(this.roadLine === curNodeRoadId) {
            this.updateRoadCooState(curNodeRoadId,curNodeId);
            return;
        }

        if(typeId >= 10) return;

        let preRow = Math.ceil((preId + 1) / vv.column);
        let preColumn = ((preId + 1) % vv.column) ? (preId + 1) % vv.column : vv.column;
        let curRow = Math.ceil((curNodeId + 1) / vv.column);
        let curColumn = ((curNodeId + 1) % vv.column) ? (curNodeId + 1) % vv.column : vv.column;

        //同一条线上的恢复判断。
        let curNodeJs = this.getNodeJs(curNode);
        let rlength = this.roadArr[this.roadLine].length;
        let curRoadLastCookieId = this.roadArr[this.roadLine][rlength - 1];
        let hasPreRoad = this.preRoadArr[curRoadLastCookieId] && this.preRoadArr[curRoadLastCookieId].length;
        if(!curNodeJs.isClick && hasPreRoad) {
            let plength = this.preRoadArr[curRoadLastCookieId].length;
            let preRoadId = this.preRoadArr[curRoadLastCookieId][0];
            let preRoadLastCookieId = this.preRoadArr[curRoadLastCookieId][plength - 1];
            if(preRoadId === this.roadLine && preRoadLastCookieId === curNodeId) {
                this.resumeRoadCooState(preRoadId,curRoadLastCookieId);
                return;
            }
        }
cc.log(curRow,curColumn);
        if(preRow != curRow && preColumn != curColumn) return;
        if(preRow === curRow && Math.abs(preColumn - curColumn) > 1) return;
        if(preColumn === curColumn && Math.abs(preRow - curRow) > 1) return;
        this.updateCookieState(this.roadLine,curNodeId);


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
    },

    nextButtonCallback() {
        vv.selectLevel++;
        cc.director.loadScene("game");
    },

   
    start () {
        this.resultWnd.active = false;
        this.backGround.active = false;
        this.initEventHandlers();

        
    },

     update (dt) {

     },
});
