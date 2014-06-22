/**
 *
 * in jQuery 1.0.0
 * Author: pwwang (http://pwwang.com)
 * Date: 2009.10.24
 *
 * Use it anyway but to remain the author's information.
 * 
 **/
 
var s = {
	width		: 11,
	height		: 23,
	squares		: [],
	previews	: [],
	showScale	: true,
	realClasses	: ['seq0','seq1', 'seq2', 'seq3','seq4','seq5','seq6','seq7','seq8','seq9'],
	gridClass	: 'squareGrid',
	noGridClass	: 'squareNoGrid',
	rawClass	: 'squareGrid',
	stripClass	: { 'background-color' : 'red' },
	shadowClass	: 'shadow',
	wrapper		: '#wrapper',
	goButton	: '.go',
	gridButton	: '.grid',
	shadowButton: '.shadow',
	pauseButton	: '.pause',
	levelSpan	: '#level',
	linesSpan	: '#lines',
	scoreSpan	: '#score',
	previewSpan	: '#preview',
	rotateKey	: 38,
	leftKey		: 37,
	rightKey	: 39,
	downKey		: 40,
	spaceKey	: 32,
	// pauseKey	: 80,
	// gridKey		: 71,
	// shadowKey	: 83,
	enterKey	: 13,
	upgradeLine	: 10,
	firstLevelInterval: 1200,
	dsecPerLevel: 100
};

var = function(level){
	this.shape = null;
	this.preview = null;
	this.shadowFlag = true;
	this.intvObj = null;
	this.level = level || 1;
	this.nextSeq = 0;
	if(this.level > s.firstLevelInterval / s.dsecPerLevel)
	    this.interval = parseInt(s.firstLevelInterval / this.level);
	else
		this.interval = parseInt(s.firstLevelInterval-s.dsecPerLevel*(this.level-1));
	this.mask$ = $('<div>')
		.css({
			'opacity'			: 0.7,
			'background-color'	: '#fff',
			'display' 			: 'block',
			'position' 			: 'absolute',
			'top'				: '60px',
			'left'				: '14px',
			'width'				: '242px',
			'height'			: '506px',
			'z-index'			: '999',
			'text-align'		: 'center',
			'vertical-align'	: 'middle',
			'color'				: 'black'
		});	
	var tmpSqr = [];
	var square$;
	for( var i=0; i<s.width*s.height; i++ ) {
		square$ = $("<span>").addClass(s.rawClass).appendTo(s.wrapper);
		tmpSqr.push( new Square(i/s.width,i%s.width,square$) );
		if( (i+1) % s.width == 0 ){
			s.squares.push(tmpSqr);
			tmpSqr = [];
		}
	}
	var prev$;
	for( var i=0; i<16; i++ ){
		prev$ = $("<span>").appendTo(s.previewSpan);
		tmpSqr.push( prev$ );
		if( (i+1) % 4 ==0 ){
			s.previews.push(tmpSqr);
			tmpSqr = [];
		}
	}
	var t = this;
	var resetMask = function(){
		t.mask$.css({
			'top'	: (
					$(s.wrapper).offset().top +
					parseInt($(s.wrapper).css('border-top-width'))
				) + 'px',
			'left'	: (
					$(s.wrapper).offset().left +
					parseInt($(s.wrapper).css('border-left-width'))
				) + 'px'
		});
	};
	
	$(window)
		.resize(resetMask)
		.load(resetMask);
		
	this.msg('<b>Ready ?</b><br /><br />Click "Go!" to start!');
};

