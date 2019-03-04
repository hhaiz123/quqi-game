
cc.Class({
    extends: cc.Component,

    properties: {
        audio : {
            default : null,
            type : cc.Prefab
        }
    },

     onLoad () {
        window.vv = {};
        vv.passNum = 98;
        vv.selectLevel = -1;
        vv.matTypeOfNum = [];
        vv.material = [];
        vv.monsterColor = [];
        vv.begin = false;
        vv.cellWidth = 120;
        vv.cellHeight = 120;
        vv.row = null;
        vv.column = null;
        vv.audioHelpJs = require("AudioHelp");
        vv.monsterJs = require("MonsterHelp");
        vv.cookieJs = require("cookieHelp");

        let level = cc.sys.localStorage.getItem('level')
        if (!vv.level) {
            vv.level = 1
            cc.sys.localStorage.setItem('level',1)
        } else {
            vv.level = parstInt(level);
        }

     },

    start () {
        cc.log("userdata start");
    },

    // update (dt) {},
});
