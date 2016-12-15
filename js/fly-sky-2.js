function mainMenuItemClickHandler(e) {
    var target = $(this).attr('href');

    if (target.indexOf('#') != -1) {
        e.preventDefault();

        target = target.slice(1);

        $('html, body').animate({
            scrollTop: $("a[name='" + target + "']").offset().top
        }, 500);
    }
}

function getRelatedIataSuggestionInput(element) {
    return element.siblings("[type=hidden]");
}

function initializeDatePicker(link) {
    $(link).datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            var myDate = $(this).datepicker('getDate');

            var text =
                '<span class="flight-date-day">' + $.datepicker.formatDate('dd', myDate) + '</span>' +
                '<span class="flight-date-month">' + $.datepicker.formatDate('M', myDate) + '</span>' +
                '<span class="flight-date-year">' + $.datepicker.formatDate('yy', myDate) + '</span>';

            $(this).siblings('span.flight-date').html(text);
        }
    });
}



function initializeWayContainer(link) {
    console.log('123');
    console.log(link);
    $iataInputs = $(link).find(".iata-suggestion");

    $iataInputs.on("keypress", function() {
        getRelatedIataSuggestionInput($(this)).val("");
    });

    $iataInputs.autocomplete({
        //source : $("#order-form").data("way-suggestion-url"),
        //source : availableTags,
      source : "search.php",      
     /* 
      source: function( request, response ) {
                    $.ajax({
                        url: "search.php",
                        dataType: "json",
                        type : 'Get',
                        data: {
                            q: request.term
                        },
                        success: function( data ) {
                            response( data );
                        }
                    });
                },
      */
        minChars : 3,
        select: function(event, ui) {
            event.preventDefault();

            jQuery(this).val(ui.item.label);
            getRelatedIataSuggestionInput(jQuery(this)).val(ui.item.value);
        }
    });

    //
    // Setup date pickers

    var datePickerFrom = $(link).find(".date-picker-inputs .flight-departing");
    var datePickerTo = $(link).find(".date-picker-inputs .flight-returning");

    var datePickerOnSelect = function($this) {
        var myDate = $this.datepicker('getDate');

        if (myDate === null)
            return; // Value is not picked yet

        var text =
            '<span class="flight-date-day">' + $.datepicker.formatDate('dd', myDate) + '</span>' +
                '<span class="flight-date-month">' + $.datepicker.formatDate('M', myDate) + '</span>' +
                '<span class="flight-date-year">' + $.datepicker.formatDate('yy', myDate) + '</span>';
        console.log($this);
        $this.siblings('div.flight-date').html(text);
    };

    var datePickerSettings = {
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            datePickerOnSelect($(this));
        }
    };

    datePickerFrom.datepicker(datePickerSettings);
    datePickerTo.datepicker(datePickerSettings);

    if (datePickerFrom.datepicker('getDate') !== null)
        datePickerTo.datepicker("option", "minDate", datePickerFrom.datepicker('getDate'));

    datePickerFrom.datepicker("option", 'onClose', function(selectedDate) {
        datePickerTo.datepicker("option", "minDate", selectedDate);

        datePickerOnSelect(datePickerTo);
    });

//    datePickerTo.datepicker("option", 'onClose', function(selectedDate) {
//        datePickerFrom.datepicker("option", "maxDate", selectedDate);
//    });

    

    $(link).find(".date-picker-inputs .input-date").on("click", function() {
        $(this).find('input').datepicker("show");
    });
}

function createRangeBox($options) {
    return {

    };
}

function initializeDecoratedInput(selector, limitMinValue, limitMaxValue) {
    selector.data("range-min-value", limitMinValue);
    selector.data("range-max-value", limitMaxValue);

    var input = $(selector).find('.value-holder');
    var label = $(selector).find('.label-holder');

    var plusButton = $(selector).find('.input-quant-plus');
    var minusButton = $(selector).find('.input-quant-minus');

    if (input.val() <= limitMinValue)
        minusButton.addClass('inactive');

    if (input.val() >= limitMaxValue)
        plusButton.addClass('inactive');

    plusButton.on("click", function(e) {
        e.preventDefault();

        var maxValue = selector.data("range-max-value");
        var minValue = selector.data("range-min-value");

        var value = parseInt($(input).val());

        if (value == maxValue) {
            return;
        }

        $(input).val(value + 1);
        $(label).text(value + 1);

        if (input.val() == maxValue)
            $(this).addClass('inactive');

        if (input.val() > minValue)
            minusButton.removeClass('inactive');
    });

    minusButton.on("click", function(e) {
        e.preventDefault();

        var maxValue = selector.data("range-max-value");
        var minValue = selector.data("range-min-value");

        var value = parseInt($(input).val());

        if (value == minValue)
            return;

        $(input).val(value - 1);
        $(label).text(value - 1);

        if (input.val() == minValue)
            $(this).addClass('inactive');

        if (input.val() < maxValue)
            plusButton.removeClass('inactive');
    });
}