Tetris.prototype = {

	/**
	 * 
	 * Clear all the squares, return them to the original status.
	 * @param: 
	 *
	 **/
	clear: function(){
		for( var i=0; i<s.height; i++ ){
			for( var j=0; j<s.width; j++ ){
				s.squares[i][j].clear();
			}
		}
	},
	
	/**
	 * 
	 * Generate a new shape and bind the keydown event
	 * @param: 
	 *
	 **/	
	nextShape: function(seq){
		var t = this;
		if( typeof seq == 'undefined' )
			seq = parseInt(Math.random()*s.realClasses.length) % s.realClasses.length;
		t.shape = new Shape(seq);
		t.shape.shadowFlag = t.shadowFlag;
		t.shape.show();
		$(document).keydown( function(e){
			t.processKey.call(t,e);
		});
		this.nextSeq = parseInt(Math.random()*s.realClasses.length) % s.realClasses.length;
		this.preview = new Preview(this.nextSeq);
		this.preview.show();
	},
	
	/**
	 * 
	 * Reset Tetris, ready to run
	 * @param: 
	 *
	 **/		
	reset: function(){
		clearInterval(this.intvObj);
		this.clear();
		this.removeMsg();
		$(s.pauseButton).val('Pause').attr('disabled','');
		$(s.shadowButton).val('Hide shadow').attr('disabled','');
		$(document).unbind('keydown');
		$(s.levelSpan).text(1);
		$(s.linesSpan).text(0);
		$(s.scoreSpan).text(0);
		if( this.preview ) this.preview.clear();
		this.nextShape();
	},
	
	/**
	 * 
	 * Goto next level, level = level + 1
	 * @param: 
	 *
	 **/	
	nextLevel: function(){
		this.level ++;
		$(s.levelSpan).text(this.level);
		if(this.level > s.firstLevelInterval / s.dsecPerLevel)
		    this.interval = parseInt(s.firstLevelInterval / this.level);
		else
			this.interval = parseInt(s.firstLevelInterval-s.dsecPerLevel*(this.level-1));
		$('#debug').text(this.interval);
	},
	
	/**
	 * 
	 * Shape falls over and over
	 * @param: 
	 *
	 **/	
	run: function(){
		var t = this;
		t.intvObj = setInterval( function(){t.shapeFall();}, this.interval );
	},
	
	/**
	 * 
	 * Game start
	 * @param: 
	 *
	 **/	
	gameStart: function(){
		this.reset();
		this.run();
	},
	
	/**
	 * 
	 * Shape falls
	 * @param: 
	 *
	 **/	
	shapeFall: function(){
		if( this.shape.canFall() ){
			this.shape.fall();
		}else{
			clearInterval( this.intvObj );		
			$(document).unbind('keydown');
			var ls = this.linesCanStrip();
			if( ls.length )
				this.stripLine(ls);
			this.shape = null;
			if( this.preview ) this.preview.clear();
			if( this.getMaxHeight() <=0 ){
				this.gameOver();
				return;
			}
			this.nextShape(this.nextSeq);
			this.run();
		}
	},
	
	/**
	 * 
	 * Game over, unbind keydown event
	 * @param: 
	 *
	 **/	
	gameOver: function(){
		this.msg('<b>Game Over!</b>');
		clearInterval( this.intvObj );
		$(document).unbind('keydown');
	},
	
	/**
	 * 
	 * Game pause
	 * @param: 
	 *
	 **/	
	gamePause: function(){
		this.msg('<b>Pause! </b><br /><br />Click "Resume" to continue!');
		clearInterval(this.intvObj);
		$(document).unbind('keydown');
		$(s.pauseButton).val('Resume');
		$(s.goButton).attr('disabled','disabled');
	},
	
	/**
	 * 
	 * Game resume
	 * @param: 
	 *
	 **/	
	gameResume: function(){
		this.removeMsg();
		$(s.pauseButton).val('Pause');
		$(document).keydown( function(e){
			t.processKey.call(t,e);
		});
		var t=this;
		t.intvObj = setInterval( function(){t.shapeFall();}, this.interval );
		$(s.goButton).attr('disabled','');
	},
	
	/**
	 * 
	 * Show grid
	 * @param: 
	 *
	 **/		
	showGrid: function(){
		for( var i=0; i<s.height; i++ ){
			for( var j=0; j<s.width; j++ ){
				s.squares[i][j].toggleGrid();
			}
		}
		s.rawClass = s.gridClass;
		$(s.gridButton).val('Hide grids');
	},
	
	
	/**
	 * 
	 * Hide grid
	 * @param: 
	 *
	 **/	
	hideGrid: function(){
		for( var i=0; i<s.height; i++ ){
			for( var j=0; j<s.width; j++ ){
				s.squares[i][j].toggleGrid();
			}
		}
		s.rawClass = s.noGridClass;
		$(s.gridButton).val('Show grids');
	},
	
	
	/**
	 * 
	 * Show shadow
	 * @param: 
	 *
	 **/	
	showShadow: function(){
		this.shape.shadowFlag = true;
		this.shadowFlag = true;
		this.shape.showShadow();
		$(s.shadowButton).val('Hide shadow');
	},
	
	/**
	 * 
	 * Hide shadow
	 * @param: 
	 *
	 **/	
	hideShadow: function(){
		this.shape.shadowFlag = false;
		this.shadowFlag = false;
		this.shape.removeShadow();
		$(s.shadowButton).val('Show shadow');
	},
	
	/**
	 * 
	 * Alt the run flag
	 * @param: b
	 * if b is not given or equals to boolean true, runFlag turns true
	 * otherwise, runFlag = false.
	 *
	 **/	
	altRun: function(b){
		this.runFlag = (typeof b == 'undefined' || b === true ) ? true : false;
	},
	
	/**
	 * 
	 * Calculate the lines that could be striped.
	 * @param: 
	 * @return: Array of numbers
	 *
	 **/	
	linesCanStrip: function(){
		var ret = [];
		for( var i=s.height-1; i>=this.getMaxHeight(); i-- ){
			var flag = true;
			for( var j=0; j<s.width; j++ ){
				if( !s.squares[i][j].isReal() ){
					flag = false;
					break;
				}
			}
			if(flag) ret.push(i);			
		}
		var score = 0;
		switch(ret.length){
			case 1:
				score = 1;
				break;
			case 2:
				score = 3;
				break;
			case 3:
				score = 5;
				break;
			case 4:
				score = 8;
				break;
			default:
				break;
		}
		$(s.scoreSpan).text( parseInt($(s.scoreSpan).text()) + score );
		$(s.linesSpan).text( parseInt($(s.linesSpan).text()) + ret.length );
		if( parseInt($(s.linesSpan).text()) >= s.upgradeLine ){
			this.nextLevel();
			$(s.linesSpan).text( 0 );
		}
		return ret;
	},

	/**
	 * 
	 * Strip the lines
	 * @param: ls, lines that could be striped, array of numbers
	 *
	 **/	
	stripLine: function(ls){
		if( ls.length ){
			l = ls.shift(ls);
			for( var j=0; j<s.width; j++ ){
				s.squares[ l ][j].clear();
			}
			var h = this.getMaxHeight();
			for( var i=l; i>=h; i-- ){
				for( var j=0; j<s.width; j++ ){
					s.squares[i][j].replacedBy(s.squares[i-1][j]);
				}
			}
			for( var k=0; k<ls.length; k++)
				ls[k]++;
			this.stripLine(ls);
		}
	},
	
	/**
	 * 
	 * Get the max height of tetris
	 * @param: 
	 * @return: returns the minimal index of s.squares subscript
	 *
	 **/	
	getMaxHeight: function(){
		for( var i=0; i<s.height; i++ ){
			for( var j=0; j<s.width; j++ ){
				if( s.squares[i][j].isReal() )
					return i;
			}
		}
	},
	
	processKey: function(e){
		if (e.preventDefault) e.preventDefault();
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true;
		e.returnValue = false;
		
		switch(e.keyCode){
			case s.spaceKey:
				if( this.shape.canFall() )
					this.shape.goToBot();
				break;
			case s.leftKey:
				if( this.shape.canLeft() )
					this.shape.left();
				break;
			case s.rotateKey:
				this.shape.rotate();
				break;
			case s.rightKey:
				if( this.shape.canRight() )
					this.shape.right();
				break;
			case s.downKey:
				if( this.shape.canFall() )
					this.shape.fall();
				break;

			default:
				break;
		}
	},
	
	/**
	 * 
	 * Show messages
	 * @param: str, string to show
	 *
	 **/	
	msg: function(str){
		this.mask$.html('<div style="padding-top:150px;">'+str+'</div>').appendTo('body');
	},
	
	/**
	 * 
	 * remove the showing message.
	 * @param: 
	 *
	 **/
	removeMsg: function(){
		this.mask$.remove();
	}
	
};

	
/**
 * 
 * class Shape:
 * generate a shape and move it
 *
 **/	
