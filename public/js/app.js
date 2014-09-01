var dragging = 0;
var posX=0, posY=0;

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

function addLayer() {
  var size = 500;
  
  var oldFg = $('#foreground');
  oldFg.attr('id', 'background');
  oldFg.on('mousedown', canvasClick);
  oldFg.on('mousemove', canvasDrag);

  var newBoard = $(document.createElement('canvas'));
  newBoard.attr('id', 'foreground');
  newBoard.attr('class', 'paintBoard');
  newBoard.attr('height', size+'px');
  newBoard.attr('width', size+'px');
  newBoard.on('mousedown', canvasClick);
  newBoard.on('mousemove', canvasDrag);
  
  $('#canvasContainer').prepend(newBoard);


  
  var currSize = size;

  $('#canvasContainer').children('canvas').each( function() {
    $(this).css('width', currSize+'px');
    var layerOffset = (size-currSize)/2;
    $(this).css('left', layerOffset+'px');
    $(this).css('top', layerOffset+'px');
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

  var ctx = $('#foreground')[0].getContext('2d');
  ctx.rect(posX,posY,1,1);
  ctx.fill();
}

//updates the canvas whenever the mouse moves
function canvasDrag(e) {

  //will not draw unless the mouse is down
  if(!dragging)
    return;
   
  var startX = posX;
  var startY = posY;
 
  //gets the current position of the mouse relative to the canvas
  posX = e.clientX || e.pageX;
  posY = e.clientY || e.pageY;
  var offset = $('#foreground')[0].screenOffset();
  posX -= offset.x;
  posY -= offset.y;
    
  drawLine(startX, startY, posX, posY);
}

//initializes the whiteboard when the window loads
$(function() {
  
  $('#addLayer').click(addLayer);

  $('body').on('mouseup', function() {
    dragging = 0;
  });

});
