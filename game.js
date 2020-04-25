/** --- lib staff --- */
function rnd(min, max) {
    return Math.random() * (max - min) + min;
}

function rndFrom(l) {
    return l[Math.floor(Math.random() * l.length)]
}

function rndStr() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function color(r, b, g) {
    var o = Math.round, 
        n = Math.random,
        s = 160;
    
    return `rgba(${r || o(n()*s)}, ${b || o(n()*s)}, ${g || o(n()*s)}, 0.5)`;
}
/** ---------------- */

eventBus = document.createElement('i')

class Level {
    /** Current state of game objects */
    constructor() {
        this.id = rndStr()
        this.foods = []
        this.creatures = []

        eventBus.addEventListener('creatureDeath', (e) => {
            this.creatures.splice(this.creatures.findIndex(c => c.id === e.detail.creature.id), 1)
            if (this.creatures.length === 1) {
                eventBus.dispatchEvent(new CustomEvent('lastCreature', {detail: this.creatures[0]}))
            }
        })
    }

    collideBorders(canvas) {
        this.creatures.forEach(c => {
            // prevent out of borders movement
            let nextX = c.pos.x + c.speed().x 
            if (nextX > canvas.width - c.size.x / 2 || nextX < c.size.x / 2) {
                c.direction.multiply(new Vector2(-1, 1));
            }
            let nextY = c.pos.y + c.speed().y
            if (nextY > canvas.height - c.size.y / 2 || nextY < c.size.y / 2) {
                c.direction.multiply(new Vector2(1, -1));
            }

            c.act(this)
        });
    }

    collideFoods() {
        this.creatures.forEach(c => {
            this.foods.forEach((f, i) => {
                if (f.pos.distance(c.pos) <= Math.max(c.size.x, c.size.y)) {
                    c.eat(f);
                    this.foods.splice(i, 1);
                }
            })
        })
    }

    collideCreatures() {
        this.creatures.forEach(c1 => {
            this.creatures.forEach(c2 => {
                if (c1.id === c2.id) {
                    return
                }
                if (c1.pos.distance(c2.pos) <= Math.max(c1.size.x, c2.size.x)) {
                    if (c1.weight < c2.weight) {
                        c1.weight -= c2.power
                    } else if (c1.weight > c2.weight) {
                        c2.weight -= c1.power
                    } else {
                        c1.weight -= c2.power
                    }
                    if (c1.weight < 0) {
                        c1.die()
                    }
                    if (c2.weight < 0) {
                        c2.die()
                    }
                }
            })
        })
    }

}

class Smell {
    
    constructor(intensity, color) {
        this.intensity = intensity
        this.color = color
    }

}

class Food {

    constructor() {
        this.id = rndStr()
        this.pos = new Vector2()
        this.value = rnd(10,20)
        this.smell = new Smell(rnd(50, 100), color())
    }

    get size() {
        return {
            x: this.value,
            y: this.value
        }
    }

}

class Player {
    constructor() {
        
    }
}

class Creature {
    
    constructor(npc) {
        let rndBlue = () => `hsl(240, ${rnd(30, 80)}%, ${rnd(30, 80)}%)`;

        this.pos = new Vector2()
        this.weight = rnd(5, 20) 
        this.maxSpeed = rnd(2, 6) / 2
        this.direction = new Vector2(rndFrom([-1, 1]) * Math.random(), rndFrom([-1, 1]) * Math.random())
        this.skin = !npc ? '#FF008F' : rndBlue()
        this.satiety = 100
        this.npc = npc
        this.id = rndStr()
        this.smell = new Smell(rnd(100, 150), color(200, 10, 0))
    }

    get size() {
        return {x: this.weight, y: this.weight}
    }

    eat(food) {
        this.satiety += food.value;
    }

    speed(a=1) {
        return this.direction.product(this.maxSpeed * a)
    }

    get power() {
        return this.weight / 100
    }

    // calc near smelling food
    sniff(lvl) {
        let smelledCreatures = lvl.creatures.filter(c => c.id !== this.id && c.smell.intensity > c.pos.distance(this.pos))
        if (smelledCreatures.length > 0) {
            return smelledCreatures.sort((c1, c2) => this.pos.distance(c1.pos) - this.pos.distance(c2.pos))[0]
        }

        let smelledFood = lvl.foods.filter(f => f.smell.intensity > f.pos.distance(this.pos))
        if (smelledFood.length > 0) {
            return smelledFood.sort((f1, f2) => this.pos.distance(f1.pos) - this.pos.distance(f2.pos))[0]
        }

        return null
    }

