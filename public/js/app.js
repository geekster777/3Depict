var dragging = 0;
var posX=0, posY=0;

//the size of the foreground element
var size = 500;

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
  
  //Creates and initializes a new canvas element
  var newBoard = $(document.createElement('canvas'));
  newBoard.attr('id', 'foreground');
  newBoard.attr('class', 'paintBoard');
  newBoard.attr('height', size+'px');
  newBoard.attr('width', size+'px');
  newBoard.on('mousedown', canvasClick);
  newBoard.on('mousemove', canvasDrag);

  //initializes the corresponding label for the list
  var boardLabel = $(document.createElement('li'));
  boardLabel.attr('class', 'boardLabel');
  boardLabel.text('Label');
  boardLabel.click(function() {
    newBoard.remove();
    boardLabel.remove();
    refreshCanvasLocations();
  });

  //Should be called whenever the label has changed its position in the list
  boardLabel[0].positionChanged = function(position) {
    
    newBoard.remove();
    
    //checks if the canvas needs to be added to the beginning of the list 
    if(position <= 0) {
      $('#canvasContainer').prepend(newBoard);
    }
    else {
      $('#canvasContainer canvas:nth-child('+position+')').after(newBoard);
    }
    
    /*
     * we have to refresh the positions of the canvas with a callback otherwise 
     * transitions will not work. This is because css will think that the initial
     * position is the updated position. By setting a timeout, the initial position will
     * be registered, and then the updated location will be set, allowing for animations
     */
    setTimeout(refreshCanvasLocations, 0);
  };

  
  //adds the new canvas and label elements to the beginning of their corresponding groups
  $('.layerList').prepend(boardLabel);
  $('#canvasContainer').prepend(newBoard);

  //updates the sizes of all canvas elements based on their locations.
  refreshCanvasLocations();

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

function refreshCanvasLocations() {
  //resets the old foreground element to be a background element
  var oldFg = $('#foreground');
  var newFg = $('#canvasContainer canvas:first');

  //switches the id and mouse events of the old foreground to the new foreground
  if(!oldFg.is(newFg)) {
    oldFg.attr('id', 'background');
    oldFg.on('mousedown', null);
    oldFg.on('mousemove', null);

    newFg.attr('id', 'foreground');
    newFg.on('mousedown', canvasClick);
    newFg.on('mousemove', canvasDrag);
  }

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

//initializes the paint board when the window loads
$(function() {

  //makes the layer list sortable
  $('.layerList').sortable({

    //called whenever the selected element in the sortable list changes position
    change:function(event, ui) {
      
      //gets the position of the label in the list
      var position = ui.placeholder.index(); 

      //accounts for the placeholder inserted into the list when using JQuery Sortable
      if(position > ui.item.index()) {
        position--;
      }
      
      //tells the label to update the position of the canvas with it
      ui.item[0].positionChanged(position);
    }
  });
  $('.layerList').disableSelection();
  
  //adds a new layer when the addLayer button is clicked
  $('#addLayer').click(addLayer);

  //The mouse has stopped dragging any time it unclicks on the canvas
  $('body').on('mouseup', function() {
    dragging = 0;
  });

});
