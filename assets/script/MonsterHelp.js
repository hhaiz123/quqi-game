
cc.Class({
    extends: cc.Component,

    properties: {
        floor: {
            default : null,
            type : cc.Node
        },
        steleton: {
            default : null,
            type : sp.Skeleton
        },
        monster: {
            default : null,
            type : cc.Node,
        },
        particle: {
            default: null,
            type: cc.ParticleSystem
        }

    },

     onLoad () {
        this.isClick = false;
        this.particleFlag = false;
        this.isEat = false;
        this.roadArr = [];
        this.monsterRoad = [];
        this.xDir = cc.v2(0,0);
        this.idx = 0;
        this.speed = 250;
     },

    initGameData() {
        this.monsterValue = this.value;
        this.isClick = true;
        this.particle.stopSystem();
    },

    updateMonster : function(index) {
        this.setFloorCol(index);
        this.value = index;

        let num = index - 9;
        this.cnfPath = "monster/" + num +"/monster" + num
        cc.loader.loadRes(this.cnfPath,sp.SkeletonData,function(err,data) {
            this.steleton.skeletonData = data;
            this.steleton.setAnimation(0,"openMouth",true);
        }.bind(this));
    },

    setFloorCol : function(index) {
        switch(index) {
        case 10:
            this.floor.color = new cc.Color(158, 227, 174);
            break;
        case 11:
            this.floor.color = new cc.Color(234, 218, 113);
            break;
        case 12:
            this.floor.color = new cc.Color(227, 134, 165);
            break;
        case 13:
            this.floor.color = new cc.Color(211, 152, 227);
            break;
        case 14:
            this.floor.color = new cc.Color(147, 142, 220);
            break;
        case 15:
            this.floor.color = new cc.Color(192, 87, 141);
            break;
        }

    },

    getFloorCol () {
        return this.floor.color;
    },

    getMonster () {
        return this.monster;
    },

    eatAnimation() {
        this.steleton.setAnimation(0,"eat",true);
    },

    getNodePos(nodeId) {
        let node = vv.material[nodeId];
        let cooPos = node.getPosition();
        let parent = node.parent;
        let worldPos = parent.convertToWorldSpaceAR(cooPos);
        let monsterPos = this.node.convertToNodeSpaceAR(worldPos);
        return monsterPos;
    },

    resetMove() {
        this.isEat = false;
        this.monster.setPosition(0,0);
        this.monsterRoad.length = 0;
        this.idx = 0;
        this.steleton.setAnimation(0,"openMouth",true);
    },

    setRoad(roadArr) {
        this.roadArr = roadArr;
        for(let i=0; i<roadArr.length - 1; i++) {
            let curNodeId = roadArr[i];
            let curPos = this.getNodePos(curNodeId);
            let nextNodeId = roadArr[i + 1];
            let nextPos = this.getNodePos(nextNodeId);
            let dir = cc.v2(nextPos.x - curPos.x,nextPos.y - curPos.y);
            let angle = dir.signAngle(this.xDir);
            this.monsterRoad.push({"pos":curPos,"angle":angle});
            if(i === roadArr.length - 2) {
                this.monsterRoad.push({"pos":nextPos,"angle":0});
            }
        }
        this.eatAnimation();
        this.isEat = true;
    },

    move(dt) {
        if(this.monsterRoad.length - 1 <= this.idx)  {
            cc.systemEvent.emit("Game:MonsterEnd");
            this.isEat = false;
            return;
        };
        let curData = this.monsterRoad[this.idx];
        let nextData = this.monsterRoad[this.idx + 1];
        let curPos = this.monster.getPosition();
        let distance = curPos.sub(nextData.pos).mag();
        let deltaDis = this.speed * dt;
        if(distance * distance <= deltaDis * deltaDis) {
            this.monster.x = nextData.pos.x;
            this.monster.y = nextData.pos.y;

            let nodeId = this.roadArr[this.idx + 1];
            cc.systemEvent.emit("Game:MonsterArrive",nodeId);
            this.idx++;
        } else {
            let x = Math.cos(curData.angle) * deltaDis;
            let y = Math.sin(curData.angle) * deltaDis;
            this.monster.x += x;
            this.monster.y += y;
        }
    },

    setParticle () {
        if(this.particle.particleCount <= 0) {
            this.particle.resetSystem();
        }
    },

    update (dt) {
        if(this.isEat) {
            this.setParticle();
            this.move(dt);
        }
    },
});