var Shape = function(seq){
	this.seq = seq || 0;
	this.indices = [];
	this.shadowFlag = true;
	switch(this.seq){
		case 0: 
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // ||
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // ||
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 }); 
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });
			break;
		case 1: 
			this.indices.push({ x:1, y:parseInt( s.width/2 ) }); // |
			this.indices.push({ x:2, y:parseInt( s.width/2 ) }); // |
			this.indices.push({ x:0, y:parseInt( s.width/2 ) }); // |
			this.indices.push({ x:3, y:parseInt( s.width/2 ) }); // |
			break;
		case 2: 
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  //  ----
			this.indices.push({ x:0, y:parseInt( s.width/2 ) }); 
			this.indices.push({ x:0, y:parseInt( s.width/2 )-2 });  
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 });
			break;
		case 3: 
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    //  |
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // ||
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // |
			this.indices.push({ x:2, y:parseInt( s.width/2 )-1 });
			break;
		case 4: 
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // --
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  //  --
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });  
			this.indices.push({ x:1, y:parseInt( s.width/2 )+1 });	
			break;
		case 5:
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // ||
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    //  |
			this.indices.push({ x:2, y:parseInt( s.width/2 ) });			
			break;
		case 6:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    //  --
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 });  // --
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });
			break;			
		case 7:
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:2, y:parseInt( s.width/2 )-1 });  // __
			this.indices.push({ x:2, y:parseInt( s.width/2 ) });
			break;	
		case 8:
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // ---
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 }); 
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });
			break;
		case 9:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    // --
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    //  |
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  //  |
			this.indices.push({ x:2, y:parseInt( s.width/2 ) });
			break;
		case 10:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    //   |
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // ---
			this.indices.push({ x:1, y:parseInt( s.width/2 )+1 }); 
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 });
			break;		
		case 11:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });  //  |
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });  //  |
			this.indices.push({ x:2, y:parseInt( s.width/2 ) });  // --
			this.indices.push({ x:2, y:parseInt( s.width/2 )-1 });
			break;	
		case 12:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    // |
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // ---
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 }); 
			this.indices.push({ x:1, y:parseInt( s.width/2 )+1 });
			break;
		case 13:
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // --
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // |
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:2, y:parseInt( s.width/2 )-1 });
			break;
		case 14:
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    // --- 
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  //   |
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 }); 
			this.indices.push({ x:1, y:parseInt( s.width/2 )+1 });
			break;
		case 15:
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });    //  |
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // ---
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });
			this.indices.push({ x:1, y:parseInt( s.width/2 )+1 });
			break;
		case 16:
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });    // |
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 });  // |-
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });  // |
			this.indices.push({ x:2, y:parseInt( s.width/2 )-1 });
			break;
		case 17: 
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });  // ---
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });  //  |
			this.indices.push({ x:0, y:parseInt( s.width/2 )+1 }); 
			this.indices.push({ x:0, y:parseInt( s.width/2 )-1 });
			break;
		case 18:
			this.indices.push({ x:1, y:parseInt( s.width/2 )-1 }); //  |
			this.indices.push({ x:1, y:parseInt( s.width/2 ) });   // -|
			this.indices.push({ x:0, y:parseInt( s.width/2 ) });   //  |
			this.indices.push({ x:2, y:parseInt( s.width/2 ) });		
			break;
		default:
			break;
	}
};

