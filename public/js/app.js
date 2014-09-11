var dragging = 0;
var pos = {x:0, y:0};
var drawColor = 'rgba(0,0,0,1)';
var lineWidth = 1;
var viewOffset = {x:0,y:0};
var viewing = false;

//the size of the foreground element
var size = 400;

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
  ctx.lineWidth = lineWidth * 2;
  ctx.fillStyle = drawColor;
  ctx.strokeStyle = drawColor;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.lineTo(endX,endY);
  ctx.stroke();
  
  ctx.arc(startX, startY, lineWidth, 0, 2 * Math.PI, false);
  ctx.fill();
  
  ctx.arc(endX, endY, lineWidth, 0, 2 * Math.PI, false);
  ctx.fill();
}

function addLayer() {
  
  //Creates and initializes a new canvas element
  var newBoard = $(document.createElement('canvas'));
  newBoard.attr('id', 'foreground');
  newBoard.attr('class', 'paintBoard');
  newBoard.attr('height', size+'px');
  newBoard.attr('width', size+'px');

  if(!viewing) {
    newBoard.addClass('animate');
    newBoard.on('mousedown', canvasClick);
    newBoard.on('mousemove', canvasDrag);
  }

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
  dragging = true;

  //gets an updated position of the mouse
  pos.x = e.clientX || e.pageX;
  pos.y = e.clientY || e.pageY;
  var offset = $('#foreground')[0].screenOffset();
  pos.x -= offset.x;
  pos.y -= offset.y;

  //draws a rectangle in case the user wants to just draw dots
  var ctx = $('#foreground')[0].getContext('2d');
  ctx.rect(pos.x,pos.y,1,1);
  ctx.fill();
}

//updates the canvas whenever the mouse moves
function canvasDrag(e) {

  //will not draw unless the mouse is down
  if(!dragging)
    return;
   
  //stores the starting coordinates
  var startX = pos.x;
  var startY = pos.y;
 
  //gets the current position of the mouse relative to the canvas
  pos.x = e.clientX || e.pageX;
  pos.y = e.clientY || e.pageY;
  var offset = $('#foreground')[0].screenOffset();
  pos.x -= offset.x;
  pos.y -= offset.y;
    
  //draws a line from the old coordinates to the new coordinates
  drawLine(startX, startY, pos.x, pos.y);
}

function refreshCanvasLocations() {
  //resets the old foreground element to be a background element
  var oldFg = $('#canvasContainer canvas');
  var newFg = $('#canvasContainer canvas:first');
  oldFg.attr('id', 'background');
  newFg.attr('id', 'foreground');

  //switches the id and mouse events of the old foreground to the new foreground
  if(!viewing){//!oldFg.is(newFg)) {
    oldFg.off('mousedown');
    oldFg.off('mousemove');
    
    newFg.on('mousedown', canvasClick);
    newFg.on('mousemove', canvasDrag);
  }

  //puts all background elements farther into the background based on position
  var currSize = size;
  var zIndex = $('#canvasContainer').children('canvas').length;
  $('#canvasContainer').children('canvas').each( function() {
    $(this).css('width', currSize+'px');
    
    //calculates the padding to position the canvas
    var layerOffset = (size-currSize)/2;
    var positionOffset = {
      x:(1-currSize/size)*viewOffset.x+layerOffset,
      y:(1-currSize/size)*viewOffset.y+layerOffset
    };

    //centers the element based on its size
    $(this).css('z-index', zIndex);
    $(this).css('left', positionOffset.x+'px');
    $(this).css('top', positionOffset.y+'px');

    //sets the size to be smaller for the next element
    currSize = currSize * 0.9;
    zIndex--;
  });
}

function viewDrag() {
  if(dragging) {
    viewOffset.x += 3*(mouseX-event.clientX);
    viewOffset.y += 3*(mouseY-event.clientY);
    refreshCanvasLocations();
  }

  mouseX = event.clientX;
  mouseY = event.clientY;
}

//initializes the paint board when the window loads
$(function() {

  //makes the layer list sortable
  $('.layerList').sortable({
    start:function(event, ui) {
      if(viewing) {
        $('body').off('mousemove');
        if(!$('.paintBoard').hasClass('animate')) {
          $('.paintBoard').addClass('animate');
        }
      }
    },
    
    stop:function(event, ui) {
      if(viewing) {
        $('body').on('mousemove',viewDrag);
        if($('.paintBoard').hasClass('animate')) {
          $('.paintBoard').removeClass('animate');
        }
      }
    },

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

  $('#toggleView').click(function() {
    viewing = !viewing;

    $('.paintBoard').toggleClass('animate');
    
    if(!viewing) {
      $('#addLayer').prop('disabled',false);
      $('#foreground').on('mouseclick', canvasClick);
      $('#foreground').on('mousemove', canvasDrag);
      $('body').off('mousemove');
      $('body').off('mouseclick');
      dragging=false;
    }
    else {    
      $('#addLayer').prop('disabled',true);
      $('#foreground').off('mouseclick');
      $('#foreground').off('mousemove');
      $('body').on('mousemove', viewDrag);
      $('body').on('mousedown', function() {
        dragging=true;
      });
    }
  });

  //The mouse has stopped dragging any time it unclicks on the canvas
  $('body').on('mouseup', function() {
    dragging = 0;
  });

  $('#colorPicker').spectrum({
    change: function(color) {
      drawColor = color.toHexString();
    },
    showInitial:true,
    clickoutFiresChange:true
  });
  
  $('#lineWidth').on('input', function() {
    lineWidth = this.value;
  });
});
