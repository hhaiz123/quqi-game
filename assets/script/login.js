
cc.Class({
    extends: cc.Component,

    properties: {
        progressBar : {
            default : null,
            type : cc.ProgressBar
        },
        text : {
            default : null,
            type : cc.Label
        },
        num : 0
    },

    onLoad () {
        this.time = 0;
        this.login = true;
    },

    start () {
        this.schedule(function() {

        }.bind(this),0.01)
    },

    update (dt) {
        this.time += dt;
        if(this.time >= 0.01 && this.login) {
            cc.log(this.progressBar.progress)
            this.progressBar.progress = (++this.num) % 100
            this.text.string = "loding " + this.num + "%"
            if(this.num === 98){
                cc.director.loadScene("main")
                this.login = false;
            }
            this.time = 0;
        }

    },
});