Shape.prototype = {
		
	/**
	 * 
	 * In JS, array cound not be copied directly
	 * @param: 
	 * @return: an Array of indices
	 *
	 **/	
	copyIndices: function(){
		var ret = [];
		for( var i=0; i<this.indices.length; i++ ){
			ret.push({ x:this.indices[i].x, y:this.indices[i].y });
		}
		return ret;
	},
		
	/**
	 * 
	 * Show a shape
	 * @param: 
	 *
	 **/	
	show: function(){
		for( var i=0; i<this.indices.length; i++ ) {
			s.squares[ this.indices[i].x ][ this.indices[i].y ].show(this.seq);
		}
		if( this.shadowFlag )
			this.showShadow();
	},
		
	/**
	 * 
	 * Hide a shape
	 * @param: 
	 *
	 **/	
	hide: function(){
		for( var i=0; i<this.indices.length; i++ ) {
			s.squares[ this.indices[i].x ][ this.indices[i].y ].clear();
		}	
		this.removeShadow();
	},
		
	/**
	 * 
	 * Shape falls
	 * @param: step, how many steps does a shape fall
	 *
	 **/	
	fall: function(step){
		step = step || 1;
		this.hide();
		for( var i=0; i<this.indices.length; i++ ) {
			this.indices[i].x += step;
		}
		this.show();
	},
		
	/**
	 * 
	 * Get the lowest of squares of a shape;
	 * @param: 
	 * @lowest: an array of lowest square indices
	 *
	 **/	
	getLowest: function(){
		var ys = [];  // colomns
		for( var i=0; i<this.indices.length; i++ ) {
			if( $.inArray(this.indices[i].y, ys) == -1 )
				ys.push( this.indices[i].y );
		}
		var lowest = [];
		var lowI;
		for( var k=0; k<ys.length; k++ ) {
			var lowX = -1;
			for( var i=0; i<this.indices.length; i++ ) {
				if( ys[k] == this.indices[i].y )
					if( this.indices[i].x > lowX ){
						lowX = this.indices[i].x;
						lowI = i;
					}
			}
			lowest.push(lowI);
		}
		return lowest;
	},
		
	/**
	 * 
	 * Get the minimal distantce from the shape to the bottom
	 * or the exist square.
	 * @param: 
	 * @return: min, the minimal distance
	 *
	 **/	
	getMinLow: function(){
		var lowest = this.getLowest();
		var min = s.height;
		for( var i=0; i<lowest.length; i++ ){
			var index = this.indices[ lowest[i] ];
			var d = s.height - index.x;
			for( var j=index.x+1; j<s.height; j++ ){
				if( s.squares[j][ index.y ].isReal() ){
					d = j-index.x;
					break;
				}
			}
			min = d<min ? d : min;
		}
		return min;
	},
		
	/**
	 * 
	 * Tell if a shape can fall down
	 * Assume it falls, and judge if it is adjust in the wrapper.
	 * @param: 
	 * @return: true if can; while false if it can not.
	 *
	 **/	
	canFall: function(){
		this.hide();
		var tryIndices = this.copyIndices();
		var returnValue = true;
		for( var i=0; i<tryIndices.length; i++ ) {
			tryIndices[i].x ++;
			if( tryIndices[i].x >= s.height || s.squares[ tryIndices[i].x ][ tryIndices[i].y ].isReal() ){
				returnValue = false;
				break;
			}	
		}
		this.show();
		return returnValue;
	},
	
	/**
	 * 
	 * Tell if a shape can go left
	 * @param: 
	 * @return:true or false
	 *
	 **/	
	canLeft: function(){
		this.hide();
		var tryIndices = this.copyIndices();
		var returnValue = true;
		for( var i=0; i<tryIndices.length; i++ ) {
			tryIndices[i].y --;
			if( tryIndices[i].y < 0 || s.squares[ tryIndices[i].x ][ tryIndices[i].y ].isReal() ){
				returnValue = false;
				break;
			}	
		}
		this.show();
		return returnValue;
	},
		
	/**
	 * 
	 * Tell if a shape can go right
	 * @param: 
	 * @return:true or false
	 *
	 **/	
	canRight: function(){
		this.hide();
		var tryIndices = this.copyIndices();
		var returnValue = true;
		for( var i=0; i<tryIndices.length; i++ ) {
			tryIndices[i].y ++;
			if( tryIndices[i].y >= s.width || s.squares[ tryIndices[i].x ][ tryIndices[i].y ].isReal() ){
				returnValue = false;
				break;
			}	
		}
		this.show();
		return returnValue;
	},
		
	/**
	 * 
	 * Go left
	 * @param: 
	 *
	 **/	
	left: function(){
		this.hide();
		for( var i=0; i<this.indices.length; i++ ) {
			this.indices[i].y --;
		}
		this.show();		
	},
		
	/**
	 * 
	 * Go right
	 * @param: 
	 *
	 **/	
	right: function(){
		this.hide();
		for( var i=0; i<this.indices.length; i++ ) {
			this.indices[i].y ++;
		}
		this.show();		
	},
		
	/**
	 * 
	 * Go to the bottom directly, for space key
	 * @param: 
	 *
	 **/	
	goToBot: function(){
		this.fall(this.getMinLow()-1);
	},
		
	/**
	 * 
	 * Rotate a shape
	 * @param: 
	 *
	 **/	
	rotate: function(){
		this.hide();
		var center = this.indices[0];
		var err = false;
		var bakIndices = this.copyIndices();
		if( this.seq != 0 ){
			for( var i=0; i<this.indices.length; i++ ) {
				var X = center.x - center.y + this.indices[i].y;
				var Y = center.x + center.y - this.indices[i].x;
				if( Y < 0  || Y >= s.width 
					|| X < 0 || X >= s.height 
					|| s.squares[ X ][ Y ].isReal() ){
					err = true;
					break;
				} else {
					this.indices[i].x = X;
					this.indices[i].y = Y;				
				}
				
			}
		}
		if( err ) this.indices = bakIndices;
		this.show();
	},
		
	/**
	 * 
	 * Show the shadow of a shape
	 * @param: 
	 *
	 **/	
	showShadow: function(){
		var h = this.getMinLow();
		for( var i=0; i<this.indices.length; i++ ){
			var sqr = s.squares[ this.indices[i].x+h-1 ][this.indices[i].y ];
			if( sqr.isClear() )
				sqr.showShadow();
		}
		
	},
		
	/**
	 * 
	 * Hide it
	 * @param: 
	 *
	 **/	
	removeShadow: function(){
		var h = this.getMinLow();
		for( var i=0; i<this.indices.length; i++ ){
			var sqr = s.squares[ this.indices[i].x+h-1 ][this.indices[i].y ];
			if( sqr.isShadow() )
				sqr.removeShadow();
		}
	}
};
	
