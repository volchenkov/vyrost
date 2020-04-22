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
/** ---------------- */


class Vector2 
{

    constructor(x=0, y=0) {
        this.x = x 
        this.y = y
    }

    get len() {
        return Math.hypot(this.x, this.y)
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    clone() {
        return new Vector2(this.x, this.y)
    }

	add(v) { 
        if (v instanceof Vector2) {
            this.x += v.x
            this.y += v.y
        } else {
            this.x += v
            this.y += v 
        }

        return this 
    }

    multiply(v) {
        if (v instanceof Vector2) {
            this.x *= v.x
            this.y *= v.y
        } else {
            this.x *= v
            this.y *= v
        }

        return this
    }

    distance(v) {
        return Math.hypot(this.x - v.x, this.y - v.y)
    }

    set(x, y) { 
        this.x = x
        this.y = y
        return this
    }

    sub(v) {
        this.x -= v.x
        this.y -= v.y

        return this
    }

    normalize(scale=1) {
        let len = this.len;

        return len > 0 ? this.multiply(scale / len) : this.Set(scale, y=0);
    }

    diff(v) {
        return this.clone().sub(v)
    }

    product(v) {
        return this.clone().multiply(v)
    }

	// Subtract(v)           { (this.x -= v.x, this.y -= v.y) ; return this;  }
	// Multiply(v)           { (v instanceof Vector2)? (this.x *= v.x, this.y *= v.y) : (this.x *= v, this.y *= v); return this;  }
	// Set(x, y)             { this.x = x; this.y = y; return this;  }
    // AddXY(x, y)           { this.x += x; this.y += y; return this;  }
    // Normalize(scale=1)    { let l = this.Length(); return l > 0 ? this.Multiply(scale/l) : this.Set(scale,y=0); }
    // ClampLength(length)   { let l = this.Length(); return l > length ? this.Multiply(length/l) : this; }
    // Rotate(a)             { let c=Math.cos(a);let s=Math.sin(a);return this.Set(this.x*c - this.y*s,this.x*s - this.y*c); }
    // Round()               { this.x = Math.round(this.x); this.y = Math.round(this.y); return this; }
    // Length()              { return Math.hypot(this.x, this.y ); }
    // Distance(v)           { return Math.hypot(this.x - v.x, this.y - v.y ); }
    // Angle()               { return Math.atan2(this.y, this.x); };
    // Rotation()            { return (Math.abs(this.x)>Math.abs(this.y))?(this.x>0?2:0):(this.y>0?1:3); }   
    // Lerp(v,p)             { return this.Add(v.Clone().Subtract(this).Multiply(p)); }
    // DotProduct(v)         { return this.x*v.x+this.y*v.y; }
}

class Level {
    /** Current state of game objects */
    constructor() {
        this.foods = []
        this.creatures = []
    }
}

class Food {
    constructor() {
        this.pos = new Vector2()
        this.value = rnd(10,20)
        this.id = rndStr()
    }

    get size() {
        return {
            x: this.value,
            y: this.value
        }
    }

}

class Creature {
    constructor(npc) {
        let maxSpeed = rnd(2, 6) / 2; 
        let rndBlue = () => `hsl(240, ${rnd(30, 80)}%, ${rnd(30, 80)}%)`;

        this.pos = new Vector2()
        this.weight = rnd(5, 20) 
        this.maxSpeed = maxSpeed
        this.direction = new Vector2(rndFrom([-1, 1]) * Math.random(), rndFrom([-1, 1]) * Math.random())
        this.skin = !npc ? '#FF008F' : rndBlue()
        this.smellingR = rnd(50, 100),
        this.satiety = 100
        this.npc = npc
        this.id = rndStr()
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

    // calc near smelling food
    sniff(lvl) {
        let smelledFood = lvl.foods.filter(f => this.smellingR > f.pos.distance(this.pos))

        return smelledFood 
            ? smelledFood.sort((f1, f2) => this.pos.distance(f1.pos) - this.pos.distance(f2.pos))[0] 
            : null
    }

    act(lvl) {
        let nearestFood = this.sniff(lvl)
        if (nearestFood) {
            this.moveTo(nearestFood.pos)
        } else {
            this.search()
        }
    }

    moveTo(v) {
        let direction = v.diff(this.pos).normalize()
        this.pos.add(direction.multiply(this.maxSpeed))
    }

    search() {
        this.pos.add(this.speed())
    }
}


class Game {
     
