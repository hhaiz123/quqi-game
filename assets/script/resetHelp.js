
cc.Class({
    extends: cc.Component,

    properties: {
        roadHint: {
            default: null,
            type: cc.Button
        }
    },

    // onLoad () {},


    resetCallback() {
        this.roadHint.interactable = true;
        this.gameJs.resetGame();
        this.hintJs.removeLine();
    },

    start () {
        this.hintJs = this.node.getComponent("RoadHint");
        this.gameJs = this.node.getComponent("game");
    },

    // update (dt) {},
});