/**
 * 
 * class Preview
 * Get the next shape and show it in the preview area.
 *
 **/	
var Preview = function(seq){
	this.shape = new Shape(seq);
};

Preview.prototype = {
	
	/**
	 * 
	 * Show it
	 * @param: 
	 *
	 **/	
	show: function(){
		for( var i=0; i<this.shape.indices.length; i++ ){
			var index = this.shape.indices[i];
			s.previews[ index.x ][ index.y-3 ].addClass( s.realClasses[this.shape.seq] );
		}
	},
		
	/**
	 * 
	 * Clear it
	 * @param: 
	 *
	 **/	
	clear: function(){
		for( var i=0; i<4; i++ ){
			for( var j=0; j<4; j++ ){
				s.previews[i][j].removeClass();
			}
		}
	}
};

	
/**
 * 
 * class Square
 * Control action of every square
 * jq is its jQuery Object.
 *
 **/	
var Square = function(i,j,jq){
	this.x = i;
	this.y = j;
	this.jq = jq;
};

Square.prototype = {
	
	/**
	 * 
	 * Tell if a square is real
	 * @param: 
	 *
	 **/	
	isReal: function(){
		if( this.isShadow() )
			return false;
		return this.jq.attr('class').split(/\s+/g).length > 1;
	},
		
	/**
	 * 
	 * Tell if a square is a shadow square
	 * @param: 
	 *
	 **/	
	isShadow: function(){
		return this.jq.hasClass( s.shadowClass );
	},
		
	/**
	 * 
	 * Tell if a square is in its original state
	 * @param: 
	 *
	 **/	
	isClear: function(){
		return $.trim(this.jq.attr('class')) == s.rawClass;
	},
		
	/**
	 * 
	 * Show and hide the grid.
	 * @param: 
	 *
	 **/	
	toggleGrid: function(){
		this.jq.toggleClass( s.gridClass );
		this.jq.toggleClass( s.noGridClass );
	},
		
	/**
	 * 
	 * Show the shadow of this square
	 * @param: 
	 *
	 **/	
	showShadow: function(){
		this.jq.addClass( s.shadowClass );
	},
		
	/**
	 * 
	 * Remove it
	 * @param: 
	 *
	 **/	
	removeShadow: function(){
		this.jq.removeClass( s.shadowClass );
	},
		
	/**
	 * 
	 * Set the square to the original state
	 * @param: 
	 *
	 **/	
	clear: function(){
		this.jq.removeClass().addClass( s.rawClass );
	},
		
	/**
	 * 
	 * Set the square to the real state
	 * @param: 
	 *
	 **/	
	show: function(seq){
		this.jq.addClass( s.realClasses[seq] );
	},
		
	/**
	 * 
	 * Replace this square with other.(by style)
	 * @param: 
	 *
	 **/	
	replacedBy: function(osqr){
		this.jq.removeClass().addClass( osqr.jq.attr('class') );
	}
}