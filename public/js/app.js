var dragging = 0;
var posX=0, posY=0;

/* Adds a function to each element in the DOM to 
   compute the offset of an element relative to 
   the top leftcorner of the screen */
Element.prototype.screenOffset = function () {
  //offset from the parent element
  var x = this.offsetLeft
  var y = this.offsetTop 

  //offsets by how much the user has scrolled
  x -= window.pageXOffset;
  y -= window.pageYOffset;
  var element = this.offsetParent;

  //calculates the offset of all parent elements and gets their offset
  while (element !== null) {
    x = parseInt (x) + parseInt (element.offsetLeft);
    y = parseInt (y) + parseInt (element.offsetTop);

    element = element.offsetParent;
  }

  //returns the x offset and y offset
  return {x:x, y:y};
};

//draws a line given starting coordinates and end coordinates
function drawLine(startX, startY, endX, endY) {

  //gets the drawing context
  var ctx = document.getElementById('foreground').getContext('2d');

  //draws the line, and gives it a width
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.lineTo(endX,endY);
  ctx.stroke();
}

function addLayer() {
  //the size of the foreground element
  var size = 500;
  
  //resets the old foreground element to be a background element
  var oldFg = $('#foreground');
  oldFg.attr('id', 'background');
  oldFg.on('mousedown', canvasClick);
  oldFg.on('mousemove', canvasDrag);

  //Creates and initializes a new canvas element
  var newBoard = $(document.createElement('canvas'));
  newBoard.attr('id', 'foreground');
  newBoard.attr('class', 'paintBoard');
  newBoard.attr('height', size+'px');
  newBoard.attr('width', size+'px');
  newBoard.on('mousedown', canvasClick);
  newBoard.on('mousemove', canvasDrag);
  
  //adds the new canvas element to the beginning of the canvas group
  $('#canvasContainer').prepend(newBoard);

  //puts all background elements farther into the background based on position
  var currSize = size;
  $('#canvasContainer').children('canvas').each( function() {
    $(this).css('width', currSize+'px');

    //centers the element based on its size
    var layerOffset = (size-currSize)/2;
    $(this).css('left', layerOffset+'px');
    $(this).css('top', layerOffset+'px');

    //sets the size to be smaller for the next element
    currSize = currSize * 0.9;
  });
}

//toggles whether or not you are dragging the mouse
function canvasClick(e) {
  dragging = 1;

  //gets an updated position of the mouse
  posX = e.clientX || e.pageX;
  posY = e.clientY || e.pageY;
  var offset = $('#foreground')[0].screenOffset();
  posX -= offset.x;
  posY -= offset.y;

  //draws a rectangle in case the user wants to just draw dots
  var ctx = $('#foreground')[0].getContext('2d');
  ctx.rect(posX,posY,1,1);
  ctx.fill();
}

//updates the canvas whenever the mouse moves
function canvasDrag(e) {

  //will not draw unless the mouse is down
  if(!dragging)
    return;
   
  //stores the starting coordinates
  var startX = posX;
  var startY = posY;
 
  //gets the current position of the mouse relative to the canvas
  posX = e.clientX || e.pageX;
  posY = e.clientY || e.pageY;
  var offset = $('#foreground')[0].screenOffset();
  posX -= offset.x;
  posY -= offset.y;
    
  //draws a line from the old coordinates to the new coordinates
  drawLine(startX, startY, posX, posY);
}

//initializes the paint board when the window loads
$(function() {
  
  //adds a new layer when the addLayer button is clicked
  $('#addLayer').click(addLayer);

  //The mouse has stopped dragging any time it unclicks on the canvas
  $('body').on('mouseup', function() {
    dragging = 0;
  });

});
