
cc.Class({
    extends: cc.Component,

    properties: {
        mapView: {
            default : null,
            type: cc.Node
        }
    },


    // onLoad () {},

    initData() {
        this.monsterPosArr = [];
        this.roadArr = [];
        this.flagArr = [];
        this.tempRoad = [];
        this.resultRoadArr = [];
        this.tempResult = [];
        this.count = 0;
        this.roadInfoArr = [];
        this.infoIdx = 0;
        this.roadSprite = [];
        for(let i=0; i<vv.matTypeOfNum.length; i++) {
            let num = vv.matTypeOfNum[i];
            if(num >= 10) {
                this.monsterPosArr.push(i);
                this.roadArr.push([]);
                this.flagArr[i] = num;
                this.count++;
            } else if(num === 0) {
                this.flagArr[i] = 0;
            } else {
                this.flagArr[i] = -1;
                this.count++;
            }
        } 
        this.getRoad();
        this.getResultRoad();
    },

    monsterRoadRecursion(roadArr,preNodePos,nodePos) {
        let curNum = vv.matTypeOfNum[nodePos];
        let preNum;
        if(preNodePos === -1){
            preNum = undefined;
        }
        else {
            if(curNum >= 10) return;
            if(this.flagArr[nodePos] != -1) return;
            preNum = vv.matTypeOfNum[preNodePos];
            if(preNum < 10 && vv.matTypeOfNum[nodePos] < vv.matTypeOfNum[preNodePos]) return;
        }
        this.tempRoad.push(nodePos);
        let arr = this.tempRoad.concat();
        roadArr.push(arr);
        this.flagArr[nodePos] = 1;

        //上右下左
        let upPos = nodePos - vv.column;
        let rightPos;
        if((nodePos + 1) % vv.column) {
            rightPos = nodePos + 1;
        } else {
            rightPos = -1;
        }
        let downPos = nodePos + vv.column;
        let leftPos;
        if((nodePos + 1) % vv.column === 1) {
            leftPos = -1;
        } else {
            leftPos = nodePos - 1;

        }

        if(preNum >= 10 || !preNum) {
            if(upPos >= 0 && this.flagArr[upPos] === -1) {
                this.monsterRoadRecursion(roadArr,nodePos,upPos);
            }
            if(rightPos >= 0 && this.flagArr[rightPos] === -1) {
                this.monsterRoadRecursion(roadArr,nodePos,rightPos);
            }
            if(downPos >= 0 && this.flagArr[downPos] === -1) {
                this.monsterRoadRecursion(roadArr,nodePos,downPos);
            }
            if(leftPos >= 0 && this.flagArr[leftPos] === -1) {
                this.monsterRoadRecursion(roadArr,nodePos,leftPos);
            }
        } else {
            if(upPos >= 0 && this.flagArr[upPos] === -1 && preNum <= curNum) {
                this.monsterRoadRecursion(roadArr,nodePos,upPos);
            }
            if(rightPos >= 0 && this.flagArr[rightPos] === -1 && preNum <= curNum) {
                this.monsterRoadRecursion(roadArr,nodePos,rightPos);
            }
            if(downPos >= 0 && this.flagArr[downPos] === -1 && preNum <= curNum) {
                this.monsterRoadRecursion(roadArr,nodePos,downPos);
            }
            if(leftPos >= 0 && this.flagArr[leftPos] === -1 && preNum <= curNum) {
                this.monsterRoadRecursion(roadArr,nodePos,leftPos);
            }
        }

        this.tempRoad.pop();
        this.flagArr[nodePos] = -1;
    },

    getRoad() {
        for(let i=0; i<this.monsterPosArr.length; i++) {
            this.roadArr[i] = [];
            let monsterPos = this.monsterPosArr[i];
            this.monsterRoadRecursion(this.roadArr[i],-1,monsterPos);
            this.tempRoad.length = 0;
        }
    },

    deleteArrNodeId(arr,length) {
        while(length) {
            arr.pop();
            length--;
        }
    },

    resultRoadRecursion(monsterRoadId,roadIdx) {
        let road = this.roadArr[monsterRoadId][roadIdx];
        let temp = [];
        for(let i=0; i<road.length; i++) {
            let nodeId = road[i];
            let findIdx = this.tempRoad.indexOf(nodeId);
            if(findIdx === -1) {
                temp.push(nodeId);
            } else {
                return -1;
            }
        }
        temp = this.tempRoad.concat(temp);
        this.tempRoad = temp;
        this.tempResult.push(road);

        let tempRoadLength = this.tempRoad.length;
        if(tempRoadLength === this.count) {
            let result = this.tempResult.concat();
            this.resultRoadArr.push(result);
            return;
        }
        let roadLength = this.roadArr.length;
        if(monsterRoadId + 1 != roadLength) {
            let monsterRoadCount = this.roadArr[monsterRoadId + 1].length;
            for(let i=0; i<monsterRoadCount; i++) {
                let flag = this.resultRoadRecursion(monsterRoadId + 1,i);
                if(flag === -1) {
                    continue;
                }
                let length = this.roadArr[monsterRoadId + 1][i].length;
                this.tempResult.pop();
                this.deleteArrNodeId(this.tempRoad,length);
            }
        }
    },
    
    getResultRoad() {
        if(!this.roadArr.length) return;
        let length = this.roadArr[0].length;
        for(let i=0; i<length; i++) {
            this.resultRoadRecursion(0,i);
            this.tempRoad.length = 0;
            this.tempResult.length = 0;
        }
    },

    getLineSprite(nodeId,dir,pos,color) {
        if(dir === "none") return;

        let node = new cc.Node();
        let sp = node.addComponent(cc.Sprite);
        node.color = color
        node.setAnchorPoint(0.5,0);
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM
        node.setContentSize(20,vv.cellHeight + 10);
        let type = vv.matTypeOfNum[nodeId];

        if(type >= 10) {
            let curNode = vv.material[nodeId];
            let bg = curNode.getChildByName("bg");
            node.setPosition(0,0);
            bg.addChild(node);
        } else {
            node.setPosition(pos);
            this.mapView.addChild(node,100);
        }
        this.roadSprite.push(node);

        switch(dir){
            case "left":
                node.rotation = -90;
                break;
            case "up":
                break;
            case "right":
                node.rotation = 90;
                break;
            case "down":
                node.rotation = 180;
                break;
        }

        cc.loader.loadRes("game",cc.SpriteAtlas,function(err,atlas) {
            let spriteFrame = atlas.getSpriteFrame("testui-dir");
            sp.spriteFrame = spriteFrame;
        }.bind(this))
    },

    //上右下左
    getDir(nodeId,nextId) {
        let nodeRow = Math.ceil((nodeId + 1) / vv.column);
        let nodeColumn = (nodeId + 1) % vv.column ? (nodeId + 1) % vv.column : vv.column;
        let nextRow = Math.ceil((nextId + 1) / vv.column);
        let nextColumn = (nextId + 1) % vv.column ? (nextId + 1) % vv.column : vv.column;

        if(nodeColumn === nextColumn && nodeRow - 1 === nextRow) return "up";
        if(nodeRow === nextRow && nodeColumn + 1 === nextColumn) return "right";
        if(nodeColumn === nextColumn && nodeRow + 1 === nextRow) return "down";
        if(nodeRow === nextRow && nodeColumn - 1 === nextColumn) return "left";

        cc.log("error  getDir  resultRoadArr is error!")
        return "err";
    },

    getPos(nodeId) {
        let width = vv.column * vv.cellWidth + vv.distance * 2;
        let height = vv.row * vv.cellHeight + vv.distance * 2;

        let nodeRow = Math.ceil((nodeId + 1) / vv.column);
        let nodeColumn = (nodeId + 1) % vv.column ? (nodeId + 1) % vv.column : vv.column;
        let x = nodeColumn * vv.cellWidth - vv.cellWidth / 2;
        let y = (vv.row - nodeRow + 1) * vv.cellHeight - vv.cellHeight / 2;
        let minWidth = width / 2 - vv.distance;
        let minHeight = height / 2 - vv.distance;
        let posx = (x >= minWidth) ? (x - minWidth) : (x - minWidth);
        let posy = (y >= minHeight) ? (y - minHeight) : (y - minHeight);

        return cc.v2(posx,posy);
    },

    setSimgleRoadInfo(roadId) {
        let resultLength = this.resultRoadArr[roadId].length;
        this.roadInfoArr[roadId] = [];
        for(let i=0; i<resultLength; i++) {
            this.roadInfoArr[roadId][i]=[];
            let roadInfo = this.roadInfoArr[roadId][i];
            let road = this.resultRoadArr[roadId][i];
            let roadLength = this.resultRoadArr[roadId][i].length;
            let j;
            for(j=0; j<roadLength - 1; j++) {
                let nodeId = road[j];
                let nextId = road[j + 1];
                let nodePos = this.getPos(nodeId);
                let dir = this.getDir(nodeId,nextId);
                if(dir === "err") return;
                let nodeInfo = {"nodeId":nodeId,"pos":nodePos,"dir":dir};
                roadInfo.push(nodeInfo);
            }
            let nodeId = road[j];
            let nodePos = this.getPos(road[j]);
            let nodeInfo = {"nodeId":nodeId,"pos":nodePos,"dir":"none"};
            roadInfo.push(nodeInfo);
        }
    },

    setTotalRoadInfo() {
        let resultLength = this.resultRoadArr.length;
        for(let i=0; i<resultLength; i++) {
            this.setSimgleRoadInfo(i);
        }
        let a = this.roadInfoArr;
    },

    removeLine() {
        if(!this.roadSprite.length) return;
        while(this.roadSprite.length) {
            let node = this.roadSprite.pop();
            node.removeFromParent();
        }
    },

    hintCallback(event) {
        this.setTotalRoadInfo();
        if(this.roadInfoArr.length === 0) {
            cc.log("error hintCallback roadInfoArr is null");
        }
        let roadInfo = this.roadInfoArr[0][this.infoIdx];
        let length = roadInfo.length;

        let nodeId = roadInfo[0].nodeId;
        let node = vv.material[nodeId];
        let nodeJs = node.getComponent(vv.monsterJs);
        let color = nodeJs.getFloorCol();

        for(let i=0; i<length; i++) {
            let nodeInfo = roadInfo[i];
            let pos = nodeInfo.pos;
            let dir = nodeInfo.dir;
            let nodeId = nodeInfo.nodeId;
            this.getLineSprite(nodeId,dir,pos,color);
        }
        if(this.infoIdx + 1 < this.roadInfoArr[0].length) {
            this.infoIdx++;
        } else {
            this.infoIdx = 0;
        }

        let target = event.target;
        target.getComponent(cc.Button).interactable = false;
    },

    start () {
        this.node.on("drawmap_over",this.initData,this);
    },

    // update (dt) {},
});
