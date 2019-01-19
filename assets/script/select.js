
cc.Class({
    extends: cc.Component,

    properties: {
        listBg : {
            default : null,
            type : cc.Node
        },
        content : {
            default : null,
            type : cc.Node
        },
        passNode : {
            default : null,
            type : cc.Node
        },
        pageView : {
            default : null,
            type : cc.PageView
        },
        contentLayout : null,
        level : null
    },

     onLoad () {
        require("userData")
        this.passNode.active = false
        this.listBg.active = false
        this.level = cc.sys.localStorage.getItem('level')
        if (!this.level) {
            this.level = 1
            cc.sys.localStorage.setItem('level',1)
        }
     },

    itemAnimate : function(index) {
        let item = this.contentLayout.getChildByTag(index);
        let bg = item.getChildByName("bg");
        cc.loader.loadRes('select',cc.SpriteAtlas,function (err,atlas) {
            if(!err) {
                let subFrame = atlas.getSpriteFrame("thislevel");
                bg.spriteFrame = subFrame;
            }
        }.bind(this));

    },

    start () {
        cc.log(this.passNode)
        cc.loader.loadRes('select', cc.SpriteAtlas, function (err, atlas) { 
            let page;
            //往pageview 中添加page （这里可以用 addPage）
            for(let i = 1; i <= vv.passNum; i++) {
                //clone page
                if(i === 1 || (i - 1) % 15 === 0) {
                    page = cc.instantiate(this.listBg)
                    page.active = true
                    page.setPosition(0,0)
                    this.pageView.addPage(page)
                    this.contentLayout = page.getChildByName("itemLayout");
                }
                //往page里面添加level 图标
                let newPassNode = cc.instantiate(this.passNode)
                newPassNode.active = true
                newPassNode.setTag(i)
                this.contentLayout.addChild(newPassNode)
                let child = newPassNode.getChildByName("passNum")
                if(i < 10) {
                    let num2 = child.getChildByName("num2")
                    let sprite2 = num2.getComponent(cc.Sprite)
                    let str = 'xuanguanshuzi-' + i
                    let subFrame = atlas.getSpriteFrame(str);
                    sprite2.spriteFrame = subFrame
                    //  sprite.spriteFrame.setTexture(cc.url.raw('select/xuanguanshuzi-1.png'));
                } else if(i < 100) {
                    let num1 = child.getChildByName("num1")
                    let num2 = child.getChildByName("num2")
                    let sprite1 = num1.getComponent(cc.Sprite)
                    let sprite2 = num2.getComponent(cc.Sprite)
                    let n1 = Math.floor(i / 10)
                    let n2 = i % 10
                    let str1 = 'xuanguanshuzi-' + n1
                    let str2 = 'xuanguanshuzi-' + n2
                    let subFrame = atlas.getSpriteFrame(str1);
                    sprite1.spriteFrame = subFrame
                    subFrame = atlas.getSpriteFrame(str2);
                    sprite2.spriteFrame = subFrame
                } else {

                }
                if(i === parseInt(this.leve)) {
                    this.itemAnimate(this.level);
                }
            }
            //添加完成后，显示在第一页
            this.pageView.scrollToPage(0);
        }.bind(this));

      // let a =  this.pageView.getCurrentPageIndex()
    },

    buttonCallback : function (event) {
        cc.log(event)
        vv.selectLevel = event.target.tag
        cc.director.loadScene("game")
    }
    // update (dt) {},
});
