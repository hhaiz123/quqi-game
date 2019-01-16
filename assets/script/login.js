
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

    // onLoad () {},

    start () {
        this.schedule(function() {
cc.log(this.progressBar.progress)
            this.progressBar.progress = (++this.num) / 100
            this.text.string = "loding " + this.num + "%"
            if(this.num === 100){
                this.unschedule()
                cc.director.loadScene("main")
            }
        }.bind(this),0.01)
    },

    //update (dt) {},
});
