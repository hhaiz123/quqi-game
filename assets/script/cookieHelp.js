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

     showScale() {
        let scale1 = cc.scaleTo(0.1,0.9);
        let scale2 = cc.scaleTo(0.1,1);
        this.floor.runAction(cc.sequence(scale1,scale2));
     },

    resumeFloorOfWhite () {
       // this.showScale();
        this.floor.color = cc.Color.WHITE;
        this.isClick = false;
    },

    updateFloorWithMon : function(typeId) {
        this.showScale();
        let color = vv.monsterColor[typeId];
        this.floor.color = color;
        this.isClick = true;
     },

     resetCookie : function() {
        this.cookie.stopAllActions();
        this.cookieChip.stopAllActions();
        this.cookie.active = true;
        this.cookie.opacity = 255;
        this.cookieChip.active = false;
     },

     eatCookieAnimation : function() {
        let fade = cc.fadeOut(0.2);
        let sequence = cc.sequence(fade,cc.callFunc(function() {
            this.cookie.active = false;
            this.cookieChip.active = true;
            let chipAnimation = this.cookieChip.getComponent(cc.Animation);
            chipAnimation.play("cookieChip");
        }.bind(this)));

        this.cookie.runAction(sequence);
    },

    getPos : function() {
        let pos = this.cookie.getPosition();
        return pos;
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
