
cc.Class({
    extends: cc.Component,

    properties: {

    },

    getNodeJs (node) {
        if(!node) return null;
        let nodeJs;
        let name = node.name;
        if(name === "monster") {
            nodeJs = node.getComponent(vv.monsterJs);
        }else if(name === "oneCookie"){
            nodeJs = node.getComponent(vv.cookieJs);
        } else {
            nodeJs = null;
        }
        return nodeJs;
    },
    
});
