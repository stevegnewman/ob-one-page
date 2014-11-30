/* ==========================================================================

Project: ob-test
Author: Steve Newman
Last updated: @@timestamp

========================================================================== */

/*jslint browser: true, plusplus: true, indent: 2*/
/*global $ */

//Create myApp object and options
var myApp = {
  photos: $('.group1').length,
  currentPhoto : 0,
  isClosed : false,
  options : {
    slideDuration : 2000
  }
};

//Close the lightbox
myApp.isFinishedOrClosed = function (manual) {
  'use strict';
  if (!manual) {
    setTimeout($.colorbox.close, myApp.options.slideDuration);
  } else {
    $.colorbox.close();
  }

  //Turn off event listners as we no longer need for manaul operation
  $(document).off('cbox_complete');
  $(document).off('cbox_closed');
};

//Display next photo
//also if lightbox is on screen to avoid setTimeout conflicts
myApp.nextSlide = function () {
  'use strict';
  if ($("#colorbox").css("display") === "block" && myApp.isClosed === false) {
    $.colorbox.next();
  }
};

//create Flickr searchable string
myApp.searchData = function (string) {
  'use strict';
  var search = string.split(' ');

  if (search.length > 1) {
    search = search.join('%2C');
  } else {
    search = search[0];
  }

  //pass search string to makeCall
  myApp.makeCall(search);
};

//makeCall - Query flickr for required images using relevant search string
myApp.makeCall = function (search) {
  'use strict';
  var searchAmount = $('select.flickr-search-amount').val(),
    i;

  $.ajax({
    url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=1a6a3192bd686cd45c7f56e4c214a2d4&text=" + search + "&extras=url_m&per_page=" + searchAmount + "&sort=relevance&format=json&jsoncallback=?",
    dataType: "json",
    success: function (data) {
      var myData = data,
        photos = myData.photos.photo;

      //reset images prior to appending new search
      $('.flickr-images').html("");

      //for every image found create an image tag
      for (i = 0; i < photos.length; i++) {
        $('.flickr-images').append('<p><a class="group2 cboxElement" href="' + photos[i].url_m + '">&nbsp;</a></p>');
      }

      //Setup and trigger colorbox for ajaxed images
      $(".group2").colorbox({rel: 'group2'});
      $('.flickr-images a').first().trigger('click');
    },

    //Just in case it goes wrong
    error: function () {
      $('.flickr-images').append('No images available');
    }
  });
};

//Document ready functions
$(document).ready(function () {
  'use strict';
  //On document ready setup event listeners for colorbox
  $(document).on('cbox_complete', function () {

    //After every displayed image increase currentPhoto by 1
    myApp.currentPhoto++;

    //If currentPhoto is equal to the number of photos available close lightbox
    //otherwise execute nextSlide function to view next photo.
    if (myApp.currentPhoto === myApp.photos) {
      //Finished.
      myApp.isFinishedOrClosed(false);
    } else {
    //next photo
      setTimeout(myApp.nextSlide, myApp.options.slideDuration);
    }
  });

  //Event listener for when user closes lightbox manually
  $(document).on('cbox_closed', function () {
    myApp.isClosed = true;
    myApp.isFinishedOrClosed(true);
  });

  //initiate colorbox and options
  $('.group1').colorbox({
    rel: 'group1',
    open: true,
    returnFocus: false,
    width: '500px',
    height: '350px'
  });

  //take value of preset search button for Flickr
  $('button.flickr-preset-search').on('click', function () {
    var string = $(this).text();
    myApp.searchData(string);
  });

  //take value of custom search for Flickr
  $('button.flickr-custom-search').on('click', function (e) {
    e.preventDefault();
    var string = $('input.flickr-search-box').val();
    myApp.searchData(string);
  });
});