    act(lvl) {
        this.feelHunger()
        let nearestFood = this.sniff(lvl)
        if (nearestFood) {
            this.moveTo(nearestFood.pos)
        } else {
            this.search()
        }
    }

    moveTo(v) {
        this.direction = v.diff(this.pos).normalize()
        this.pos.add(this.speed())
    }

    search() {
        this.pos.add(this.speed())
    }

    feelHunger(hunger=0.3) {
        this.satiety -= hunger
        if (this.satiety < 0) {
            this.decay()
        }
    }

    decay() {
        this.maxSpeed = 0
        this.weight -= 0.05

        if (this.weight < 0) {
           this.die()
        }
    }

    die() {
        eventBus.dispatchEvent(new CustomEvent('creatureDeath', {detail: {creature: this}}))
    }
}

class Game {
     
    constructor(canvas) {
        this.canvas = canvas
        this.level = null
        this.player = new Player()
    }

    start(vars) {
        let tick = () => {
            this.level.collideBorders(this.canvas)
            this.level.collideFoods(this.canvas)
            this.level.collideCreatures()
    
            this.render(this.canvas, this.level)
    
            requestAnimationFrame(tick);
        }

        eventBus.addEventListener('lastCreature', (e) => {
            this.level = this.createLevel(vars, this.canvas)
        })

        this.level = this.createLevel(vars, this.canvas)

        requestAnimationFrame(tick);
    }

    createLevel(vars, canvas) {
        let lvl = new Level();
        
        // generate food
        for (let i = 0; i < vars.foodAmount; i++) {
            let f = new Food();
            f.pos.set(rnd(0, canvas.width), rnd(0, canvas.height)) 
            lvl.foods.push(f)
        }

        // generate npc creatures
        for (let j = 0; j < vars.npcCreaturesAmount; j++) {
            let c = new Creature(true)
            c.pos.set(
                rnd(c.size.x, canvas.width - c.size.x),
                rnd(c.size.y, canvas.height - c.size.y)
            )
            lvl.creatures.push(c);
        }

        let playerCreature = new Creature(false)
        playerCreature.pos.set(this.canvas.width / 2, this.canvas.height / 2)
        lvl.creatures.push(playerCreature)

        return lvl
    }

    render(canvas, level) {
        let ctx = canvas.getContext("2d")
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // render food
        // let coloredFood = pCreature.smelledFood.map(f => f.id) 
        level.foods.forEach(f => {
            ctx.beginPath();
            ctx.rect(f.pos.x - f.size.x/2, f.pos.y - f.size.y/2, f.size.x, f.size.y);
            // ctx.fillStyle = coloredFood.includes(f.id) ? '#43DF39' : '#cceecc'; 
            ctx.fillStyle = '#99ee99'; 
            ctx.fill();
            ctx.closePath();

            if (debug) {
                ctx.beginPath();
                ctx.arc(f.pos.x, f.pos.y, f.smell.intensity, 0, 2*Math.PI, false);
                ctx.lineWidth = 1;
                ctx.strokeStyle = f.smell.color;
                ctx.stroke();
            }
        });


        // draw remaining food counter
        ctx.font = "15px Arial";
        ctx.fillText(level.foods.length, 10, 20);

        // draw creatures
        level.creatures.forEach(c => {
            // draw creature area 
            ctx.beginPath();
            ctx.rect(c.pos.x - c.size.x/2, c.pos.y - c.size.y/2, c.size.x, c.size.y);
            ctx.fillStyle = c.skin;
            ctx.fill();
            ctx.closePath();

            // if (c.satiety > 0) {
            //     ctx.fillText(c.satiety.toFixed(1), c.pos.x - 15, c.pos.y + c.size.y + 10);
            // }

            // draw creature smelling area
            if (debug) {
                ctx.beginPath();
                ctx.arc(c.pos.x, c.pos.y, c.smell.intensity, 0, 2*Math.PI, false);
                ctx.lineWidth = 1;
                ctx.strokeStyle = c.smell.color;
                ctx.stroke();

                // path to nearest food
                let target = c.sniff(level);
                if (target) {
                    ctx.beginPath();
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 2;
                    ctx.moveTo(c.pos.x, c.pos.y);
                    ctx.lineTo(target.pos.x, target.pos.y);
                    ctx.stroke()
                }
            }
        });
    }
}
