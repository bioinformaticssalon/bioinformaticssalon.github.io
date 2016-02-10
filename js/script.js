$(document).ready(init_page);

function init_page(){
  $('.otd-logo').click(function(){visit_page('http://otd.harvard.edu');});
  $('.dbmi-logo-block').click(function(){visit_page('http://dbmi.hms.harvard.edu');});
  $('.signup .frame1 .btn').click(signup_frame2);
  $('.signup .frame2 .btn.cancel').click(signup_frame1);
  $('.signup .frame2 .btn.addme').click(on_submit);
  $('.signup .frame3 .btn.ok').click(signup_frame1);
  $('body').click(unclick_cal_event);
  init_dna();
}

function visit_page(page){
  window.location=page;
}

function init_dna(){
  var bases = ["A","G","C","T"];
  var frag = document.createDocumentFragment();
  for (var i = 0; i < 300; i++) {
    var item = document.createElement('span');
    var e = Math.floor(Math.random()*4);
    var base = bases[e];
    item.innerHTML = base;
    item.className += " " + base;
    frag.appendChild(item);
  }
  var dna = document.getElementById('dna');
  dna.appendChild(frag);
}

// signup form on meetings.html page

GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbx0kKc00sXf_itWJBb9aVaeEFn1WTLo-PwPcmP5dO92oBL819F8/exec';

