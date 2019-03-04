
cc.Class({
    extends: cc.Component,

    properties: {
        monster : {
            default : null,
            type : cc.Prefab
        },
        cookie : {
            default : null,
            type : cc.Prefab
        },
        noMoveFloor : {
            default : null,
            type : cc.Prefab
        },
        mapView : {
            default : null,
            type : cc.Node
        },
        commonJson : {
            default : null,
            type : cc.JsonAsset
        },
        distance : 5
    },

    initDate : function()  {
        this.comJson = this.commonJson.json;
        this.passJson = this.passJson || null;
        vv.matTypeOfNum.length = 0;
        vv.distance = this.distance;
        
        this.cnfPath = 'config/pass' + vv.selectLevel;
        cc.loader.loadRes(this.cnfPath,function (err, jsonAsset) {
            this.passJson = jsonAsset.json;
            this.row = this.passJson.mapPos.row
            this.column = this.passJson.mapPos.column
            vv.row = this.row;
            vv.column = this.column;
            this.count = parseInt(this.row) * parseInt(this.column)

            for(let i = 0; i < this.count; i++) {
                let matType = this.passJson.mapData
                vv.matTypeOfNum[i] = parseInt(matType[i])
            }
            this.initFlag = true;
       }.bind(this));
    },

    onLoad () {
        this.initDate();
        vv.material.length = 0;
    },

    getMonster : function(index,posx,posy) {
        let mon = cc.instantiate(this.monster);
        let monsterJS = mon.getComponent("MonsterHelp");
        monsterJS.updateMonster(index);
        //monsterJS.setPos(posx,posy);
        return mon;
    },

    getCookie : function(index,posx,posy) {
        let cookie = cc.instantiate(this.cookie);
        let cookieJS = cookie.getComponent("cookieHelp");
        cookieJS.updateNum(index);
        //cookieJS.setPos(posx,posy);
        return cookie;
    },

    getNoMoveFloor : function() {
        let noMoveFloor = cc.instantiate(this.noMoveFloor);
        return noMoveFloor;
    },

    getTotalNode : function(index,posx,posy){
        let material;
        if(index === 0) {
            material = this.getNoMoveFloor();
        } else if(index >= 10) {
            material = this.getMonster(index,posx,posy);

        } else
        {
            material = this.getCookie(index,posx,posy);
        }
        material.setPosition(posx,posy);
        this.mapView.addChild(material,index);
        vv.material.push(material)
    },

    setMapViewSize : function(w,h) {
        this.mapView.setContentSize(w,h)
    },

    draw : function() {
        let width = this.column * vv.cellWidth + this.distance * 2;
        let height = this.row * vv.cellHeight + this.distance * 2;
        this.setMapViewSize(width,height);

        //添加配置中的类型图片到 Layout 中。
        for(let i=0; i<this.count; i++) {
            let typeNum = vv.matTypeOfNum[i];
            let nodeRow = Math.ceil((i + 1) / this.column);
            let nodeColumn = ((i + 1) % this.column) ? (i + 1) % this.column : this.column;
            let x = nodeColumn * vv.cellWidth - vv.cellWidth / 2;
            let y = (this.row - nodeRow + 1) * vv.cellHeight - vv.cellHeight / 2;

            let minWidth = width / 2 - this.distance;
            let minHeight = height / 2 - this.distance;

            let posx = (x >= minWidth) ? (x - minWidth) : (x - minWidth);
            let posy = (y >= minHeight) ? (y - minHeight) : (y - minHeight);
            this.getTotalNode(typeNum,posx,posy);    
        }
    },

    start () {
    },

     update (dt) {
        if(this.initFlag) {
            this.draw();
            this.initFlag = false;
            this.node.emit("drawmap_over")
        }
     },
});
