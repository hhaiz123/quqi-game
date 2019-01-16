
cc.Class({
    extends: cc.Component,

    properties: {
        button : {
            default : null,
            type : cc.Node
        },
        time : 0
    },

    // onLoad () {},

    start () {
        this.button.getComponent(cc.Animation).play("btAnimal")
    },

     update (dt) {
        // this.time += dt
        // if(this.time > )
     },

     callBack : function() {
         cc.director.loadScene("select")
     }
});