function signup_frame1(){
  $('.signup .frame1').show(200);
  $('.signup .frame2').hide(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame2(){
  $('.signup .frame2 input').val('');
  $('.signup .frame1').hide(200);
  $('.signup .frame2').show(200);
  $('.signup .frame3').hide(200);
  return false;
}

function signup_frame3(result){
  console.log('f3 result', result);
  $('.signup .frame1').hide(200);
  $('.signup .frame2').hide(200);
  if (result == 'success'){
    console.log('win', result);
    $('.signup .frame3 .success').show();
    $('.signup .frame3 .fail').hide();
  } else {
    console.log('lose', result);
    $('.signup .frame3 .fail').show();
    $('.signup .frame3 .fail .reason').html(result);
    $('.signup .frame3 .success').hide();
  }
  $('.signup .frame3').show(200);
  return false;
}

function validateEmail(email) {
  var re = /(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return re.test(email);
}

function on_submit(e){
  var email = $('form input#email').val();
  if (!validateEmail(email)){
    callback({result: '"' + email + '" doesn\'t seem to be a valid email address.'});
  } else {
    var data = {email: email, prefix: 'callback'};
    $.ajax({url: GOOGLE_URL,
	    errora: function(a, b, c){
	      var msg = 'Unable to connect. If the problem persists, please ';
	      msg += '<a href="mailto:' + ADMIN_EMAIL + '">contact us</a>.';
	      console.log('error', a, b, c);
	      signup_frame3(msg);
	    },
	  data: data,
	  jsonp: 'callback',
	  dataType: 'jsonp',
	  success: callback
	 });
    return false;    // e.preventDefault
  }
}

function callback(result){
  console.log('Callback result', result);
  var escaped = $("<div>").text(result.result).html();
  signup_frame3(escaped);
}

//-------------------
// Calendar

$(document).ready(get_calendar);

var CAL_ID = 'bv777tm2f6k9tim5m9k7jqprak@group.calendar.google.com';
var KEY = 'AIzaSyCVQOLsT_TfacT9ze5zwQ5ahhA96fxWJPk';
var CAL_URL = 'https://www.googleapis.com/calendar/v3/calendars/'+CAL_ID+'/events?key='+KEY;
var CALENDAR = 'https://calendar.google.com/calendar/embed?src='+CAL_ID+'&ctz=America/New_York';
var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];


// Only get calendar if page has a <div class="events"/>
function get_calendar(){
  if ($('.events').length){
    $.ajax({url: CAL_URL, success: expand_instances});
  } else {
    console.log('nope'); // Page doesn't need any events, so don't fetch any.
  }
}

// Result contains GoogleCal Events. An event may contain repeats.
// https://developers.google.com/google-apps/calendar/v3/reference/events
// Runs asynchronously.
// For each recurring event, fires an ajax call to expand it into instances.
function expand_instances(result){
  var events = result.items;
  var all_events = []; // will hold instances of recurring events
  var ajaxes = [];     // will hold all pending expansions
  for (var i in events){
    var event = events[i];
    if (event.recurrence != undefined){
      // if recurring, go expand them
      ajaxes.push(get_instances(event, function(i){all_events.push(i);}));
    } else {
      all_events.push(event);
    }
  }
  // When all ajaxes are completed, then you can safely process the all_events list.
  $.when.apply(this, ajaxes).done(function(){ show_events(all_events);});
}

// Expand event into its instances, then call done_fcn on them.
function get_instances(event, done_fcn){
  var url = 'https://www.googleapis.com/calendar/v3/calendars/' + CAL_ID + '/events/' + event.id + '/instances?key='+KEY;
  return $.ajax({url: url, success: function(resp){capture_instances(resp, done_fcn);}});
}

// done_fcn pushes the captured instances onto all_events.
function capture_instances(resp, done_fcn){
  for (var i in resp.items){
    var instance = resp.items[i];
    done_fcn(instance);
  }
}

// sort and prepare events, then add them to page's <div class="events">
function show_events(raw_events){
  var events = filter_events(raw_events);
  for (var e in events){
    var event = events[e];
    var html = render_event(event);
    $('.events').append(html);
  }
}

// returns sorted list of future events
function filter_events(events){
  var result = [];
  for (var e in events){
    var event = events[e];
    var start = event.start.date;
    if (start == undefined){
      event.allDay = false;
      event.sortDate = new Date(event.start.dateTime);
    } else {
      event.allDay = true;
      var ymd = start.split('-');
      event.sortDate = new Date(ymd[0], ymd[1]-1, ymd[2]);
    }
    events.sort(function(a,b){return a.sortDate - b.sortDate;});
  }
  var now = new Date();
  for (var ee in events){
    var event = events[ee];
    if (event.sortDate > now){  // Exclude past events
      result.push(event);
    }
  }
  return result;
}

// render event to html

function render_event(event){
  var box = $('<div/>').addClass('event')
                       .append(render_date(event.sortDate), event.summary)
		       .click(click_cal_event)
                       .hover(show_cal_details, hide_cal_details);

  if (!event.allDay){
    box.append(render_event_time(event));
  }
  return box;
}

function render_event_time(event){
  var start = new Date(event.start.dateTime);
  var end = new Date(event.end.dateTime);
  return $('<span/>').addClass('time').text(render_time(start)+'-'+render_time(end));
}

function render_time(t){
  var h = t.getHours();
  if (h > 12){
    h = h-12;
    return h+':'+t.getMinutes()+'pm';
  } else {
    return h+':'+t.getMinutes()+'am';
  }
}

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function render_date(date){
  var day = date.getDate();
  var month = MONTHS[date.getMonth()];
  var box = $('<div/>').addClass('calendar_box').append($('<div/>').addClass('upper').text(month),
							$('<div/>').addClass('lower').text(day));
  return box;
}

// selects the current event by turning its 'sticky' property on
function click_cal_event(e){
  unclick_cal_event();
  var event = e.target;
  show_cal_details(e);
  $(event).data('sticky', true);
  return false;
}

function unclick_cal_event(e){
  $('.event').removeData('sticky');
  hide_cal_details(e);
}

// return true if any event is stuck on, otherwise returns false
function is_stuck(){
  return $('.event').filter(function(i, e){ return $(e).data('sticky');}).length;
}

function show_cal_details(e){
  if (is_stuck()){
    return;
  }
  var event = e.target;
  $(event).addClass('selected');
  $('.details').css({top: event.offsetTop, left: event.offsetLeft + event.offsetWidth}).show();
}

function hide_cal_details(e){
  if (is_stuck()){
    return;
  }
  $('.event').removeClass('selected');
  $('.details').hide();
}

