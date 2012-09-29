/**
 * @requires 'models/.js'
 */
(function(cp) {
    /** @type {number} Cached reference of game's play area */
    var _gameWidth = null;

    /** @type {number} Cached reference of game's play area */
    var _gameHeight = null;

    var _playerSize = 10;

    var _private = {
        calcMag: function (obj) {
            var speedCalc = obj.speedX * obj.speedX + obj.speedY * obj.speedY;
            return Math.sqrt(speedCalc);
        }
    };

    cp.template.Player = cp.template.Entity.extend({
    	type: 'a',
        name: 'player', // Do not remove, used for search functionality elsewhere

        width: 80,
        height: 80,
        color: '#f0f',

        angle: 0,

        speedX: 0,
        speedY: 0,
        accelRate: 0.2,
        maxSpeed: 5,
        minSpeed: -5,

        turnRate: 0.025,
        turnLeft: false,
        turnRight: false,

        init: function (serverID) {
            if (_gameWidth === null) {
                _gameWidth = cp.core.canvasWidth;
            }
            if (_gameHeight  === null) {
                _gameHeight = cp.core.canvasHeight;
            }

            // Center the player by default
            this.x = (_gameWidth / 2) - (this.width / 2);
            this.y = (_gameHeight / 2) - (this.height / 2);

            // Set boundaries
            this.boundaryRight = _gameWidth - this.width;
            this.boundaryBottom = _gameHeight - this.height;

            // Set ID
            this.id = serverID;
        },

        draw: function() {
	        cp.ctx.fillStyle = this.color;
	        cp.ctx.fillRect(this.x, this.y, this.width, this.height);
	        return;

            //this._super();

            cp.ctx.save(); //save the current draw state

			//set drawing area to where the tank is
			cp.ctx.translate(this.x,this.y);

			//rotate drawing area
			cp.ctx.rotate(this.angle);

			//set the color to the color of the body of the tank
			cp.ctx.fillStyle = this.color;"rgb(255,0,255)"; //white
			//draw rectangle (main body)
	        cp.ctx.fillRect(-this.length/2,-this.width/2,this.length,this.width);


			//set color to grey
			cp.ctx.fillStyle = this.color;
			//draw rectangle (front)
	        cp.ctx.fillRect(0,-this.width/3,this.length/2,this.width*2/3);

			cp.ctx.restore(); //restore the previous draw state
        },

        /**
         * @todo The keyboard input for directions really needs to be optimized
         */
        update: function () {
            //this._super();

            //console.log(Math.round(cp.input.accel.x / 120));


            //// update our position based on our speed
            this.x = this.x + this.speedX; // times delta time, times momentum
            this.y = this.y + this.speedY; // times delta time, times momentum
            //this.x = this.x + this.speed * Math.cos(this.angle);
            //this.y = this.y + this.speed * Math.sin(this.angle);
            //console.log(cp.input.accel.alpha);

			//// Determine boundary collisions
			//if hitting east side
			if(this.x > this.boundaryRight - 5) {
				this.x = this.boundaryRight - 5;
			}
			//if hitting west side
			if(this.x < 5) {
				this.x = 5;
			}
			//if hitting south side
			if(this.y > this.boundaryBottom - 5) {
				this.y = this.boundaryBottom - 5;
			}
			//if hitting north side
			if(this.y < 5) {
				this.y = 5;
			}

            if(this.speedX || this.spedY) {
	    		socket.emit('entity-server-update', { id: this.id, x: this.x, y: this.y} );
            }
        },

		turnLeft: function() {
			this.turn(-1);
		},

		turnRight: function() {
			this.turn(1);
		},

		turn: function(direction) {
			this.angle = (this.angle + direction * this.turnRate) % (2 * Math.PI);
		},

        collide: function (obj) {
            if (obj.name === 'player') {
                // Who hit who?
                if (_private.calcMag(this) > _private.calcMag(obj)) {
                    console.log('enemy smash');
                } else {
                    console.log('player smash');
                }

            // Must be a powerup
            } else {

            }

            //this.deathCount += 1;
        },

        kill: function () {
            // Increment deaths stat, id - 6
            //cp.stats.incrementData(6);

           // cp.game.spawn('Continue', this);
           // this._super();
        }

    });

    cp.template.ActivePlayer = cp.template.Player.extend({
    	type: 'a',

    	update: function(){
    		//// Update our input
            if (window.DeviceMotionEvent) {
                this.speedX = Math.round(cp.input.accel.x / 10 * -1);
                this.speedY = Math.round(cp.input.accel.y / 10 * -1);
            } else {
                //if(this.keyboard)
              //  {
                    // left
                    if (cp.input.press('left')) {
                        //this.turnLeft();
                        if(this.speedX > this.minSpeed)
                        {
                            this.speedX -= 1;
                        }
                    // Right
                    } else if (cp.input.press('right')) {
                        //this.turnRight();
                        if(this.speedX < this.maxSpeed)
                        {
                            this.speedX += 1;
                        }
    
                    // Up
                    } else if (cp.input.press('up')) {
                        /* use accelleration */
                        //if (this.speed < this.maxSpeed)
                         //   this.speed += this.accelRate;
                        if(this.speedY > this.minSpeed)
                        {
                            this.speedY -= 1;
                        }
                        
                    // Down
                    } else if (cp.input.press('down')) {
                        if(this.speedY < this.maxSpeed)
                        {
                            this.speedY += 1;
                        }
                    }
                    
                    // Decay speed
                    var zero = 0;
                    if(cp.input.up('up')) {
                        if(this.speedY > zero)
                        {
                            this.speedY -= 1;
                        }
                    } if(cp.input.up('down')) {
                        if(this.speedY < 0)
                        {
                            this.speedY += 1;
                        }
                    } if(cp.input.up('left')) {
                        if(this.speedX < 0)
                        {
                            this.speedx += 1;
                        }
                    } if(cp.input.up('right')) {
                        if(this.speedX > 0)
                        {
                            this.speedx -= 1;
                        }
                    }
               // }
                
            }

            // Call the Player Update
            this._super();
    	}
    });

    cp.template.RemotePlayer = cp.template.Player.extend({
    	type: 'b',

    	update: function(){
    		//// Speed, Position is updated by the server
    		this._super();
    	},

    	updateStats: function(){
    		// Updates speed, position, etc
    		//this.speed = whateverFromServer;
    		//this.x =
    		//this.y =
    		//this.angle =
    	},

        collide: function() {

        }
    });

}(cp));