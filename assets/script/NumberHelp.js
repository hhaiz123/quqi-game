
cc.Class({
    extends: cc.Component,

    properties: {
        num1 : {
            default : null,
            type : cc.Sprite
        },
        num2 : {
            default : null,
            type : cc.Sprite
        },
        num3 : {
            default : null,
            type : cc.Sprite
        },
        num4 : {
            default : null,
            type : cc.Sprite
        },

    },

     onLoad () {
        let level = window.Global.selectLevel;
        this.n1 = Math.floor(level / 1000);
        this.n2 = Math.floor((level - this.n1 * 1000) / 100);
        this.n3 = Math.floor((level - this.n1 * 1000 - this.n2 * 100) / 10);
        this.n4 = level % 10
        this.bit = 4;

        for(let i = 1; i <= 4; i++) {
            let str = "n" + i
            if(this[str] === 0) {
                this.bit--;
            } else break;
        }
     },

    updateSpriteF : function(sprite,number) {
        cc.loader.loadRes("game",cc.SpriteAtlas,function(err,atlas) {
            let str = "game-fnt-level-" + number
            let subFrame = atlas.getSpriteFrame(str);
            if(number != -1) {
                sprite.spriteFrame = subFrame;
                sprite.node.active = true;
            } else {
                sprite.node.active = false;
            }
        });
    },

    start () {
        switch(this.bit) {
            case 1:
                this.updateSpriteF(this.num1,-1);
                this.updateSpriteF(this.num2,this.n4);
                this.updateSpriteF(this.num3,-1);
                this.updateSpriteF(this.num4,-1);
                break;
            case 2:
                this.updateSpriteF(this.num1,-1);
                this.updateSpriteF(this.num2,this.n3);
                this.updateSpriteF(this.num3,this.n4);
                this.updateSpriteF(this.num4,-1);
                break;
            case 3:
                this.updateSpriteF(this.num1,-1);
                this.updateSpriteF(this.num2,this.n2);
                this.updateSpriteF(this.num3,this.n3);
                this.updateSpriteF(this.num4,this.n4);
                break;
            case 4:
                this.updateSpriteF(this.num1,this.n1);
                this.updateSpriteF(this.num2,this.n2);
                this.updateSpriteF(this.num3,this.n3);
                this.updateSpriteF(this.num4,this.n4);
                break;
        }
        // cc.loader.loadRes("game",cc.SpriteAtlas,function(err,atlas) {


        // }.bind(this));
    },

    // update (dt) {},
});