function initializeMap($selector) {
    var mapCanvas = document.getElementById($selector);

    var styles = [
        { "featureType": "landscape", "stylers": [
            { "saturation": -100 },
            { "lightness": 65 },
            { "visibility": "on" }
        ] },
        { "featureType": "poi", "stylers": [
            { "saturation": -100 },
            { "lightness": 51 },
            { "visibility": "simplified" }
        ] },
        { "featureType": "road.highway", "stylers": [
            { "saturation": -100 },
            { "visibility": "simplified" }
        ] },
        { "featureType": "road.arterial", "stylers": [
            { "saturation": -100 },
            { "lightness": 30 },
            { "visibility": "on" }
        ] },
        { "featureType": "road.local", "stylers": [
            { "saturation": -100 },
            { "lightness": 40 },
            { "visibility": "on" }
        ] },
        { "featureType": "transit", "stylers": [
            { "saturation": -100 },
            { "visibility": "simplified" }
        ] },
        { "featureType": "administrative.province", "stylers": [
            { "visibility": "off" }
        ] },
        { "featureType": "water", "elementType": "labels", "stylers": [
            { "visibility": "on" },
            { "lightness": -25 },
            { "saturation": -100 }
        ] },
        { "featureType": "water", "elementType": "geometry", "stylers": [
            { "hue": "#ffff00" },
            { "lightness": -25 },
            {
                "saturation": -97
            }
        ]
        }
    ];

    var gpsLocation = new google.maps.LatLng(37.79072,-122.401584);

    var mapOptions = {
        center: gpsLocation,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styles
    }

    var map = new google.maps.Map(mapCanvas, mapOptions);

    var marker = new google.maps.Marker({
        position: gpsLocation,
        map: map
    });
}

function validateEmail(email) { 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
} 

