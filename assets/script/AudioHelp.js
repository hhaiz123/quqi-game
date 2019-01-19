
cc.Class({
    extends: cc.Component,

    properties: {
        monsterSelect : {
            default: [],
            type : cc.AudioClip
        },
        monsterVolumn : 0.1
    },

    getRandom(min,max) {
        let distance = max - min;
        let rand = Math.floor(Math.random() * distance);
        return rand + min;
    },

    playMonster() {
        let length = this.monsterSelect.length;
        if(length === 0) return;
        let idx = this.getRandom(0,length - 1);
        cc.audioEngine.play(this.monsterSelect[idx],false,this.monsterVolumn);
    },

    // onLoad () {},

    start () {

    },

    // update (dt) {},
});
