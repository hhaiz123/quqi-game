
cc.Class({
    extends: cc.Component,

    properties: {
        targetArr: {
            default: [],
            type: cc.Node
        },
        actionTime: 0.3,
        dropFrom: 300,
        actionType: "drop",
        scaleFrom: 0.8,
        opacityFrom: 0
    },

    initOpacity(node) {
        node.opacity = this.opacityFrom;
    },

    runDropAction(node,actionTime) {
        let endPosX = node.x;
        let endPosY = node.y;
        node.y += this.dropFrom;

        let move = cc.moveTo(actionTime,endPosX,endPosY);
        move.easing(cc.easeBackOut());
        let fade = cc.fadeIn(actionTime);
        let sequence = cc.spawn(fade,move);
        node.runAction(sequence);
    },

    runScalAction(node,actionTime) {
        let endScale = node.scale;
        node.scale = this.scaleFrom;
        let scaleAction = cc.scaleTo(actionTime,endScale);
        let fade = cc.fadeIn(actionTime);
        node.runAction(cc.spawn(fade,scaleAction));
    },

    // onLoad () {},

    getFunc() {
        switch(this.actionType) {
            case "drop" :
            return this.runDropAction;
            break;
            case "scale" :
            return this.runScalAction;
            break;
        }
    },

    start () {
        let actionFunc = this.getFunc();
        for(let i=0; i<this.targetArr.length; i++) {
            let node = this.targetArr[i];
            this.initOpacity(node);
            actionFunc.call(this,node,this.actionTime);
        }
    },

    //update (dt) {},
});
