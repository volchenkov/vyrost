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