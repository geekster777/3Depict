//Gets the offset of an element relative to the top left corner of the screen
Element.prototype.screenOffset = function () {
  var x = this.offsetLeft - window.pageXOffset;
  var y = this.offsetTop - window.pageYOffset;

  var element = this.offsetParent;

  while (element !== null) {
    x = parseInt (x) + parseInt (element.offsetLeft);
    y = parseInt (y) + parseInt (element.offsetTop);

    element = element.offsetParent;
  }

  return {x:x, y:y};
};

function drawLine(startX, startY, endX, endY) {
  var ctx = document.getElementById('foreground').getContext('2d');

  //starts the mouse in the last position
  ctx.beginPath();
  ctx.moveTo(startX,startY);

  //draws the end of the line at the updated mouse position
  ctx.lineTo(endX,endY);
  ctx.stroke();
}

//initializes the whiteboard when the window loads
window.onload = function() {

  //initializes some useful variables
  var paintBoard = document.getElementById('foreground');
  var body = document.getElementsByTagName('body')[0];
  var dragging = 0;
  var posX=0, posY=0;
  
  //toggles whether or not you are dragging the mouse
  paintBoard.onmousedown = function(e) {
    dragging = 1;

    //gets an updated position of the mouse
    posX = e.clientX || e.pageX;
    posY = e.clientY || e.pageY;
    var offset = paintBoard.screenOffset();
    posX -= offset.x;
    posY -= offset.y;

    var ctx = paintBoard.getContext('2d');
    ctx.rect(posX,posY,1,1);
    ctx.fill();

  };
  body.onmouseup = function() {
    dragging = 0;
  };

  //updates the canvas whenever the mouse moves
  paintBoard.onmousemove = function(e) {

    //will not draw unless the mouse is down
    if(!dragging)
      return;
   
    var startX = posX;
    var startY = posY;
 
    //gets the current position of the mouse relative to the canvas
    posX = e.clientX || e.pageX;
    posY = e.clientY || e.pageY;
    var offset = paintBoard.screenOffset();
    posX -= offset.x;
    posY -= offset.y;
    
    drawLine(startX, startY, posX, posY);
  };
};
