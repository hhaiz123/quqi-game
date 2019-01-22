
cc.Class({
    extends: cc.Component,

    properties: {
        floor : {
            default : null,
            type : cc.Node
        },
        steleton : {
            default : null,
            type : sp.Skeleton
        },

    },

     onLoad () {
        this.isClick = false;
     },

    initGameData() {
        this.monsterValue = this.value;
        this.isClick = true;
    },

    updateMonster : function(index) {
        this.setFloorCol(index);
        this.value = index;

        let num = index - 9;
        this.cnfPath = "monster/" + num +"/monster" + num
        cc.loader.loadRes(this.cnfPath,sp.SkeletonData,function(err,data) {
            this.steleton.skeletonData = data;
            this.steleton.setAnimation(0,"openMouth",true);
        }.bind(this));
    },

    setFloorCol : function(index) {
        switch(index) {
        case 10:
            this.floor.color = new cc.Color(158, 227, 174);
            break;
        case 11:
            this.floor.color = new cc.Color(234, 218, 113);
            break;
        case 12:
            this.floor.color = new cc.Color(227, 134, 165);
            break;
        case 13:
            this.floor.color = new cc.Color(211, 152, 227);
            break;
        case 14:
            this.floor.color = new cc.Color(147, 142, 220);
            break;
        case 15:
            this.floor.color = new cc.Color(192, 87, 141);
            break;
        }

    },

    getFloorCol () {
        return this.floor.color;
    },

    isClick () {
        
    },

    start () {
    },

    // update (dt) {},
});
