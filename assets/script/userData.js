
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

        // window.Global = {}
        // window.Global.passNum = 98;
        // window.Global.selectLevel = -1;
     },

    start () {

    },

    // update (dt) {},
});
