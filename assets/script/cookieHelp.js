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
        this.monsterValue = -1;
     },

     eatState : function() {
        this.cookieChip.active = true;
        let chipAnimation = this.cookieChip.getComponent(cc.Animation);
        chipAnimation.play("cookieChip");
        this.cookie.active = false;
     },

     updateFloor : function(color) {
        this.floor.color = color;
     },

     unUpdateFloor : function() {
         this.floor.color = cc.Color.WHITE
     },

     getFloorCol () {
        return this.floor.color;
     },

     setPos : function(x,y) {
        this.posX =x;
        this.posY = y;
    },
    
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