    constructor(canvas, vars) {
        this.canvas = canvas
        this.vars = vars
        this.cc = canvas.getContext("2d")

        this.player = new Creature(false)

        this.levelsPassed = 0
    }

    newLevel() {
        let lvl = new Level();
        
        // generate food
        for (let i = 0; i < this.vars.foodAmount; i++) {
            let f = new Food();
            f.pos.set(rnd(0, this.canvas.width), rnd(0, this.canvas.height)) 
            lvl.foods.push(f)
        }

        this.player.pos.set(
            this.canvas.width / 2,
            this.canvas.height / 2
        )
        lvl.creatures.push(this.player)

        // generate creatures
        for (let j = 0; j < this.vars.npcCreaturesAmount; j++) {
            let c = new Creature(true)
            c.pos.set(
                rnd(c.size.x, this.canvas.width - c.size.x),
                rnd(c.size.y, this.canvas.height - c.size.y)
            )
            lvl.creatures.push(c);
        }

        this.lvl = lvl;
        this.tick()
    }

    tick() {
        // move creatures
        this.lvl.creatures.forEach(c => {
            // prevent out of borders movement
            let nextX = c.pos.x + c.speed().x 
            if (nextX > this.canvas.width - c.size.x / 2 || nextX < c.size.x / 2) {
                c.direction.multiply(new Vector2(-1, 1));
            }
            let nextY = c.pos.y + c.speed().y
            if (nextY > this.canvas.height - c.size.y / 2 || nextY < c.size.y / 2) {
                c.direction.multiply(new Vector2(1, -1));
            }

            c.act(this.lvl)
        });

        // collide foods
        this.lvl.creatures.forEach(c => {
            this.lvl.foods.forEach((f, i) => {
                if (f.pos.distance(c.pos) <= Math.max(c.size.x, c.size.y)) {
                    c.eat(f);
                    this.lvl.foods.splice(i, 1);
                }
            })
        })

        this.render()

        if (this.lvl.foods.length === 0) {
            this.levelsPassed++
            this.newLevel()
        } else {
            requestAnimationFrame(this.tick.bind(this));
        }
    }

    render() {
        let ctx = this.cc
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // render food
        // let coloredFood = pCreature.smelledFood.map(f => f.id) 
        this.lvl.foods.forEach(f => {
            ctx.beginPath();
            ctx.rect(f.pos.x - f.size.x/2, f.pos.y - f.size.y/2, f.size.x, f.size.y);
            // ctx.fillStyle = coloredFood.includes(f.id) ? '#43DF39' : '#cceecc'; 
            ctx.fillStyle = '#cceecc'; 
            ctx.fill();
            ctx.closePath();
        });


        // draw remaining food counter
        ctx.font = "15px Arial";
        ctx.fillText(this.lvl.foods.length, 10, 20);

        // draw creatures
        this.lvl.creatures.forEach(c => {
            // draw creature area 
            ctx.beginPath();
            ctx.rect(c.pos.x - c.size.x/2, c.pos.y - c.size.y/2, c.size.x, c.size.y);
            ctx.fillStyle = c.skin;
            ctx.fill();
            ctx.closePath();

            // draw creature smelling area
            if (debug) {
                ctx.beginPath();
                ctx.arc(c.pos.x, c.pos.y, c.smellingR, 0, 2*Math.PI, false);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#ddd';
                ctx.stroke();

                let target = c.sniff(this.lvl);
                if (target) {
                    let sub = target.pos.distance(c.pos)
                    ctx.fillText(sub, c.pos.x + 10, c.pos.y);
                    ctx.fillText(target.size.x, c.pos.x + 10, c.pos.y + 15);

                    // path to nearest food
                    ctx.beginPath();
                    ctx.strokeStyle = '#aaa';
                    ctx.lineWidth = 1;
                    ctx.moveTo(c.pos.x, c.pos.y);
                    ctx.lineTo(target.pos.x, target.pos.y);
                    ctx.stroke()
                }
            }
        });
    }
}