function validate_and_send()
{
  var Errors=false;
  var ErrorsSet=[];
  var Type1 = document.forms[0].elements["OrderForm[tripType]"].value;
  var Type=0;
  switch(Type1) {
    case "roundtrip": Type=1; break;
    case "oneway":  Type=2; break;
    case "multiple":  Type=3; break;
  };
  var Class1 = document.forms[0].elements["OrderForm[flightType]"].value;
  var Class=0;
  switch(Class1) {
    case "business": Class=1; break;
    case "first":  Class=2; break;
  };
  
  var FullName = document.forms[0].elements["orderform-customer_name"].value;
  FullName=FullName.trim();
  if (FullName.length<1) {
    Errors=true;
    ErrorsSet.push('Name cannot be blank');
    document.forms[0].elements["orderform-customer_name"].parentNode.className="input-container input-name has-error";
  }
  else {
    document.forms[0].elements["orderform-customer_name"].parentNode.className="input-container input-name ";
  };  
  
  var Email = document.forms[0].elements["orderform-customer_email"].value;
  Email=Email.trim();
  if (!validateEmail(Email)){
    Errors=true;
    ErrorsSet.push('Email is not a valid email address')
    document.forms[0].elements["orderform-customer_email"].parentNode.className="input-container input-mail has-error";
  }
  else{
    document.forms[0].elements["orderform-customer_email"].parentNode.className="input-container input-mail ";
  };  
  
  var Phone = document.forms[0].elements["orderform-customer_phone"].value;
  Phone=Phone.trim();
 
  if((Phone.replace(/[^0-9]/g, '')).length < 10) { 
    Errors=true;
    document.forms[0].elements["orderform-customer_phone"].parentNode.className="input-container input-name has-error";
  } 
  else {
    document.forms[0].elements["orderform-customer_phone"].parentNode.className="input-container input-name ";
  };
  
  var ReturnDate = document.forms[0].elements["OrderForm[ways][returning_date][]"][0].value;
  
  var PointCount = document.forms[0].elements["OrderForm[ways][from][]"].length;
  var FromAirport=[];
  var ToAirport=[];
  var DepartureDate=[];
  if (Type==3) { //multiple destinations
    /*
    var s="";
    for (var i=0; i<PointCount; i++) {
      s+=i.toString();
      if (document.forms[0].elements["OrderForm[ways][from][]"][i].value==""){
        s+=" None";
      }
      else{
        s+=" "+document.forms[0].elements["OrderForm[ways][from][]"][i].value;
      };
    };
    
    alert(s);
    */
    var EmptySet=true;
    var LocalErrors=false;
    for (var i=0; i<PointCount; i++) {
      FromAirport[i] = document.forms[0].elements["OrderForm[ways][from][]"][i].value;
      ToAirport[i] = document.forms[0].elements["OrderForm[ways][to][]"][i].value;
      DepartureDate[i] = document.forms[0].elements["OrderForm[ways][departing_date][]"][i].value;
      if (FromAirport[i]!="" || ToAirport[i]!="" || DepartureDate[i]!="") {
        EmptySet=false;
        if (FromAirport[i]=="" || ToAirport[i]=="" || DepartureDate[i]=="") {
          LocalErrors=true;
          console.log("Flight Error!");
          /*
          if (FromAirport[i]=="") {document.getElementById("flight-from").parentNode.className="input-container has-error";} 
          else {document.getElementById("flight-from").parentNode.className="input-container ";};
          if (ToAirport[i]=="") {document.getElementById("flight-to").parentNode.className="input-container has-error";} 
          else {document.getElementById("flight-to").parentNode.className="input-container ";};
          if (DepartureDate[i]=="") {document.forms[0].elements["OrderForm[ways][departing_date][]"][i].parentNode.className="input-container input-date has-error";} 
          else {document.forms[0].elements["OrderForm[ways][departing_date][]"][i].parentNode.className="input-container input-date ";};
          */
          
        }
      }
    };
    if (EmptySet && !LocalErrors){
      LocalErrors=true;
    };
    if (LocalErrors) {
      Errors=LocalErrors;
      ErrorsSet.push('Fill all destinations and dates');
    }
  }
  else { //one-way or roundtrip
    FromAirport[0] = document.forms[0].elements["OrderForm[ways][from][]"][0].value;
    ToAirport[0] = document.forms[0].elements["OrderForm[ways][to][]"][0].value;
    DepartureDate[0] = document.forms[0].elements["OrderForm[ways][departing_date][]"][0].value;
    if (FromAirport[0]=="" || ToAirport[0]=="" || DepartureDate[0]=="") {
      Errors=true;
      console.log("Flight Error!");
      ErrorsSet.push('Fill all destinations and dates');
      if (FromAirport[0]=="") {document.getElementById("flight-from").parentNode.className="input-container has-error";} 
      else {document.getElementById("flight-from").parentNode.className="input-container ";};
      if (ToAirport[0]=="") {document.getElementById("flight-to").parentNode.className="input-container has-error";} 
      else {document.getElementById("flight-to").parentNode.className="input-container ";};
      if (DepartureDate[0]=="") {document.forms[0].elements["OrderForm[ways][departing_date][]"][0].parentNode.className="input-container input-date has-error";} 
      else {document.forms[0].elements["OrderForm[ways][departing_date][]"][0].parentNode.className="input-container input-date ";};
    }
    if (Type==1){
      if (ReturnDate==""){document.forms[0].elements["OrderForm[ways][returning_date][]"][0].parentNode.className="input-container input-date has-error";} 
      else {document.forms[0].elements["OrderForm[ways][returning_date][]"][0].parentNode.className="input-container input-date ";} 
    };
  };
  //alert("len: "+PointCount);
  //alert(FromAirport);
  //var FromAirport1 = document.forms[0].elements["OrderForm[ways][from][]"][0].value;
  //alert(document.forms[0].elements["OrderForm[ways][from][]"].length);
  
  var AdultsNumber = document.forms[0].elements["OrderForm[adult_count]"].value;
  var ChildsNumber = document.forms[0].elements["OrderForm[kid_count]"].value;
  
  
  //var len=document.form[0].elements.length-1;  //length-1, потому что кнопка считается за элемент и мы ее отбрасываем.
  /*    var mas=[];  // создаем массив к торый собственно и будем заполнять
      var paste=document.getElementById('paste'); 
      for(var i=0;i<len;i++){
       //var val=document.set_from.elements[i].value;
         if (val!=0 && val!=undefined && val!=null){ // дабы не забивать массив не определенными значениями мы делаем проверку на передаваемое значение;
         mas.push(val);       // работаем с массивом как со стеком
       }
       
      }
     //paste.innerHTML=mas; // ну и вывод массива
  
  */
  
  
  //alert($("#order-form").serialize());

  
  var msg="fullname="+FullName+"&returndate="+ReturnDate+"&email="+Email+"&phone="+Phone+"&type="+Type+"&class="+Class+"&adultsnumber="+AdultsNumber+"&childsnumber="+ChildsNumber;  
  
  for (var i=0; i<PointCount; i++) {
    msg += "&fromairport"+i.toString()+"="+FromAirport[i]+"&toairport"+i.toString()+"="+ToAirport[i]+"&departuredate"+i.toString()+"="+DepartureDate[i];
    if (Type!=3){break;};
  };

  if (!document.forms[0].elements["order-form-terms"].checked){
    Errors=true;
    ErrorsSet.push("You must accept offer terms");
  }
   
  if (Errors){
    console.log("Error!");
    //document.getElementsByClassName("error-summary")[0].style.display="block";
    
    
    document.getElementsByClassName("error-summary")[0].getElementsByTagName('ul')[0].innerHTML='';
    $.each(ErrorsSet, function( index, value ) {
      document.getElementsByClassName("error-summary")[0].getElementsByTagName('ul')[0].innerHTML+='<li>'+value+'</li>';
    });
    
    
    
    document.getElementsByClassName("error-summary")[0].style.display="block";
  }
  else{
        $.ajax({
        type: "POST",
        url: "db_save.php",
        data: msg,
        success: function( data ) {
          //alert( data ); // пришедшие данные
        },
        complete: function( xhr ) {
           $(".order-form-container").replaceWith("<div class='order-form-container'><div class='order-form-flight order-form-flight-done'>	<h2>Thank you for your inquiry</h2>	<h4>Once we receive your request, our agent will contact<br> you shortly.</h4>	<h4>LuckyMile  <br> +1 (415) 449 5456<br>		<a href=''>info@luckymile.com</a>	</h4>	<div class='clearfix'></div>	<div class='form-border clearfix'></div>	<div class='getquote-container'>		<a href='http://luckymile.com' class='getquote-form'>Another quote</a>	</div></div> <div>");
          //S(".order-form-container").
          //alert( 'запрос успешно выполнен' );
        },
        error: function( xhr, status ) {
          alert( 'произошла ошибка при выполнении запроса' );
        }
      });

  }
  //alert("after ajax");
  
}

