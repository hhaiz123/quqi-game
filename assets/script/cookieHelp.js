cc.Class({
    extends: cc.Component,

    properties: {
        floor : {
            default : null,
            type : cc.Node
        },
        cookie : {
            default : null,
            type : cc.Node
        },
        cookieNum : {
            default : null,
            type : cc.Sprite
        },
        cookieChip : {
            default : null,
            type : cc.Node
        }
    },

     onLoad () {
        this.value = this.value || 0;
        this.cookieChip.active = false;
        this.isClick = false;
     },

    resumeFloorOfWhite () {
        this.floor.color = cc.Color.WHITE;
        this.isClick = false;
    },

    updateFloorWithMon : function(typeId) {
        let color = vv.monsterColor[typeId];
        this.floor.color = color;
        this.isClick = true;
     },

    //  getFloorCol () {
    //     return this.floor.color;
    //  },

    //  setPos : function(x,y) {
    //     this.posX =x;
    //     this.posY = y;
    // },
    
    updateNum : function(index) {
        this.value = index;
        cc.loader.loadRes("game",cc.SpriteAtlas,function(err,atlas) {
            if(!err) {
                let str = "game-fnt-oncookie-" + index
                this.cookieNum.spriteFrame = atlas.getSpriteFrame(str);
            }
        }.bind(this));
    },

    start () {
        
    },

    // update (dt) {},
});
