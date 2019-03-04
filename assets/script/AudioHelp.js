
cc.Class({
    extends: cc.Component,

    properties: {
        monsterSelect : {
            default: [],
            type : cc.AudioClip
        },
        backMusic : {
            default:null,
            type : cc.AudioClip
        },
        eatMusic : {
            default:null,
            type: cc.AudioClip
        },
        successMusic: {
            default: null,
            type: cc.AudioClip
        },
        monsterVolumn : 1,
        backMusicVolumn : 0.1,
        eatMusicVolumn : 0.5
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

    playBackMusic() {
        if(!vv.bgFlag) {
            cc.audioEngine.play(this.backMusic,true,0.1);
            vv.bgFlag = true;
        }
    },

    playEatMusic() {
        this.eatAudioId = cc.audioEngine.play(this.eatMusic,true,this.eatMusicVolumn);
    },
    
    pauseEatMusic() {
        if(this.eatAudioId) {
            cc.audioEngine.stop(this.eatAudioId);
        }
    },

    playSuccessMusic() {
        cc.audioEngine.play(this.successMusic,false,1);
    },
    // onLoad () {},

    start () {
        if(vv.bgFlag === undefined) {
            vv.bgFlag = false;
        }

    },

    // update (dt) {},
});