$(document).ready(function() {
  /*  
  $('#getquote-button').on('click', function(){
      alert("onclick");
    });
  */
    $('#main-navigation-menu').find('a').on('click', mainMenuItemClickHandler);
    $('#back-to-top-button').on('click', mainMenuItemClickHandler);
    
    var wayCountInput = $("#orderform-waycount");

    var buttonAddWay =  $("#route-add-button");
    var buttonRemoveWay =  $("#route-remove-button");

    
  
    wayCountInput.val($(".order-form-flight").find(".way-item-container").length);

    buttonAddWay.on("click", function(e) {
        e.preventDefault();

        var container = $("#form-way-template").children().clone();
        initializeWayContainer(container);

        container.appendTo($("#multiple-route-container").find(".route-list"));

        var counter = parseInt(wayCountInput.val()) + 1;

        if (counter > 1)
            buttonRemoveWay.show('slow');

        wayCountInput.val(counter);
    });

    buttonRemoveWay.on("click", function(e) {
        e.preventDefault();

        var container = $(".order-form-flight").find(".way-item-container:last");
        var counter = parseInt(wayCountInput.val()) - 1;

        if (counter <= 1) {
            buttonRemoveWay.hide('slow');
        }

        container.remove();
        wayCountInput.val(counter);
    });

  
    initializeDecoratedInput($("#adults-count-input-container"), 1, 6);
    initializeDecoratedInput($("#kids-count-input-container"), 0, 4);

    $(".order-form-trip-type").find("input[type=radio]").on("change", function(e) {
        var container = $("#multiple-route-container");
        var ways = $(".route-list").find(".way-item-container");
        var routeControls = container.find('.route-controls');

        switch ($(this).val()) {
            case "roundtrip":
                $('.returning-date-container').show('slow');
                ways.not(":first").slideUp('slow');
                routeControls.hide('slow');
                break;
            case "oneway":
                $('.returning-date-container').hide('slow');
                ways.not(":first").slideUp('slow');
                routeControls.hide('slow');
                break;
            case "multiple":
                $('.returning-date-container').hide('slow');
                ways.slideDown('slow');
                routeControls.show('slow');
                break;
        }
    });

    $(".order-form-flight").find(".way-item-container").each(function(index, element) {
        initializeWayContainer($(element));
    });

    initializeMap('map-widget-container');
    
});