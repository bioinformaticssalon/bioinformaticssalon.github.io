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
    $('body').click(unclick_cal_event);
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
    html.data('info', event);
    $('.events').append(html);
  }
}

// returns sorted list of future events
function filter_events(events){
  var result = [];
  var ids = {};
  for (var e in events){
    var event = events[e];
    if (event.status != 'confirmed'){
      continue;
    }
    var start = event.start.date;
    if (start == undefined){
      event.allDay = false;
      event.sortDate = new Date(event.start.dateTime);
    } else {
      event.allDay = true;
      var ymd = start.split('-');
      event.sortDate = new Date(ymd[0], ymd[1]-1, ymd[2]);
    }
  }
  var now = new Date();
  for (var ee in events){
    var event = events[ee];
    if (event.status == 'confirmed' && event.sortDate > now && ids[event.id] == undefined){
      result.push(event);
      ids[event.id] = event;
    }
  }
  result.sort(function(a,b){return a.sortDate - b.sortDate;});
  return result;
}

// render event to html

function render_event(event){
  var box = $('<div/>').addClass('event')
                       .append(render_date_box(event.sortDate), event.summary)
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
var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function render_date(date){
  var day = DAYS[date.getDay()];
  var ddate = date.getDate();
  var month = MONTHS[date.getMonth()];
  var year = date.getFullYear();
  return day + ', ' + month + ' ' + ddate + ', ' + year;
}

function render_date_box(date){
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
  $('.details').css({top: event.offsetTop, left: event.offsetLeft + event.offsetWidth})
               .html(render_cal_details($(event))).show();
}

function hide_cal_details(e){
  if (is_stuck()){
    return;
  }
  $('.event').removeClass('selected');
  $('.details').hide();
}

function render_description(text){
  var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
  var r = text.replace(urlPattern, '<a href="$&">$&</a>');
  return r;
}

function render_cal_details(event){
  var info = event.data('info');
  var date = render_date(new Date(info.sortDate));
  var body = [$('<div/>').addClass('title').html(info.summary),
	      $('<div/>').addClass('date').html(date)
	     ];
  if (!info.allDay){
    var time = render_event_time(info);
    body.push($('<div/>').addClass('time').html(time));
  }
  if (info.location != undefined){
    body.push($('<div/>').addClass('location').html(info.location));
  }
  if (info.description != undefined){
    body.push($('<hr/>'));
    body.push($('<div/>').addClass('description').html(render_description(info.description)));
  }
  return $('<div/>').append(body);
}

