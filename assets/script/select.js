
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
    },

     onLoad () {
        require("userData")
        this.passNode.active = false
        this.listBg.active = false
        this.num = [];
        this.pageCount = 0;
        this.itemArr = [];

        let level = cc.sys.localStorage.getItem('level')
        if (!vv.level) {
            vv.level = 1
            cc.sys.localStorage.setItem('level',1)
        } else {
            vv.level = parseInt(level);
        }
     },

    itemAnimate : function(index) {
        let item = this.itemArr[index];
        if(item) {
            let node = item.getChildByName("bg");
            let bg = node.getComponent(cc.Sprite);
            cc.loader.loadRes('select',cc.SpriteAtlas,function (err,atlas) {
                if(!err) {
                    let subFrame = atlas.getSpriteFrame("thislevel");
                    bg.spriteFrame = subFrame;
                    let animation = item.getComponent(cc.Animation);
                    animation.play("selectButton");
                }
            }.bind(this));
        }
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
                    this.pageCount++;
                }
                //往page里面添加level 图标
                let newPassNode = cc.instantiate(this.passNode)
                newPassNode.active = true
                newPassNode.setTag(i);
                this.itemArr[i] = newPassNode;
                this.contentLayout.addChild(newPassNode)
                let child = newPassNode.getChildByName("passNum")
                this.num.length = 0;
                for(let i=0; i<3; i++) {
                    let name = "num" + (i+1);
                    let node = child.getChildByName(name);
                    node.active = false;
                    this.num.push(node);
                }

                if(i < 10) {
                    let num1 = this.num[0].getComponent(cc.Sprite);
                    let str = 'xuanguanshuzi-' + i
                    let subFrame = atlas.getSpriteFrame(str);
                    num1.spriteFrame = subFrame
                    this.num[0].active = true;
                    //  sprite.spriteFrame.setTexture(cc.url.raw('select/xuanguanshuzi-1.png'));
                } else if(i < 100) {
                    let num1 = this.num[0].getComponent(cc.Sprite);
                    let num2 = this.num[1].getComponent(cc.Sprite);
                    let n1 = Math.floor(i / 10)
                    let n2 = i % 10
                    let str1 = 'xuanguanshuzi-' + n1
                    let str2 = 'xuanguanshuzi-' + n2
                    let subFrame = atlas.getSpriteFrame(str1);
                    num1.spriteFrame = subFrame
                    subFrame = atlas.getSpriteFrame(str2);
                    num2.spriteFrame = subFrame

                    this.num[0].active = true;
                    this.num[1].active = true;
                } else {
                    let num1 = this.num[0].getComponent(cc.Sprite);
                    let num2 = this.num[1].getComponent(cc.Sprite);
                    let num3 = this.num[2].getComponent(cc.Sprite);
                    let n1 = Math.floor(i / 100)
                    let n2 = (i - n1*100) / 10;
                    let n3 = i % 10;
                    let str1 = 'xuanguanshuzi-' + n1
                    let str2 = 'xuanguanshuzi-' + n2
                    let str3 = 'xuanguanshuzi-' + n3
                    let subFrame = atlas.getSpriteFrame(str1);
                    num1.spriteFrame = subFrame
                    subFrame = atlas.getSpriteFrame(str2);
                    num2.spriteFrame = subFrame
                    subFrame = atlas.getSpriteFrame(str3);
                    num3.spriteFrame = subFrame

                    this.num[0].active = true;
                    this.num[1].active = true;
                    this.num[2].active = true;
                }
            }
            this.itemAnimate(vv.level);
            //添加完成后，显示在第一页
            this.pageView.scrollToPage(0);
        }.bind(this));

      // let a =  this.pageView.getCurrentPageIndex()
    },

    backMainCallback : function() {
        cc.director.loadScene("main")
    },

    leftPageCallback : function() {
        let pageIdx = this.pageView.getCurrentPageIndex();
        if(pageIdx > 0) {
            this.pageView.scrollToPage(pageIdx - 1);
        }
    },

    rightPageCallback : function() {
        let pageIdx = this.pageView.getCurrentPageIndex();
        if(pageIdx < this.pageCount - 1) {
            this.pageView.scrollToPage(pageIdx + 1);
        }
    },


    buttonCallback : function (event) {
        cc.log(event)
        vv.selectLevel = event.target.tag
        cc.sys.localStorage.setItem("level",vv.selectLevel);
        cc.director.loadScene("game")
    }
    // update (dt) {},
});
